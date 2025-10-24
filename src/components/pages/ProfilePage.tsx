import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { fetchAPI } from '../../lib/supabase';
import { User, Mail, Award, Calendar, Edit2, Save, X, Upload, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  async function handleSave() {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetchAPI('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          bio: formData.bio,
          avatar: avatarUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Perfil atualizado com sucesso!');
        setIsEditing(false);
        await refreshUser();
        
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Erro ao atualizar perfil');
      }
    } catch (err) {
      setError('Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarUrl(user.avatar || '');
    }
    setIsEditing(false);
    setError('');
  }

  function getRoleBadge(role: string) {
    const badges = {
      student: { label: 'Aluno', color: 'bg-blue-100 text-blue-800' },
      teacher: { label: 'Professor', color: 'bg-purple-100 text-purple-800' },
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
    };
    return badges[role as keyof typeof badges] || badges.student;
  }

  function getRankColor(rank: string) {
    const colors = {
      Madeira: 'text-amber-700',
      Bronze: 'text-orange-600',
      Prata: 'text-gray-400',
      Ouro: 'text-yellow-500',
      Diamante: 'text-cyan-400',
    };
    return colors[rank as keyof typeof colors] || 'text-gray-500';
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Avatar and Stats */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={isEditing ? avatarUrl : user.avatar || undefined} />
                      <AvatarFallback className="text-3xl">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div className="w-full mb-4">
                      <Label htmlFor="avatarUrl" className="text-sm">URL do Avatar</Label>
                      <Input
                        id="avatarUrl"
                        type="url"
                        placeholder="https://..."
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <h2 className="text-xl mb-1">{user.name}</h2>
                  {user.username && (
                    <p className="text-sm text-gray-500 mb-3">@{user.username}</p>
                  )}
                  
                  <Badge className={roleBadge.color}>
                    {roleBadge.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Gamification Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Rank</div>
                  <div className={`text-2xl ${getRankColor(user.rank || 'Madeira')}`}>
                    {user.rank || 'Madeira'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Nível</div>
                  <div className="text-2xl">{user.level || 1}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Pontos</div>
                  <div className="text-2xl text-blue-600">{user.points || 0}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Info */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>Atualize seus dados pessoais</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleSave}
                        size="sm"
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        {isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <p className="text-gray-900">{user.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="username" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Nome de Usuário
                  </Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="seunome"
                    />
                  ) : (
                    <p className="text-gray-900">{user.username || 'Não definido'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado</p>
                </div>

                <div>
                  <Label htmlFor="bio" className="mb-2 block">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Conte um pouco sobre você..."
                      rows={4}
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {user.bio || 'Nenhuma bio adicionada ainda'}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Membro desde {new Date(user.createdAt || Date.now()).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
