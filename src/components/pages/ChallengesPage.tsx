import React, { useEffect, useState } from 'react';
import { ExternalLink, Code2, Heart, MessageCircle, Filter } from 'lucide-react';
import { fetchAPI } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

const levels = [
  { value: 'todos', label: 'Todos os níveis' },
  { value: 'iniciante', label: 'Iniciante', color: 'bg-green-100 text-green-700' },
  { value: 'basico', label: 'Básico', color: 'bg-blue-100 text-blue-700' },
  { value: 'intermediario', label: 'Intermediário', color: 'bg-purple-100 text-purple-700' },
];

const technologies = [
  'Todos',
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Python',
  'TypeScript',
  'Node.js',
];

export function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('todos');
  const [selectedTech, setSelectedTech] = useState('Todos');

  useEffect(() => {
    loadChallenges();
  }, [selectedLevel, selectedTech]);

  async function loadChallenges() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(selectedLevel !== 'todos' && { level: selectedLevel }),
        ...(selectedTech !== 'Todos' && { technology: selectedTech }),
      });

      const response = await fetchAPI(`/challenges?${params}`);
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike(challengeId: string) {
    try {
      const response = await fetchAPI('/likes/toggle', {
        method: 'POST',
        body: JSON.stringify({
          contentType: 'challenge',
          contentId: challengeId,
        }),
      });

      if (response.ok) {
        // Refresh challenges
        loadChallenges();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  function getLevelBadge(level: string) {
    const levelObj = levels.find((l) => l.value === level);
    return levelObj ? (
      <span className={`text-xs px-2 py-1 rounded ${levelObj.color || 'bg-gray-100 text-gray-700'}`}>
        {levelObj.label}
      </span>
    ) : null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl mb-4">Desafios de Programação</h1>
          <p className="text-xl text-purple-100">
            Pratique suas habilidades com projetos reais e desafios práticos
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg text-gray-900">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Nível de Dificuldade</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {levels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Technology Filter */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Tecnologia</label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {technologies.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500 to-blue-600 overflow-hidden">
                  {challenge.thumbnail ? (
                    <img
                      src={challenge.thumbnail}
                      alt={challenge.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                      🎯
                    </div>
                  )}
                  
                  {/* Level Badge Overlay */}
                  <div className="absolute top-3 left-3">
                    {getLevelBadge(challenge.level)}
                  </div>

                  {/* Technologies Badges */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
                    {challenge.technologies.slice(0, 3).map((tech: string) => (
                      <span
                        key={tech}
                        className="text-xs bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {challenge.technologies.length > 3 && (
                      <span className="text-xs bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded">
                        +{challenge.technologies.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {challenge.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mb-4">
                    <a
                      href={challenge.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      onClick={() => {
                        // Track demo click
                        if (typeof (window as any).gtag !== 'undefined') {
                          (window as any).gtag('event', 'challenge_demo_click', {
                            challenge_id: challenge.id,
                          });
                        }
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ver Projeto
                    </a>
                    <a
                      href={challenge.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                      onClick={() => {
                        // Track code click
                        if (typeof (window as any).gtag !== 'undefined') {
                          (window as any).gtag('event', 'challenge_code_click', {
                            challenge_id: challenge.id,
                          });
                        }
                      }}
                    >
                      <Code2 className="w-4 h-4" />
                      Ver Código
                    </a>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button
                      onClick={() => toggleLike(challenge.id)}
                      className="flex items-center gap-1 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {challenge.likes || 0}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {challenge.commentsCount || 0}
                    </span>
                    {challenge.estimatedTime && (
                      <span className="ml-auto text-xs">
                        ⏱️ {challenge.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl text-gray-900 mb-2">Nenhum desafio encontrado</h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou volte mais tarde para novos desafios
            </p>
            <button
              onClick={() => {
                setSelectedLevel('todos');
                setSelectedTech('Todos');
              }}
              className="text-purple-600 hover:text-purple-700"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
