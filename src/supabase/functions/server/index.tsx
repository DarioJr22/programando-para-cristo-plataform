import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as bcrypt from 'npm:bcryptjs';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper: Generate UUID
const generateId = () => crypto.randomUUID();

// Helper: Hash password
const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

// Helper: Verify password
const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

// Helper: Generate token
const generateToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// ============================================
// AUTH ROUTES
// ============================================

// Signup
app.post('/make-server-fe860986/auth/signup', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    // Validate
    if (!name || !email || !password) {
      return c.json({ error: 'Campos obrigatórios faltando' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'Senha deve ter no mínimo 8 caracteres' }, 400);
    }

    // Check if email already exists
    const existingUserData = await kv.get(`user-email:${email}`);
    if (existingUserData) {
      return c.json({ error: 'Email já cadastrado' }, 409);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server not configured
      user_metadata: { name }
    });

    if (error) {
      console.log('Supabase auth error:', error);
      return c.json({ error: 'Erro ao criar usuário' }, 500);
    }

    const userId = data.user.id;
    const now = new Date().toISOString();

    // Store user data in KV
    const userData = {
      id: userId,
      email,
      name,
      role: 'student',
      status: 'active',
      emailVerified: true,
      avatar: null,
      bio: null,
      username: null,
      studentData: {
        level: 'iniciante',
        completedChallenges: 0,
        articlesRead: 0,
        joinedAt: now,
        lastLoginAt: now,
        streak: 0,
        totalPoints: 0
      },
      preferences: {
        theme: 'system',
        emailNotifications: true,
        newsletterSubscribed: false,
        favoriteCategories: []
      },
      createdAt: now,
      updatedAt: now
    };

    await kv.set(`users:${userId}`, userData);
    await kv.set(`user-email:${email}`, userId);

    return c.json({ 
      success: true, 
      message: 'Cadastro realizado com sucesso!',
      userId 
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Login
app.post('/make-server-fe860986/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email e senha são obrigatórios' }, 400);
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return c.json({ error: 'Email ou senha incorretos' }, 401);
    }

    const userId = data.user.id;
    const accessToken = data.session.access_token;

    // Get user data
    const userData = await kv.get(`users:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    // Update last login
    userData.studentData.lastLoginAt = new Date().toISOString();
    await kv.set(`users:${userId}`, userData);

    return c.json({
      success: true,
      accessToken,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar
      }
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// Get current user
app.get('/make-server-fe860986/auth/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    return c.json({ user: userData });
  } catch (error) {
    console.log('Get me error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// ARTICLES ROUTES
// ============================================

// Get all articles (public)
app.get('/make-server-fe860986/articles', async (c) => {
  try {
    const category = c.req.query('category');
    const level = c.req.query('level');
    const search = c.req.query('search');
    const page = parseInt(c.req.query('page') || '1');
    const limit = 12;

    // Get all articles
    const allArticles = await kv.getByPrefix('articles:');
    
    // Filter published articles
    let articles = allArticles
      .filter(a => a.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Apply filters
    if (category && category !== 'todos') {
      articles = articles.filter(a => a.category === category);
    }

    if (level) {
      articles = articles.filter(a => a.level === level);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.excerpt.toLowerCase().includes(searchLower) ||
        a.tags.some((t: string) => t.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const total = articles.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedArticles = articles.slice(offset, offset + limit);

    return c.json({
      articles: paginatedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.log('Get articles error:', error);
    return c.json({ error: 'Erro ao buscar artigos' }, 500);
  }
});

// Get single article by slug (public)
app.get('/make-server-fe860986/articles/:slug', async (c) => {
  try {
    const slug = c.param('slug');
    
    // Get articleId from slug index
    const articleId = await kv.get(`article-slug:${slug}`);
    if (!articleId) {
      return c.json({ error: 'Artigo não encontrado' }, 404);
    }

    // Get article
    const article = await kv.get(`articles:${articleId}`);
    if (!article || article.status !== 'published') {
      return c.json({ error: 'Artigo não encontrado' }, 404);
    }

    // Increment views
    article.views = (article.views || 0) + 1;
    await kv.set(`articles:${articleId}`, article);

    return c.json({ article });
  } catch (error) {
    console.log('Get article error:', error);
    return c.json({ error: 'Erro ao buscar artigo' }, 500);
  }
});

// Create article (admin only)
app.post('/make-server-fe860986/articles', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const articleData = await c.req.json();
    const articleId = generateId();
    const now = new Date().toISOString();

    const article = {
      id: articleId,
      ...articleData,
      views: 0,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: articleData.status === 'published' ? now : null
    };

    await kv.set(`articles:${articleId}`, article);
    await kv.set(`article-slug:${article.slug}`, articleId);

    return c.json({ success: true, article });
  } catch (error) {
    console.log('Create article error:', error);
    return c.json({ error: 'Erro ao criar artigo' }, 500);
  }
});

// Update article (admin only)
app.put('/make-server-fe860986/articles/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const articleId = c.param('id');
    const article = await kv.get(`articles:${articleId}`);
    
    if (!article) {
      return c.json({ error: 'Artigo não encontrado' }, 404);
    }

    const updates = await c.req.json();
    const updatedArticle = {
      ...article,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Update slug index if slug changed
    if (updates.slug && updates.slug !== article.slug) {
      await kv.del(`article-slug:${article.slug}`);
      await kv.set(`article-slug:${updates.slug}`, articleId);
    }

    await kv.set(`articles:${articleId}`, updatedArticle);

    return c.json({ success: true, article: updatedArticle });
  } catch (error) {
    console.log('Update article error:', error);
    return c.json({ error: 'Erro ao atualizar artigo' }, 500);
  }
});

// Delete article (admin only)
app.delete('/make-server-fe860986/articles/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const articleId = c.param('id');
    const article = await kv.get(`articles:${articleId}`);
    
    if (!article) {
      return c.json({ error: 'Artigo não encontrado' }, 404);
    }

    await kv.del(`articles:${articleId}`);
    await kv.del(`article-slug:${article.slug}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete article error:', error);
    return c.json({ error: 'Erro ao deletar artigo' }, 500);
  }
});

// ============================================
// CHALLENGES ROUTES
// ============================================

// Get all challenges (requires auth)
app.get('/make-server-fe860986/challenges', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const level = c.req.query('level');
    const technology = c.req.query('technology');
    
    // Get all challenges
    let challenges = await kv.getByPrefix('challenges:');
    
    // Filter published challenges
    challenges = challenges
      .filter(c => c.status === 'published')
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Apply filters
    if (level && level !== 'todos') {
      challenges = challenges.filter(c => c.level === level);
    }

    if (technology && technology !== 'todos') {
      challenges = challenges.filter(c => 
        c.technologies.includes(technology)
      );
    }

    return c.json({ challenges });
  } catch (error) {
    console.log('Get challenges error:', error);
    return c.json({ error: 'Erro ao buscar desafios' }, 500);
  }
});

// Get single challenge (requires auth)
app.get('/make-server-fe860986/challenges/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const challengeId = c.param('id');
    const challenge = await kv.get(`challenges:${challengeId}`);
    
    if (!challenge || challenge.status !== 'published') {
      return c.json({ error: 'Desafio não encontrado' }, 404);
    }

    // Increment views
    challenge.views = (challenge.views || 0) + 1;
    await kv.set(`challenges:${challengeId}`, challenge);

    return c.json({ challenge });
  } catch (error) {
    console.log('Get challenge error:', error);
    return c.json({ error: 'Erro ao buscar desafio' }, 500);
  }
});

// Create challenge (admin only)
app.post('/make-server-fe860986/challenges', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const challengeData = await c.req.json();
    const challengeId = generateId();
    const now = new Date().toISOString();

    const challenge = {
      id: challengeId,
      ...challengeData,
      views: 0,
      likes: 0,
      commentsCount: 0,
      demoClicks: 0,
      codeClicks: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: challengeData.status === 'published' ? now : null
    };

    await kv.set(`challenges:${challengeId}`, challenge);

    return c.json({ success: true, challenge });
  } catch (error) {
    console.log('Create challenge error:', error);
    return c.json({ error: 'Erro ao criar desafio' }, 500);
  }
});

// Update challenge (admin only)
app.put('/make-server-fe860986/challenges/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const challengeId = c.param('id');
    const challenge = await kv.get(`challenges:${challengeId}`);
    
    if (!challenge) {
      return c.json({ error: 'Desafio não encontrado' }, 404);
    }

    const updates = await c.req.json();
    const updatedChallenge = {
      ...challenge,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`challenges:${challengeId}`, updatedChallenge);

    return c.json({ success: true, challenge: updatedChallenge });
  } catch (error) {
    console.log('Update challenge error:', error);
    return c.json({ error: 'Erro ao atualizar desafio' }, 500);
  }
});

// Delete challenge (admin only)
app.delete('/make-server-fe860986/challenges/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const challengeId = c.param('id');
    await kv.del(`challenges:${challengeId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete challenge error:', error);
    return c.json({ error: 'Erro ao deletar desafio' }, 500);
  }
});

// ============================================
// LIKES ROUTES
// ============================================

// Toggle like (requires auth)
app.post('/make-server-fe860986/likes/toggle', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { contentType, contentId } = await c.req.json();
    const likeKey = `likes:${contentType}:${contentId}:${user.id}`;
    const contentKey = contentType === 'article' ? `articles:${contentId}` : `challenges:${contentId}`;

    // Check if already liked
    const existingLike = await kv.get(likeKey);
    const content = await kv.get(contentKey);

    if (!content) {
      return c.json({ error: 'Conteúdo não encontrado' }, 404);
    }

    if (existingLike) {
      // Unlike
      await kv.del(likeKey);
      content.likes = Math.max(0, (content.likes || 0) - 1);
      await kv.set(contentKey, content);
      return c.json({ liked: false, likes: content.likes });
    } else {
      // Like
      await kv.set(likeKey, {
        userId: user.id,
        contentType,
        contentId,
        createdAt: new Date().toISOString()
      });
      content.likes = (content.likes || 0) + 1;
      await kv.set(contentKey, content);
      return c.json({ liked: true, likes: content.likes });
    }
  } catch (error) {
    console.log('Toggle like error:', error);
    return c.json({ error: 'Erro ao curtir' }, 500);
  }
});

// Check if user liked content
app.get('/make-server-fe860986/likes/check', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ liked: false });
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ liked: false });
    }

    const contentType = c.req.query('contentType');
    const contentId = c.req.query('contentId');
    const likeKey = `likes:${contentType}:${contentId}:${user.id}`;

    const liked = await kv.get(likeKey);
    return c.json({ liked: !!liked });
  } catch (error) {
    return c.json({ liked: false });
  }
});

// ============================================
// COMMENTS ROUTES
// ============================================

// Get comments for content (public)
app.get('/make-server-fe860986/comments/:contentType/:contentId', async (c) => {
  try {
    const contentType = c.param('contentType');
    const contentId = c.param('contentId');

    const allComments = await kv.getByPrefix(`comments:${contentType}:${contentId}:`);
    const approvedComments = allComments
      .filter(comment => comment.status === 'approved')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ comments: approvedComments });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: 'Erro ao buscar comentários' }, 500);
  }
});

// Create comment (requires auth)
app.post('/make-server-fe860986/comments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    const { contentType, contentId, content } = await c.req.json();

    if (!content || content.trim().length < 10) {
      return c.json({ error: 'Comentário muito curto (mínimo 10 caracteres)' }, 400);
    }

    const commentId = generateId();
    const comment = {
      id: commentId,
      contentType,
      contentId,
      content,
      authorId: user.id,
      authorName: userData.name,
      authorAvatar: userData.avatar,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(`comments:${contentType}:${contentId}:${commentId}`, comment);

    // Increment comment count
    const contentKey = contentType === 'article' ? `articles:${contentId}` : `challenges:${contentId}`;
    const contentData = await kv.get(contentKey);
    if (contentData) {
      contentData.commentsCount = (contentData.commentsCount || 0) + 1;
      await kv.set(contentKey, contentData);
    }

    return c.json({ 
      success: true, 
      message: 'Comentário enviado para moderação',
      comment 
    });
  } catch (error) {
    console.log('Create comment error:', error);
    return c.json({ error: 'Erro ao criar comentário' }, 500);
  }
});

// Get all pending comments (admin only)
app.get('/make-server-fe860986/comments/pending', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const allComments = await kv.getByPrefix('comments:');
    const pendingComments = allComments
      .filter(c => c.status === 'pending')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ comments: pendingComments });
  } catch (error) {
    console.log('Get pending comments error:', error);
    return c.json({ error: 'Erro ao buscar comentários pendentes' }, 500);
  }
});

// Moderate comment (admin only)
app.put('/make-server-fe860986/comments/:contentType/:contentId/:commentId/moderate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const contentType = c.param('contentType');
    const contentId = c.param('contentId');
    const commentId = c.param('commentId');
    const { action } = await c.req.json(); // 'approve' or 'reject'

    const commentKey = `comments:${contentType}:${contentId}:${commentId}`;
    const comment = await kv.get(commentKey);

    if (!comment) {
      return c.json({ error: 'Comentário não encontrado' }, 404);
    }

    comment.status = action === 'approve' ? 'approved' : 'rejected';
    comment.moderatedBy = user.id;
    comment.moderatedAt = new Date().toISOString();

    await kv.set(commentKey, comment);

    return c.json({ success: true, comment });
  } catch (error) {
    console.log('Moderate comment error:', error);
    return c.json({ error: 'Erro ao moderar comentário' }, 500);
  }
});

// ============================================
// NEWSLETTER ROUTES
// ============================================

// Subscribe to newsletter
app.post('/make-server-fe860986/newsletter/subscribe', async (c) => {
  try {
    const { name, email, optInWhatsApp, metadata } = await c.req.json();

    if (!name || !email) {
      return c.json({ error: 'Nome e email são obrigatórios' }, 400);
    }

    // Check if already subscribed
    const existingSubscriber = await kv.get(`newsletter:${email}`);
    if (existingSubscriber && existingSubscriber.status === 'active') {
      return c.json({ error: 'Você já está inscrito!' }, 409);
    }

    const now = new Date().toISOString();

    // Prepare webhook payload for N8N
    const webhookPayload = {
      Nome: name,
      Email: email,
      Origem: metadata.origin,
      Status: 'Novo',
      'Data de Captação': now,
      Interesse: 'Curso',
      'Source URL': metadata.sourceUrl,
      'UTM Campaign': metadata.utmCampaign || null,
      'UTM Source': metadata.utmSource || null,
      'UTM Medium': metadata.utmMedium || null,
      'Opt-in Email': true,
      'Opt-in WhatsApp': optInWhatsApp || false
    };

    // Send to N8N webhook (non-blocking)
    try {
      const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload),
          signal: AbortSignal.timeout(5000)
        });
      }
    } catch (webhookError) {
      console.log('N8N webhook error (non-critical):', webhookError);
      // Continue even if webhook fails
    }

    // Save to local storage
    const subscriber = {
      email,
      name,
      status: 'active',
      source: metadata.origin,
      sourceUrl: metadata.sourceUrl,
      utmCampaign: metadata.utmCampaign,
      utmSource: metadata.utmSource,
      utmMedium: metadata.utmMedium,
      optInWhatsApp: optInWhatsApp || false,
      subscribedAt: now,
      createdAt: now
    };

    await kv.set(`newsletter:${email}`, subscriber);

    return c.json({ 
      success: true, 
      message: 'Inscrição confirmada!' 
    });
  } catch (error) {
    console.log('Newsletter subscribe error:', error);
    return c.json({ error: 'Erro ao inscrever' }, 500);
  }
});

// ============================================
// CONTACT ROUTES
// ============================================

// Submit contact form
app.post('/make-server-fe860986/contact', async (c) => {
  try {
    const { name, email, whatsapp, subject, message } = await c.req.json();

    if (!name || !email || !subject || !message) {
      return c.json({ error: 'Campos obrigatórios faltando' }, 400);
    }

    if (message.length < 20) {
      return c.json({ error: 'Mensagem muito curta (mínimo 20 caracteres)' }, 400);
    }

    const contactId = generateId();
    const contact = {
      id: contactId,
      name,
      email,
      whatsapp: whatsapp || null,
      subject,
      message,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    await kv.set(`contacts:${contactId}`, contact);

    return c.json({ 
      success: true, 
      message: 'Mensagem enviada! Responderei em breve 🙏' 
    });
  } catch (error) {
    console.log('Contact form error:', error);
    return c.json({ error: 'Erro ao enviar mensagem' }, 500);
  }
});

// Get all contacts (admin only)
app.get('/make-server-fe860986/contacts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const contacts = await kv.getByPrefix('contacts:');
    const sortedContacts = contacts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ contacts: sortedContacts });
  } catch (error) {
    console.log('Get contacts error:', error);
    return c.json({ error: 'Erro ao buscar contatos' }, 500);
  }
});

// ============================================
// DASHBOARD ROUTES
// ============================================

// Get student stats
app.get('/make-server-fe860986/dashboard/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);

    return c.json({ 
      stats: userData.studentData 
    });
  } catch (error) {
    console.log('Get stats error:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

// Get admin stats
app.get('/make-server-fe860986/admin/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const userData = await kv.get(`users:${user.id}`);
    if (userData.role !== 'admin') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const articles = await kv.getByPrefix('articles:');
    const challenges = await kv.getByPrefix('challenges:');
    const comments = await kv.getByPrefix('comments:');

    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = articles.reduce((sum, a) => sum + (a.likes || 0), 0);
    const pendingComments = comments.filter(c => c.status === 'pending').length;

    return c.json({ 
      stats: {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        totalChallenges: challenges.length,
        publishedChallenges: challenges.filter(c => c.status === 'published').length,
        totalViews,
        totalLikes,
        pendingComments
      }
    });
  } catch (error) {
    console.log('Get admin stats error:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/make-server-fe860986/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
