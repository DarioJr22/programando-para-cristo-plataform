import React, { useEffect, useState } from 'react';
import { Heart, Share2, Clock, ChevronRight, MessageCircle, Send } from 'lucide-react';
import { fetchAPI } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

export function ArticlePage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    loadArticle();
    loadComments();
    if (user) {
      checkIfLiked();
    }

    // Scroll spy for table of contents
    const handleScroll = () => {
      const headings = document.querySelectorAll('h2[id], h3[id]');
      const scrollPosition = window.scrollY + 100;

      headings.forEach((heading) => {
        const element = heading as HTMLElement;
        if (element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
          setActiveSection(element.id);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [slug, user]);

  async function loadArticle() {
    try {
      const response = await fetchAPI(`/articles/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
        setLikesCount(data.article.likes || 0);
      } else {
        // Article not found
        window.location.href = '/blog';
      }
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const response = await fetchAPI(`/comments/article/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  async function checkIfLiked() {
    try {
      const response = await fetchAPI(`/likes/check?contentType=article&contentId=${slug}`);
      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
      }
    } catch (error) {
      console.error('Error checking like:', error);
    }
  }

  async function toggleLike() {
    if (!user) {
      window.location.href = `/login?redirect=/artigo/${slug}`;
      return;
    }

    try {
      const response = await fetchAPI('/likes/toggle', {
        method: 'POST',
        body: JSON.stringify({
          contentType: 'article',
          contentId: article.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setLikesCount(data.likes);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      window.location.href = `/login?redirect=/artigo/${slug}`;
      return;
    }

    if (commentText.trim().length < 10) {
      alert('Comentário muito curto (mínimo 10 caracteres)');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetchAPI('/comments', {
        method: 'POST',
        body: JSON.stringify({
          contentType: 'article',
          contentId: article.id,
          content: commentText,
        }),
      });

      if (response.ok) {
        setCommentText('');
        alert('Comentário enviado para moderação!');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Erro ao enviar comentário');
    } finally {
      setSubmittingComment(false);
    }
  }

  function shareArticle(method: string) {
    const url = window.location.href;
    const text = article.title;

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copiado!');
        break;
    }

    // Track share event
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'article_share', {
        article_id: article.id,
        method,
      });
    }
  }

  // Extract headings for table of contents
  function extractHeadings() {
    if (!article?.content) return [];
    
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const headings: Array<{ level: number; text: string; id: string }> = [];
    let match;

    while ((match = headingRegex.exec(article.content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headings.push({ level, text, id });
    }

    return headings;
  }

  // Render markdown content (simplified)
  function renderContent(content: string) {
    if (!content) return '';

    // Convert headings to have IDs
    content = content.replace(/^(#{2,3})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return `<h${level} id="${id}">${text}</h${level}>`;
    });

    // Convert bold
    content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic
    content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Convert links
    content = content.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>');
    
    // Convert code blocks
    content = content.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>');
    
    // Convert inline code
    content = content.replace(/`(.+?)`/g, '<code class="bg-gray-100 text-red-600 px-2 py-0.5 rounded text-sm">$1</code>');
    
    // Convert paragraphs
    content = content.replace(/^(?!<[hpuol]|```)(.+)$/gm, '<p class="mb-4">$1</p>');

    return content;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const headings = extractHeadings();
  const categoryColors: Record<string, string> = {
    aulas: 'bg-blue-100 text-blue-700',
    fe: 'bg-purple-100 text-purple-700',
    carreira: 'bg-green-100 text-green-700',
    comunidade: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">Início</a>
            <ChevronRight className="w-4 h-4" />
            <a href="/blog" className="hover:text-blue-600">Blog</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{article.title}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Table of Contents (Desktop) */}
          {headings.length > 0 && (
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-20 bg-white rounded-xl shadow-md p-6">
                <h3 className="text-sm text-gray-900 mb-4">Sumário</h3>
                <nav className="space-y-2">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`block text-sm ${
                        heading.level === 3 ? 'pl-4' : ''
                      } ${
                        activeSection === heading.id
                          ? 'text-blue-600'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article Content */}
          <article className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Cover Image */}
              {article.coverImage && (
                <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Header */}
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-3 py-1 rounded ${categoryColors[article.category] || 'bg-gray-100 text-gray-700'}`}>
                    {article.category}
                  </span>
                  {article.level && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded">
                      {article.level}
                    </span>
                  )}
                  <span className="text-sm text-gray-500 flex items-center gap-1 ml-auto">
                    <Clock className="w-4 h-4" />
                    {article.readTime || 5} min de leitura
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl text-gray-900 mb-4">
                  {article.title}
                </h1>

                <p className="text-xl text-gray-600 mb-6">
                  {article.excerpt}
                </p>

                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                      {article.author?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="text-sm text-gray-900">{article.author?.name || 'Autor'}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={toggleLike}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        liked
                          ? 'bg-red-50 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                      {likesCount}
                    </button>

                    <div className="relative group">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <Share2 className="w-5 h-5" />
                        Compartilhar
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <button
                          onClick={() => shareArticle('whatsapp')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                        >
                          WhatsApp
                        </button>
                        <button
                          onClick={() => shareArticle('twitter')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Twitter
                        </button>
                        <button
                          onClick={() => shareArticle('facebook')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Facebook
                        </button>
                        <button
                          onClick={() => shareArticle('linkedin')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          LinkedIn
                        </button>
                        <button
                          onClick={() => shareArticle('copy')}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-lg"
                        >
                          Copiar link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
                />

                {/* Verse */}
                {article.verse && (
                  <div className="mt-12 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">📖</div>
                      <div>
                        <p className="text-lg text-gray-700 italic mb-2">
                          {article.verse.text || article.verse}
                        </p>
                        <p className="text-sm text-gray-600">
                          — {article.verse.reference || 'Bíblia Sagrada'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Comentários ({comments.length})
              </h3>

              {user ? (
                <form onSubmit={submitComment} className="mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Deixe seu comentário..."
                    minLength={10}
                    rows={4}
                    disabled={submittingComment}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">Mínimo 10 caracteres</p>
                    <button
                      type="submit"
                      disabled={submittingComment || commentText.length < 10}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {submittingComment ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <p className="text-gray-700 mb-4">
                    Faça login para comentar e interagir com a comunidade
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href={`/login?redirect=/artigo/${slug}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Login
                    </a>
                    <a
                      href="/registro"
                      className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Criar Conta
                    </a>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {comment.authorName?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-gray-900">{comment.authorName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Seja o primeiro a comentar! 💬
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
