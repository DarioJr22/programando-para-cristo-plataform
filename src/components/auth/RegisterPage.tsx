import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { User, Mail, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export function RegisterPage() {
  const { signup } = useAuth();
  
  // Check if registering with specific role (via URL param)
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  const allowedRoles = ['student', 'teacher', 'admin'];
  const defaultRole = allowedRoles.includes(roleParam || '') ? roleParam : 'student';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole || 'student',
    secretCode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function validatePassword(password: string) {
    if (password.length < 8) {
      return 'Senha deve ter no mínimo 8 caracteres';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }
    if (!/[a-z]/.test(password)) {
      return 'Senha deve conter pelo menos uma letra minúscula';
    }
    if (!/[0-9]/.test(password)) {
      return 'Senha deve conter pelo menos um número';
    }
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    const result = await signup(formData.name, formData.email, formData.password, formData.role, formData.secretCode);

    if (result.success) {
      setSuccess(true);
      
      // Track with GA4 if available
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'sign_up', {
          method: 'email',
        });
      }
    } else {
      setError(result.error || 'Erro ao criar conta');
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-4">
              Conta criada com sucesso!
            </h2>
            <p className="text-gray-600 mb-8">
              Sua conta foi criada e já está pronta para uso. 
              Faça login para começar sua jornada de aprendizado.
            </p>
            <a
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Fazer Login
            </a>
            <p className="mt-6 text-sm text-gray-500 italic">
              "Bem-aventurado aquele que lê, e os que ouvem as palavras desta profecia" - Apocalipse 1:3
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-3xl">✝️</span>
            </div>
            <div className="text-white text-2xl">Programando para Cristo</div>
          </div>
          <p className="text-blue-100">Comece sua jornada de aprendizado hoje</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl text-gray-900 mb-6 text-center">Criar Conta</h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  minLength={2}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 8 caracteres com maiúscula, minúscula e número
              </p>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm text-gray-700 mb-2">
                Tipo de Conta
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="student">Aluno</option>
                <option value="teacher">Professor</option>
                <option value="admin">Administrador</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {formData.role === 'student' && 'Acesso a artigos, desafios e dashboard de progresso'}
                {formData.role === 'teacher' && 'Pode publicar artigos e criar desafios (requer código secreto)'}
                {formData.role === 'admin' && 'Acesso completo a todas as funcionalidades (requer código secreto)'}
              </p>
            </div>

            {(formData.role === 'teacher' || formData.role === 'admin') && (
              <div>
                <label htmlFor="secretCode" className="block text-sm text-gray-700 mb-2">
                  Código Secreto
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="secretCode"
                    type="text"
                    placeholder="Código para professor/admin"
                    value={formData.secretCode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secretCode: e.target.value }))}
                    required
                    disabled={isLoading}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Entre em contato com a administração para obter o código
                </p>
              </div>
            )}

            <div>
              <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Criar Conta Gratuita'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <a href="/login" className="text-blue-600 hover:text-blue-700">
                Fazer login
              </a>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500 italic">
              "Tudo posso naquele que me fortalece" - Filipenses 4:13
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-blue-100 hover:text-white transition-colors">
            ← Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
}
