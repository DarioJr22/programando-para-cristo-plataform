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

// Helper: Calculate level and rank based on points
const calculateLevelAndRank = (points: number) => {
  let rank = 'Madeira';
  if (points >= 10000) rank = 'Diamante';
  else if (points >= 5000) rank = 'Ouro';
  else if (points >= 2000) rank = 'Prata';
  else if (points >= 500) rank = 'Bronze';

  const level = Math.floor(points / 100) + 1;
  return { rank, level };
};

// Signup
app.post('/auth/signup', async (c) => {
  try {
    const { name, email, password, role = 'student', secretCode } = await c.req.json();

    // Validate
    if (!name || !email || !password) {
      return c.json({ error: 'Campos obrigatórios faltando' }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: 'Senha deve ter no mínimo 8 caracteres' }, 400);
    }

    // Validate role
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return c.json({ error: 'Role inválido' }, 400);
    }

    // Secret code validation for teacher/admin
    const SECRET_CODE = 'ישוע המשיח הוא אדון';
    if ((role === 'teacher' || role === 'admin') && secretCode !== SECRET_CODE) {
      return c.json({ error: 'Código secreto inválido para este tipo de conta' }, 403);
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
      user_metadata: { name, role }
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
      role: role,
      status: 'active',
      emailVerified: true,
      avatar: null,
      bio: null,
      username: null,
      gamification: {
        points: 0,
        level: 1,
        rank: 'Madeira',
        completedChallenges: 0,
        articlesPublished: 0,
        articlesRead: 0,
        commentsApproved: 0,
        likesReceived: 0,
        streak: 0,
        lastActivityDate: now,
        achievements: []
      },
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
app.post('/auth/login', async (c) => {
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
app.get('/auth/me', async (c) => {
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

    // Return simplified user data for frontend
    return c.json({ 
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar: userData.avatar,
        level: userData.gamification?.level || 1,
        points: userData.gamification?.points || 0,
        rank: userData.gamification?.rank || 'Madeira'
      }
    });
  } catch (error) {
    console.log('Get me error:', error);
    return c.json({ error: 'Erro interno do servidor' }, 500);
  }
});

// ============================================
// ARTICLES ROUTES
// ============================================

// Get all articles (public)
app.get('/articles', async (c) => {
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
app.get('/articles/:slug', async (c) => {
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

// Create article (teacher and admin can publish, students can create drafts)
app.post('/articles', async (c) => {
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
    
    const articleData = await c.req.json();
    const articleId = generateId();
    const now = new Date().toISOString();

    // Students can only create drafts
    let status = articleData.status;
    if (userData.role === 'student') {
      status = 'draft';
    }

    const article = {
      id: articleId,
      ...articleData,
      status,
      authorId: user.id,
      authorName: userData.name,
      views: 0,
      likes: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: status === 'published' ? now : null
    };

    await kv.set(`articles:${articleId}`, article);
    await kv.set(`article-slug:${article.slug}`, articleId);

    // Award points for publishing article (teachers and admins only)
    if (status === 'published' && (userData.role === 'teacher' || userData.role === 'admin')) {
      userData.gamification.points += 100;
      userData.gamification.articlesPublished += 1;
      const { rank, level } = calculateLevelAndRank(userData.gamification.points);
      userData.gamification.rank = rank;
      userData.gamification.level = level;
      await kv.set(`users:${user.id}`, userData);
    }

    return c.json({ success: true, article });
  } catch (error) {
    console.log('Create article error:', error);
    return c.json({ error: 'Erro ao criar artigo' }, 500);
  }
});

// Update article (admin, teacher can edit own, student can edit own drafts)
app.put('/articles/:id', async (c) => {
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
    const articleId = c.param('id');
    const article = await kv.get(`articles:${articleId}`);
    
    if (!article) {
      return c.json({ error: 'Artigo não encontrado' }, 404);
    }

    // Check permissions
    const isAdmin = userData.role === 'admin';
    const isOwner = article.authorId === user.id;
    
    if (!isAdmin && !isOwner) {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const updates = await c.req.json();
    
    // Students can't publish directly
    if (userData.role === 'student' && updates.status === 'published') {
      updates.status = 'draft';
    }

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
app.delete('/articles/:id', async (c) => {
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
app.get('/challenges', async (c) => {
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
app.get('/challenges/:id', async (c) => {
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

// Create challenge (teacher and admin can create)
app.post('/challenges', async (c) => {
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
    if (userData.role !== 'admin' && userData.role !== 'teacher') {
      return c.json({ error: 'Sem permissão' }, 403);
    }

    const challengeData = await c.req.json();
    const challengeId = generateId();
    const now = new Date().toISOString();

    const challenge = {
      id: challengeId,
      ...challengeData,
      authorId: user.id,
      authorName: userData.name,
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

    // Award points for creating challenge
    if (challengeData.status === 'published') {
      userData.gamification.points += 150;
      const { rank, level } = calculateLevelAndRank(userData.gamification.points);
      userData.gamification.rank = rank;
      userData.gamification.level = level;
      await kv.set(`users:${user.id}`, userData);
    }

    return c.json({ success: true, challenge });
  } catch (error) {
    console.log('Create challenge error:', error);
    return c.json({ error: 'Erro ao criar desafio' }, 500);
  }
});

// Update challenge (admin only)
app.put('/challenges/:id', async (c) => {
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
app.delete('/challenges/:id', async (c) => {
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
app.post('/likes/toggle', async (c) => {
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
app.get('/likes/check', async (c) => {
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
app.get('/comments/:contentType/:contentId', async (c) => {
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
app.post('/comments', async (c) => {
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
app.get('/comments/pending', async (c) => {
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
app.put('/comments/:contentType/:contentId/:commentId/moderate', async (c) => {
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
app.post('/newsletter/subscribe', async (c) => {
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
      'date:Data de Captação:start': now.split('T')[0],
      Interesse: 'Curso',
      'Source URL': metadata.sourceUrl,
      'UTM Campaign': metadata.utmCampaign || null,
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
app.post('/contact', async (c) => {
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
app.get('/contacts', async (c) => {
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
// GAMIFICATION ROUTES
// ============================================

// Submit challenge completion
app.post('/gamification/complete-challenge', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { challengeId } = await c.req.json();
    const userData = await kv.get(`users:${user.id}`);
    const challenge = await kv.get(`challenges:${challengeId}`);

    if (!challenge) {
      return c.json({ error: 'Desafio não encontrado' }, 404);
    }

    // Check if already completed
    const completionKey = `challenge-completion:${user.id}:${challengeId}`;
    const existingCompletion = await kv.get(completionKey);
    
    if (existingCompletion) {
      return c.json({ error: 'Desafio já completado' }, 409);
    }

    // Award points based on challenge difficulty
    let points = 50; // base points
    if (challenge.level === 'intermediário') points = 75;
    if (challenge.level === 'avançado') points = 100;

    userData.gamification.points += points;
    userData.gamification.completedChallenges += 1;
    
    const { rank, level } = calculateLevelAndRank(userData.gamification.points);
    userData.gamification.rank = rank;
    userData.gamification.level = level;

    // Save completion
    await kv.set(completionKey, {
      userId: user.id,
      challengeId,
      completedAt: new Date().toISOString(),
      pointsEarned: points
    });

    await kv.set(`users:${user.id}`, userData);

    return c.json({ 
      success: true, 
      pointsEarned: points,
      totalPoints: userData.gamification.points,
      newLevel: level,
      newRank: rank
    });
  } catch (error) {
    console.log('Complete challenge error:', error);
    return c.json({ error: 'Erro ao completar desafio' }, 500);
  }
});

// Read article (award points for reading)
app.post('/gamification/read-article', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { articleId } = await c.req.json();
    const userData = await kv.get(`users:${user.id}`);

    // Check if already read
    const readKey = `article-read:${user.id}:${articleId}`;
    const existingRead = await kv.get(readKey);
    
    if (existingRead) {
      return c.json({ alreadyRead: true });
    }

    // Award 10 points for reading
    userData.gamification.points += 10;
    userData.gamification.articlesRead += 1;
    
    const { rank, level } = calculateLevelAndRank(userData.gamification.points);
    userData.gamification.rank = rank;
    userData.gamification.level = level;

    await kv.set(readKey, {
      userId: user.id,
      articleId,
      readAt: new Date().toISOString()
    });

    await kv.set(`users:${user.id}`, userData);

    return c.json({ 
      success: true, 
      pointsEarned: 10,
      totalPoints: userData.gamification.points
    });
  } catch (error) {
    console.log('Read article error:', error);
    return c.json({ error: 'Erro ao registrar leitura' }, 500);
  }
});

// Get leaderboard
app.get('/gamification/leaderboard', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10');
    const allUsers = await kv.getByPrefix('users:');
    
    const leaderboard = allUsers
      .map(user => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        points: user.gamification?.points || 0,
        level: user.gamification?.level || 1,
        rank: user.gamification?.rank || 'Madeira'
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return c.json({ leaderboard });
  } catch (error) {
    console.log('Get leaderboard error:', error);
    return c.json({ error: 'Erro ao buscar ranking' }, 500);
  }
});

// ============================================
// DASHBOARD ROUTES
// ============================================

// Get student stats
app.get('/dashboard/stats', async (c) => {
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
      stats: {
        ...userData.studentData,
        gamification: userData.gamification
      }
    });
  } catch (error) {
    console.log('Get stats error:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

// Get admin stats (admin only - can see everything)
app.get('/admin/stats', async (c) => {
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
    const users = await kv.getByPrefix('users:');

    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    const totalLikes = articles.reduce((sum, a) => sum + (a.likes || 0), 0);
    const pendingComments = comments.filter(c => c.status === 'pending').length;

    // User stats by role
    const studentCount = users.filter(u => u.role === 'student').length;
    const teacherCount = users.filter(u => u.role === 'teacher').length;
    const adminCount = users.filter(u => u.role === 'admin').length;

    return c.json({ 
      stats: {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.status === 'published').length,
        totalChallenges: challenges.length,
        publishedChallenges: challenges.filter(c => c.status === 'published').length,
        totalViews,
        totalLikes,
        pendingComments,
        totalUsers: users.length,
        studentCount,
        teacherCount,
        adminCount
      }
    });
  } catch (error) {
    console.log('Get admin stats error:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

// Get all users (admin only)
app.get('/admin/users', async (c) => {
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

    const allUsers = await kv.getByPrefix('users:');
    const users = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      points: u.gamification?.points || 0,
      level: u.gamification?.level || 1,
      rank: u.gamification?.rank || 'Madeira',
      createdAt: u.createdAt
    }));

    return c.json({ users });
  } catch (error) {
    console.log('Get users error:', error);
    return c.json({ error: 'Erro ao buscar usuários' }, 500);
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile
app.get('/profile/:userId', async (c) => {
  try {
    const userId = c.param('userId');
    const userData = await kv.get(`users:${userId}`);
    
    if (!userData) {
      return c.json({ error: 'Usuário não encontrado' }, 404);
    }

    // Return public profile data
    return c.json({ 
      profile: {
        id: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        bio: userData.bio,
        username: userData.username,
        role: userData.role,
        gamification: userData.gamification,
        createdAt: userData.createdAt
      }
    });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Erro ao buscar perfil' }, 500);
  }
});

// Update user profile (requires auth)
app.put('/profile', async (c) => {
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

    const updates = await c.req.json();
    
    // Only allow updating certain fields
    const allowedFields = ['name', 'bio', 'username', 'avatar'];
    const filteredUpdates: any = {};
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    }

    // Validate username uniqueness if updating
    if (filteredUpdates.username && filteredUpdates.username !== userData.username) {
      const existingUsername = await kv.get(`username:${filteredUpdates.username}`);
      if (existingUsername && existingUsername !== user.id) {
        return c.json({ error: 'Nome de usuário já está em uso' }, 409);
      }
      
      // Update username index
      if (userData.username) {
        await kv.del(`username:${userData.username}`);
      }
      await kv.set(`username:${filteredUpdates.username}`, user.id);
    }

    const updatedUser = {
      ...userData,
      ...filteredUpdates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`users:${user.id}`, updatedUser);

    return c.json({ 
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        username: updatedUser.username
      }
    });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Erro ao atualizar perfil' }, 500);
  }
});

// Upload avatar (requires auth)
app.post('/profile/avatar', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      return c.json({ error: 'Não autenticado' }, 401);
    }

    const { avatarUrl } = await c.req.json();
    
    if (!avatarUrl) {
      return c.json({ error: 'URL do avatar é obrigatório' }, 400);
    }

    const userData = await kv.get(`users:${user.id}`);
    userData.avatar = avatarUrl;
    userData.updatedAt = new Date().toISOString();
    
    await kv.set(`users:${user.id}`, userData);

    return c.json({ 
      success: true,
      avatarUrl
    });
  } catch (error) {
    console.log('Upload avatar error:', error);
    return c.json({ error: 'Erro ao fazer upload do avatar' }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
