import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { fetchAPI } from '../../lib/supabase';
import { 
  Trophy, Target, BookOpen, Code, TrendingUp, Award,
  Star, Flame, Calendar, User, Crown, Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface GamificationStats {
  points: number;
  level: number;
  rank: string;
  completedChallenges: number;
  articlesPublished: number;
  articlesRead: number;
  commentsApproved: number;
  streak: number;
  achievements: string[];
}

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
  points: number;
  level: number;
  rank: string;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        fetchAPI('/dashboard/stats'),
        fetchAPI('/gamification/leaderboard?limit=10')
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats.gamification);
      }

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  function getRankColor(rank: string) {
    const colors: Record<string, string> = {
      'Madeira': 'bg-amber-800 text-white',
      'Bronze': 'bg-orange-600 text-white',
      'Prata': 'bg-gray-400 text-gray-900',
      'Ouro': 'bg-yellow-500 text-yellow-900',
      'Diamante': 'bg-cyan-400 text-cyan-900'
    };
    return colors[rank] || 'bg-gray-500 text-white';
  }

  function getRankIcon(rank: string) {
    const icons: Record<string, JSX.Element> = {
      'Madeira': <Award className="w-5 h-5" />,
      'Bronze': <Award className="w-5 h-5" />,
      'Prata': <Trophy className="w-5 h-5" />,
      'Ouro': <Crown className="w-5 h-5" />,
      'Diamante': <Star className="w-5 h-5" />
    };
    return icons[rank] || <Award className="w-5 h-5" />;
  }

  function getNextRankPoints(currentPoints: number): { nextRank: string; pointsNeeded: number } {
    if (currentPoints < 500) return { nextRank: 'Bronze', pointsNeeded: 500 - currentPoints };
    if (currentPoints < 2000) return { nextRank: 'Prata', pointsNeeded: 2000 - currentPoints };
    if (currentPoints < 5000) return { nextRank: 'Ouro', pointsNeeded: 5000 - currentPoints };
    if (currentPoints < 10000) return { nextRank: 'Diamante', pointsNeeded: 10000 - currentPoints };
    return { nextRank: 'Diamante', pointsNeeded: 0 };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-600">Erro ao carregar dados</div>
        </div>
      </div>
    );
  }

  const nextRank = getNextRankPoints(stats.points);
  const progressToNextRank = nextRank.pointsNeeded > 0 
    ? ((stats.points % (stats.points + nextRank.pointsNeeded)) / (stats.points + nextRank.pointsNeeded)) * 100
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo, {user?.name}! Acompanhe seu progresso e conquistas.
          </p>
        </div>

        {/* User Rank Card */}
        <Card className="mb-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                  <User className="w-10 h-10" />
                </div>
                <div>
                  <h2 className="text-2xl mb-1">{user?.name}</h2>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRankColor(stats.rank)} flex items-center gap-1`}>
                      {getRankIcon(stats.rank)}
                      {stats.rank}
                    </Badge>
                    <span className="text-white/80">Nível {stats.level}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-1">{stats.points}</div>
                <div className="text-white/80 text-sm">Pontos totais</div>
              </div>
            </div>

            {nextRank.pointsNeeded > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso para {nextRank.nextRank}</span>
                  <span>{nextRank.pointsNeeded} pontos restantes</span>
                </div>
                <Progress value={progressToNextRank} className="h-3 bg-white/20" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Desafios Completados</CardTitle>
              <Code className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.completedChallenges}</div>
              <p className="text-xs text-gray-500 mt-1">
                +50-100 pontos por desafio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Artigos Lidos</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.articlesRead}</div>
              <p className="text-xs text-gray-500 mt-1">
                +10 pontos por artigo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Artigos Publicados</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.articlesPublished}</div>
              <p className="text-xs text-gray-500 mt-1">
                +100 pontos por artigo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Sequência</CardTitle>
              <Flame className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stats.streak} dias</div>
              <p className="text-xs text-gray-500 mt-1">
                Continue aprendendo!
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leaderboard">🏆 Ranking</TabsTrigger>
            <TabsTrigger value="achievements">🎯 Conquistas</TabsTrigger>
            <TabsTrigger value="activity">📊 Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 - Ranking Global</CardTitle>
                <CardDescription>
                  Os melhores alunos e professores da plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`text-2xl ${index < 3 ? 'font-bold' : ''}`}>
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && `#${index + 1}`}
                      </div>
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="rounded-full" />
                        ) : (
                          <User className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span>{user.name}</span>
                          {user.role === 'teacher' && (
                            <Badge variant="outline" className="text-xs">Professor</Badge>
                          )}
                          {user.role === 'admin' && (
                            <Badge variant="outline" className="text-xs bg-red-50">Admin</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${getRankColor(user.rank)} text-xs`}>
                            {user.rank}
                          </Badge>
                          <span className="text-xs text-gray-500">Nível {user.level}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl">{user.points}</div>
                        <div className="text-xs text-gray-500">pontos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Suas Conquistas</CardTitle>
                <CardDescription>
                  Desbloqueie conquistas ao atingir marcos importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border-2 ${stats.completedChallenges >= 1 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-6 h-6 text-green-600" />
                      <h3>Primeiro Passo</h3>
                    </div>
                    <p className="text-sm text-gray-600">Complete seu primeiro desafio</p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${stats.completedChallenges >= 10 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Code className="w-6 h-6 text-blue-600" />
                      <h3>Programador Dedicado</h3>
                    </div>
                    <p className="text-sm text-gray-600">Complete 10 desafios</p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${stats.articlesRead >= 5 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <h3>Leitor Ávido</h3>
                    </div>
                    <p className="text-sm text-gray-600">Leia 5 artigos</p>
                  </div>

                  <div className={`p-4 rounded-lg border-2 ${stats.points >= 500 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-6 h-6 text-orange-600" />
                      <h3>Rank Bronze</h3>
                    </div>
                    <p className="text-sm text-gray-600">Alcance 500 pontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Seu histórico de aprendizado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Continue aprendendo para ver sua atividade aqui!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/desafios"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <Code className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="text-lg mb-2">Resolver Desafios</h3>
            <p className="text-sm text-gray-600">
              Pratique e ganhe até 100 pontos por desafio
            </p>
          </a>

          <a
            href="/blog"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="text-lg mb-2">Ler Artigos</h3>
            <p className="text-sm text-gray-600">
              Aprenda e ganhe 10 pontos por artigo lido
            </p>
          </a>

          <a
            href="/admin"
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
          >
            <Target className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="text-lg mb-2">Publicar Conteúdo</h3>
            <p className="text-sm text-gray-600">
              {user?.role === 'student' 
                ? 'Crie rascunhos de artigos' 
                : 'Publique e ganhe 100+ pontos'}
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
