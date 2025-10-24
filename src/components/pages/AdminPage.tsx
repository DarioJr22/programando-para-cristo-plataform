import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { fetchAPI } from '../../lib/supabase';
import { BarChart3, FileText, Target, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'challenges' | 'comments'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadArticles();
    loadChallenges();
    loadPendingComments();
  }, []);

  async function loadStats() {
    try {
      const response = await fetchAPI('/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadArticles() {
    try {
      const response = await fetchAPI('/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    }
  }

  async function loadChallenges() {
    try {
      const response = await fetchAPI('/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  }

  async function loadPendingComments() {
    try {
      const response = await fetchAPI('/comments/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingComments(data.comments);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  }

  async function createSampleArticle() {
    const sampleArticle = {
      title: 'Começando com HTML: Construindo sua Primeira Página Web',
      slug: 'comecando-com-html',
      excerpt: 'Aprenda os fundamentos do HTML e crie sua primeira página web do zero. Um guia completo para iniciantes absolutos.',
      content: `## Introdução

HTML (HyperText Markup Language) é a linguagem de marcação que forma a estrutura de todas as páginas web. Neste tutorial, você vai aprender o básico do HTML e criar sua primeira página!

## O que é HTML?

HTML é uma linguagem de marcação que usa "tags" para estruturar o conteúdo. Cada tag tem um propósito específico.

## Estrutura Básica

Todo documento HTML segue esta estrutura:

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>Minha Primeira Página</title>
  </head>
  <body>
    <h1>Olá, Mundo!</h1>
    <p>Este é meu primeiro parágrafo.</p>
  </body>
</html>
\`\`\`

## Tags Principais

### Headings (Títulos)
Use \`<h1>\` até \`<h6>\` para criar títulos de diferentes níveis.

### Parágrafos
Use \`<p>\` para criar parágrafos de texto.

### Links
Use \`<a href="url">texto</a>\` para criar links.

## Conclusão

Parabéns! Você aprendeu os fundamentos do HTML. Continue praticando e explorando mais tags!`,
      coverImage: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
      category: 'aulas',
      tags: ['HTML', 'Web Development', 'Iniciante'],
      level: 'iniciante',
      author: {
        name: user?.name || 'Admin',
        avatar: null,
        bio: 'Instrutor e desenvolvedor apaixonado por ensinar'
      },
      verse: {
        text: 'Tudo quanto te vier à mão para fazer, faze-o conforme as tuas forças.',
        reference: 'Eclesiastes 9:10a'
      },
      readTime: 8,
      status: 'published',
    };

    try {
      const response = await fetchAPI('/articles', {
        method: 'POST',
        body: JSON.stringify(sampleArticle),
      });

      if (response.ok) {
        alert('Artigo de exemplo criado com sucesso!');
        loadArticles();
        loadStats();
      } else {
        const data = await response.json();
        alert('Erro ao criar artigo: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Erro ao criar artigo');
    }
  }

  async function createSampleChallenge() {
    const sampleChallenge = {
      title: 'Landing Page Responsiva',
      slug: 'landing-page-responsiva',
      description: 'Crie uma landing page moderna e responsiva usando HTML e CSS. Pratique flexbox, grid e design responsivo.',
      level: 'basico',
      technologies: ['HTML', 'CSS', 'Responsive Design'],
      demoUrl: 'https://example.com/demo',
      githubUrl: 'https://github.com/example/landing-page',
      thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800',
      thumbnailGenerated: false,
      learningGoals: [
        'Estruturação semântica com HTML5',
        'Estilização avançada com CSS3',
        'Layout responsivo com Flexbox e Grid',
        'Boas práticas de design'
      ],
      concepts: [
        'HTML5 Semantic Tags',
        'CSS Flexbox',
        'CSS Grid',
        'Media Queries',
        'Mobile-first Design'
      ],
      estimatedTime: '3-4 horas',
      status: 'published',
    };

    try {
      const response = await fetchAPI('/challenges', {
        method: 'POST',
        body: JSON.stringify(sampleChallenge),
      });

      if (response.ok) {
        alert('Desafio de exemplo criado com sucesso!');
        loadChallenges();
        loadStats();
      } else {
        const data = await response.json();
        alert('Erro ao criar desafio: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Erro ao criar desafio');
    }
  }

  async function deleteArticle(id: string) {
    if (!confirm('Tem certeza que deseja deletar este artigo?')) {
      return;
    }

    try {
      const response = await fetchAPI(`/articles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Artigo deletado com sucesso!');
        loadArticles();
        loadStats();
      } else {
        alert('Erro ao deletar artigo');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Erro ao deletar artigo');
    }
  }

  async function deleteChallenge(id: string) {
    if (!confirm('Tem certeza que deseja deletar este desafio?')) {
      return;
    }

    try {
      const response = await fetchAPI(`/challenges/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Desafio deletado com sucesso!');
        loadChallenges();
        loadStats();
      } else {
        alert('Erro ao deletar desafio');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Erro ao deletar desafio');
    }
  }

  async function moderateComment(contentType: string, contentId: string, commentId: string, action: 'approve' | 'reject') {
    try {
      const response = await fetchAPI(`/comments/${contentType}/${contentId}/${commentId}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        alert(`Comentário ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`);
        loadPendingComments();
        loadStats();
      } else {
        alert('Erro ao moderar comentário');
      }
    } catch (error) {
      console.error('Error moderating comment:', error);
      alert('Erro ao moderar comentário');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl mb-2">Dashboard Admin</h1>
          <p className="text-blue-100">Bem-vindo, {user?.name}! 👨‍💼</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Artigos</p>
                  <p className="text-3xl text-gray-900">{stats.totalArticles}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.publishedArticles} publicados</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Desafios</p>
                  <p className="text-3xl text-gray-900">{stats.totalChallenges}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.publishedChallenges} publicados</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Visualizações</p>
                  <p className="text-3xl text-gray-900">{stats.totalViews}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Comentários Pendentes</p>
                  <p className="text-3xl text-gray-900">{stats.pendingComments}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'articles'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Artigos ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'challenges'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Desafios ({challenges.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Comentários ({pendingComments.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg text-gray-900 mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={createSampleArticle}
                      className="flex items-center gap-3 p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Artigo de Exemplo
                    </button>
                    <button
                      onClick={createSampleChallenge}
                      className="flex items-center gap-3 p-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Desafio de Exemplo
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg text-gray-900 mb-4">Instruções</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      Use os botões acima para criar conteúdo de exemplo e testar a plataforma. 
                      Você pode gerenciar artigos, desafios e moderar comentários através das abas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg text-gray-900">Gerenciar Artigos</h3>
                  <button
                    onClick={createSampleArticle}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Artigo
                  </button>
                </div>

                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{article.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{article.category}</span>
                            <span>👁️ {article.views || 0} visualizações</span>
                            <span>❤️ {article.likes || 0} curtidas</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              article.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {article.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={`/artigo/${article.slug}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver artigo"
                          >
                            <Edit className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar artigo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhum artigo criado ainda</p>
                  </div>
                )}
              </div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg text-gray-900">Gerenciar Desafios</h3>
                  <button
                    onClick={createSampleChallenge}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Desafio
                  </button>
                </div>

                {challenges.length > 0 ? (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-gray-900 mb-1">{challenge.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{challenge.level}</span>
                            <span>👁️ {challenge.views || 0} visualizações</span>
                            <span>❤️ {challenge.likes || 0} curtidas</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              challenge.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {challenge.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteChallenge(challenge.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar desafio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhum desafio criado ainda</p>
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div>
                <h3 className="text-lg text-gray-900 mb-6">Moderar Comentários</h3>

                {pendingComments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingComments.map((comment) => (
                      <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-gray-900">{comment.authorName}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            Pendente
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{comment.content}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => moderateComment(comment.contentType, comment.contentId, comment.id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            ✅ Aprovar
                          </button>
                          <button
                            onClick={() => moderateComment(comment.contentType, comment.contentId, comment.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            ❌ Reprovar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Nenhum comentário pendente</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
