import React, { useEffect, useState } from 'react';
import { Search, Filter, Clock, Heart, MessageCircle } from 'lucide-react';
import { fetchAPI } from '../../lib/supabase';

const categories = [
  { value: 'todos', label: 'Todos', emoji: '📋' },
  { value: 'aulas', label: 'Aulas e Tutoriais', emoji: '📚' },
  { value: 'fe', label: 'Fé e Programação', emoji: '🙏' },
  { value: 'carreira', label: 'Carreira e Orientação', emoji: '💡' },
  { value: 'comunidade', label: 'Comunidade', emoji: '🎯' },
];

const levels = [
  { value: '', label: 'Todos os níveis' },
  { value: 'iniciante', label: 'Iniciante' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
];

export function BlogPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, selectedLevel, searchQuery, currentPage]);

  async function loadArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(selectedCategory !== 'todos' && { category: selectedCategory }),
        ...(selectedLevel && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetchAPI(`/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  }

  function getCategoryBadgeColor(category: string) {
    const colors: Record<string, string> = {
      aulas: 'bg-blue-100 text-blue-700',
      fe: 'bg-purple-100 text-purple-700',
      carreira: 'bg-green-100 text-green-700',
      comunidade: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  }

  function getCategoryLabel(category: string) {
    const labels: Record<string, string> = {
      aulas: '📚 Aulas',
      fe: '🙏 Fé',
      carreira: '💡 Carreira',
      comunidade: '🎯 Comunidade',
    };
    return labels[category] || category;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl mb-4">Blog</h1>
          <p className="text-xl text-blue-100">
            Artigos, tutoriais e reflexões sobre programação e fé
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </h3>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar artigos..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Nível</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Popular Articles */}
              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-sm text-gray-900 mb-3">Mais Populares</h4>
                <div className="space-y-3">
                  {articles.slice(0, 5).map((article) => (
                    <a
                      key={article.id}
                      href={`/artigo/${article.slug}`}
                      className="block text-sm text-gray-600 hover:text-blue-600 line-clamp-2"
                    >
                      {article.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Category Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    setSelectedCategory(category.value);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{category.emoji}</span>
                  {category.label}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {articles.map((article) => (
                    <a
                      key={article.id}
                      href={`/artigo/${article.slug}`}
                      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-5xl">
                            📝
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeColor(article.category)}`}>
                            {getCategoryLabel(article.category)}
                          </span>
                          {article.level && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {article.level}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            {article.readTime || 5} min
                          </span>
                        </div>
                        <h3 className="text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {article.likes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {article.commentsCount || 0}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl text-gray-900 mb-2">Nenhum artigo encontrado</h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros ou fazer outra busca
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('todos');
                    setSelectedLevel('');
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
