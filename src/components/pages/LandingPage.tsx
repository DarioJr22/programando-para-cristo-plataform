import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Heart, Briefcase, Users, Star, Clock } from 'lucide-react';
import { NewsletterForm } from '../forms/NewsletterForm';
import { fetchAPI } from '../../lib/supabase';

const heroImage = "https://images.unsplash.com/photo-1732304722020-be33345c00c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGxlYXJuaW5nJTIwY29tcHV0ZXJ8ZW58MXx8fHwxNzYxMjYyMDA1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const faithImage = "https://images.unsplash.com/photo-1649610047673-f235e14ddbe9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RpYW4lMjBmYWl0aCUyMGNyb3NzJTIwbGlnaHR8ZW58MXx8fHwxNzYxMjYyMDA1fDA&ixlib=rb-4.1.0&q=80&w=1080";
const communityImage = "https://images.unsplash.com/photo-1632910121591-29e2484c0259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBjb21tdW5pdHklMjB0ZWFtd29ya3xlbnwxfHx8fDE3NjEyNjIwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080";
const careerImage = "https://images.unsplash.com/photo-1758525589763-b9ad2a75bfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwcHVycG9zZSUyMGNhcmVlcnxlbnwxfHx8fDE3NjEyNjIwMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080";

export function LandingPage() {
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentArticles();
  }, []);

  async function loadRecentArticles() {
    try {
      const response = await fetchAPI('/articles?page=1');
      if (response.ok) {
        const data = await response.json();
        setRecentArticles(data.articles.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: '📚 Aulas e Tutoriais',
      description: 'Aprenda HTML, CSS, JavaScript, Python do zero com didática pensada para iniciantes absolutos.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: '🙏 Fé e Programação',
      description: 'Descubra como a tecnologia pode servir ao Reino de Deus e transformar vidas através do seu propósito.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: '💡 Carreira e Orientação',
      description: 'Seus primeiros passos na carreira tech, dicas de mercado e como se preparar para entrevistas.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: '🎯 Comunidade',
      description: 'Desafios práticos, projetos em grupo e crescimento coletivo em uma comunidade acolhedora.',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const differentials = [
    {
      icon: '📚',
      title: 'Didática para Iniciantes',
      description: 'Conteúdo pensado para quem está começando do zero, sem pré-requisitos.',
    },
    {
      icon: '🙏',
      title: 'Valores Cristãos',
      description: 'Fé e tecnologia integradas naturalmente, sem ser impositivo.',
    },
    {
      icon: '👥',
      title: 'Comunidade Acolhedora',
      description: 'Um espaço seguro para aprender, crescer e compartilhar experiências.',
    },
    {
      icon: '💰',
      title: '100% Gratuito',
      description: 'Conteúdo de qualidade acessível a todos, sem barreiras financeiras.',
    },
  ];

  const testimonials = [
    {
      name: 'João Silva',
      text: 'Estava desempregado e desanimado. Através deste projeto encontrei não só uma nova carreira, mas também renovi minha fé. Hoje trabalho como desenvolvedor!',
      verse: 'Filipenses 4:13',
      avatar: 'J',
    },
    {
      name: 'Maria Santos',
      text: 'Como mãe e dona de casa, achei que nunca conseguiria aprender programação. A didática e o apoio da comunidade me mostraram que é possível!',
      verse: 'Isaías 41:10',
      avatar: 'M',
    },
    {
      name: 'Pedro Costa',
      text: 'A forma como integram fé e tecnologia é inspiradora. Aprendi que posso usar meus talentos para fazer a diferença no Reino.',
      verse: 'Mateus 5:16',
      avatar: 'P',
    },
  ];

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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl mb-6">
                Transforme sua vida através da programação
              </h1>
              <p className="text-xl lg:text-2xl mb-8 text-blue-100">
                Aprenda a programar do zero, com propósito e fé em Cristo
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/registro"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#blog"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                >
                  Explorar Conteúdo
                </a>
              </div>
              <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <p className="text-sm text-blue-100 mb-1">Versículo Inspirador</p>
                <p className="text-lg italic">
                  "Tudo posso naquele que me fortalece"
                </p>
                <p className="text-sm text-blue-200 mt-1">— Filipenses 4:13</p>
              </div>
            </div>

            <div className="hidden lg:block">
              <img
                src={heroImage}
                alt="Aprendendo programação"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
              Sobre o Projeto
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8" />
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
              Somos uma escola de programação cristã que acredita que tecnologia e fé podem 
              caminhar juntas. Nossa missão é ensinar programação do zero, oferecendo conteúdo 
              de qualidade, gratuito e acessível para todos.
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Acreditamos que cada pessoa tem um propósito único e que a tecnologia pode ser 
              uma ferramenta poderosa para cumpri-lo. Aqui, você não apenas aprende a programar, 
              mas descobre como usar seus talentos para fazer a diferença no mundo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {differentials.map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
              Categorias de Conteúdo
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="p-8">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} text-white mb-4`}>
                    {category.icon}
                  </div>
                  <h3 className="text-2xl text-gray-900 mb-3">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Articles Section */}
      <section id="blog" className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
                Últimos Artigos
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
            </div>
            <a
              href="/blog"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
            >
              Ver todos
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

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
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentArticles.map((article) => (
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
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                        📝
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeColor(article.category)}`}>
                        {getCategoryLabel(article.category)}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime || 5} min
                      </span>
                    </div>
                    <h3 className="text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        ❤️ {article.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {article.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Em breve teremos artigos incríveis para você! 📚</p>
            </div>
          )}
        </div>
      </section>

      {/* Challenges Preview Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
              Desafios em Destaque
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pratique suas habilidades com projetos reais e desafios práticos
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-2xl text-gray-900 mb-4">
              Faça login para acessar os desafios
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Crie uma conta gratuita para ter acesso a dezenas de desafios práticos 
              de programação, com diferentes níveis de dificuldade e tecnologias.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/registro"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Criar Conta Gratuita
              </a>
              <a
                href="/login"
                className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Já tenho conta
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl text-gray-900 mb-4">
              Testemunhos
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-8" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Veja como a plataforma tem transformado vidas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.verse}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                <div className="mt-4 flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl mb-4">
              Receba Conteúdos Exclusivos
            </h2>
            <p className="text-xl text-blue-100">
              Inscreva-se na nossa newsletter e receba artigos, dicas e novidades 
              direto no seu email
            </p>
          </div>
          <NewsletterForm origin="Landing Page" />
        </div>
      </section>
    </div>
  );
}
