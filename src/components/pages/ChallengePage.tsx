import React, { useEffect, useState } from 'react';
import { 
  Heart, Share2, Clock, ChevronRight, MessageCircle, Send, 
  ExternalLink, Code2, Target, Trophy, Star, CheckCircle
} from 'lucide-react';
import { fetchAPI } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { MarkdownRenderer } from '../MarkdownRenderer';

export function ChallengePage({ slug }: { slug: string }) {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadChallenge();
    loadComments();
    if (user) {
      checkIfLiked();
    }
  }, [slug, user]);

  async function loadChallenge() {
    try {
      const response = await fetchAPI(`/challenges/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setChallenge(data.challenge);
        setLikesCount(data.challenge.likes || 0);
      } else {
        // Challenge not found
        window.location.href = '/desafios';
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const response = await fetchAPI(`/comments/challenge/${slug}`);
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
      const response = await fetchAPI(`/likes/check?contentType=challenge&contentId=${slug}`);
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
      window.location.href = `/login?redirect=/desafio/${slug}`;
      return;
    }

    try {
      const response = await fetchAPI('/likes/toggle', {
        method: 'POST',
        body: JSON.stringify({
          contentType: 'challenge',
          contentId: challenge.id,
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
      window.location.href = `/login?redirect=/desafio/${slug}`;
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
          contentType: 'challenge',
          contentId: challenge.id,
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

  function shareChallenge(method: string) {
    const url = window.location.href;
    const text = `${challenge.title} - Desafio de Programação`;

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
      (window as any).gtag('event', 'challenge_share', {
        challenge_id: challenge.id,
        method,
      });
    }
  }

  function toggleStep(stepIndex: number) {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  }

  function getLevelColor(level: string) {
    const colors: Record<string, string> = {
      iniciante: 'bg-green-100 text-green-700 border-green-200',
      basico: 'bg-blue-100 text-blue-700 border-blue-200',
      intermediario: 'bg-purple-100 text-purple-700 border-purple-200',
      avancado: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[level] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando desafio...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  const completionPercentage = challenge.steps ? 
    (completedSteps.size / challenge.steps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-purple-600">Início</a>
            <ChevronRight className="w-4 h-4" />
            <a href="/desafios" className="hover:text-purple-600">Desafios</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{challenge.title}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Challenge Info Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Informações do Desafio</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Nível:</span>
                    <span className={`text-xs px-3 py-1 rounded border ${getLevelColor(challenge.level)}`}>
                      {challenge.level}
                    </span>
                  </div>
                  
                  {challenge.estimatedTime && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tempo estimado:</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {challenge.estimatedTime}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pontos:</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      {challenge.points} pts
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-6">
                  {challenge.demoUrl && (
                    <a
                      href={challenge.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Demo
                    </a>
                  )}
                  
                  {challenge.githubUrl && (
                    <a
                      href={challenge.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                      <Code2 className="w-4 h-4" />
                      Ver no GitHub
                    </a>
                  )}
                </div>

                {/* Progress */}
                {challenge.steps && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progresso:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {completedSteps.size}/{challenge.steps.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {Math.round(completionPercentage)}% concluído
                    </p>
                  </div>
                )}
              </div>

              {/* Technologies */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tecnologias</h3>
                <div className="flex flex-wrap gap-2">
                  {challenge.technologies?.map((tech: string) => (
                    <span
                      key={tech}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-4">
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
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => shareChallenge('whatsapp')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => shareChallenge('twitter')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => shareChallenge('facebook')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Facebook
                      </button>
                      <button
                        onClick={() => shareChallenge('linkedin')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        LinkedIn
                      </button>
                      <button
                        onClick={() => shareChallenge('copy')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-lg"
                      >
                        Copiar link
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {comments.length} comentário{comments.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Header */}
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-3 py-1 rounded border ${getLevelColor(challenge.level)}`}>
                    {challenge.level}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {challenge.points} pontos
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {challenge.title}
                </h1>

                <p className="text-xl text-gray-600 mb-8">
                  {challenge.description}
                </p>

                {/* Challenge Content */}
                <div className="prose prose-lg max-w-none">
                  <MarkdownRenderer content={challenge.content} />
                </div>

                {/* Requirements */}
                {challenge.requirements && challenge.requirements.length > 0 && (
                  <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Requisitos
                    </h3>
                    <ul className="space-y-2">
                      {challenge.requirements.map((req: string, index: number) => (
                        <li key={index} className="text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps */}
                {challenge.steps && challenge.steps.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Passos para Resolver
                    </h3>
                    <div className="space-y-3">
                      {challenge.steps.map((step: string, index: number) => (
                        <div 
                          key={index}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            completedSteps.has(index)
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => toggleStep(index)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              completedSteps.has(index)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {completedSteps.has(index) ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <span className="text-xs font-bold">{index + 1}</span>
                              )}
                            </div>
                            <p className={`text-sm ${
                              completedSteps.has(index)
                                ? 'text-green-800 line-through'
                                : 'text-gray-700'
                            }`}>
                              {step}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {challenge.tips && challenge.tips.length > 0 && (
                  <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                      💡 Dicas
                    </h3>
                    <ul className="space-y-2">
                      {challenge.tips.map((tip: string, index: number) => (
                        <li key={index} className="text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resources */}
                {challenge.resources && challenge.resources.length > 0 && (
                  <div className="mt-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      📚 Recursos Úteis
                    </h3>
                    <div className="space-y-2">
                      {challenge.resources.map((resource: any, index: number) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-purple-800 group-hover:text-purple-900">
                              {resource.title}
                            </span>
                            <ExternalLink className="w-4 h-4 text-purple-600" />
                          </div>
                          {resource.description && (
                            <p className="text-sm text-purple-600 mt-1">{resource.description}</p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verse */}
                {challenge.verse && (
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">📖</div>
                      <div>
                        <p className="text-lg text-gray-700 italic mb-2">
                          {challenge.verse.text || challenge.verse}
                        </p>
                        <p className="text-sm text-gray-600">
                          — {challenge.verse.reference || 'Bíblia Sagrada'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Comentários ({comments.length})
              </h3>

              {user ? (
                <form onSubmit={submitComment} className="mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Deixe seu comentário sobre este desafio..."
                    minLength={10}
                    rows={4}
                    disabled={submittingComment}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-gray-500">Mínimo 10 caracteres</p>
                    <button
                      type="submit"
                      disabled={submittingComment || commentText.length < 10}
                      className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {submittingComment ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-lg text-center">
                  <p className="text-gray-700 mb-4">
                    Faça login para comentar e interagir com a comunidade
                  </p>
                  <div className="flex gap-3 justify-center">
                    <a
                      href={`/login?redirect=/desafio/${slug}`}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Login
                    </a>
                    <a
                      href="/registro"
                      className="border-2 border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors"
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
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {comment.authorName?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
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
                    Seja o primeiro a comentar sobre este desafio! 💬
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}