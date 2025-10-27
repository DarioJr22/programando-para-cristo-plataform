import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { fetchAPI } from '../../lib/supabase';
import { BarChart3, FileText, Target, MessageSquare, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { ArticleForm } from '../forms/ArticleForm';
import { ChallengeForm } from '../forms/ChallengeForm';

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [pendingComments, setPendingComments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'articles' | 'challenges' | 'comments'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);

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
      } else if (response.status === 403) {
        console.log('Stats not available - insufficient permissions');
        setStats({
          totalUsers: 0,
          totalArticles: articles.length,
          totalChallenges: challenges.length,
          totalComments: 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        totalUsers: 0,
        totalArticles: articles.length,
        totalChallenges: challenges.length,
        totalComments: 0
      });
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
      } else if (response.status === 403) {
        console.log('Pending comments not available - insufficient permissions');
        setPendingComments([]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setPendingComments([]);
    }
  }

  // Article functions
  const handleCreateArticle = () => {
    setEditingArticle(null);
    setShowArticleForm(true);
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setShowArticleForm(true);
  };

  const handleSaveArticle = async (articleData: any) => {
    setFormLoading(true);
    try {
      const url = editingArticle ? `/articles/${editingArticle.id}` : '/articles';
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetchAPI(url, {
        method,
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
        setShowArticleForm(false);
        setEditingArticle(null);
        loadArticles();
        loadStats();
        alert(editingArticle ? 'Artigo atualizado com sucesso!' : 'Artigo criado com sucesso!');
      } else {
        const data = await response.json();
        alert('Erro: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Erro ao salvar artigo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelArticleForm = () => {
    setShowArticleForm(false);
    setEditingArticle(null);
  };

  // Challenge functions
  const handleCreateChallenge = () => {
    setEditingChallenge(null);
    setShowChallengeForm(true);
  };

  const handleEditChallenge = (challenge: any) => {
    setEditingChallenge(challenge);
    setShowChallengeForm(true);
  };

  const handleSaveChallenge = async (challengeData: any) => {
    setFormLoading(true);
    try {
      const url = editingChallenge ? `/challenges/${editingChallenge.id}` : '/challenges';
      const method = editingChallenge ? 'PUT' : 'POST';
      
      const response = await fetchAPI(url, {
        method,
        body: JSON.stringify(challengeData),
      });

      if (response.ok) {
        setShowChallengeForm(false);
        setEditingChallenge(null);
        loadChallenges();
        loadStats();
        alert(editingChallenge ? 'Desafio atualizado com sucesso!' : 'Desafio criado com sucesso!');
      } else {
        const data = await response.json();
        alert('Erro: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Erro ao salvar desafio');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelChallengeForm = () => {
    setShowChallengeForm(false);
    setEditingChallenge(null);
  };

  // Comment moderation functions
  const handleModerateComment = async (comment: any, action: 'approve' | 'reject') => {
    try {
      const response = await fetchAPI(`/comments/${comment.contentType}/${comment.contentId}/${comment.id}/moderate`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        loadPendingComments();
        loadStats();
        alert(`Comentário ${action === 'approve' ? 'aprovado' : 'rejeitado'} com sucesso!`);
      } else {
        const data = await response.json();
        alert('Erro: ' + data.error);
      }
    } catch (error) {
      console.error('Error moderating comment:', error);
      alert('Erro ao moderar comentário');
    }
  };

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
                      onClick={handleCreateArticle}
                      className="flex items-center gap-3 p-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Novo Artigo
                    </button>
                    <button
                      onClick={handleCreateChallenge}
                      className="flex items-center gap-3 p-4 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Novo Desafio
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
                    onClick={handleCreateArticle}
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
                          <button
                            onClick={() => handleEditArticle(article)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar artigo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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
                    onClick={handleCreateChallenge}
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
                            onClick={() => handleEditChallenge(challenge)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar desafio"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
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

      {/* Article Form Modal */}
      {showArticleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowArticleForm(false);
            setEditingArticle(null);
          }
        }}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingArticle ? 'Editar Artigo' : 'Criar Novo Artigo'}
                </h2>
                <button
                  onClick={() => {
                    setShowArticleForm(false);
                    setEditingArticle(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <ArticleForm
                article={editingArticle}
                onSave={handleSaveArticle}
                onCancel={() => {
                  setShowArticleForm(false);
                  setEditingArticle(null);
                }}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Challenge Form Modal */}
      {showChallengeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowChallengeForm(false);
            setEditingChallenge(null);
          }
        }}>
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingChallenge ? 'Editar Desafio' : 'Criar Novo Desafio'}
                </h2>
                <button
                  onClick={() => {
                    setShowChallengeForm(false);
                    setEditingChallenge(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <ChallengeForm
                challenge={editingChallenge}
                onSave={handleSaveChallenge}
                onCancel={() => {
                  setShowChallengeForm(false);
                  setEditingChallenge(null);
                }}
                isLoading={formLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
