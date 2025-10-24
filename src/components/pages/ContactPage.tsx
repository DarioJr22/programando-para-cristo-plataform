import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchAPI } from '../../lib/supabase';

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetchAPI('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          whatsapp: '',
          subject: '',
          message: ''
        });
      } else {
        setError(data.error || 'Erro ao enviar mensagem');
      }
    } catch (err) {
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl text-gray-900 mb-4">
              Mensagem Enviada! 🎉
            </h2>
            <p className="text-gray-600 mb-8">
              Obrigado por entrar em contato! Responderei em breve, geralmente em até 24 horas.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Outra Mensagem
            </button>
            <p className="mt-6 text-sm text-gray-500 italic">
              "Tudo tem o seu tempo determinado" - Eclesiastes 3:1
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl text-gray-900 mb-4">Entre em Contato</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tem alguma dúvida, sugestão ou quer conversar sobre tecnologia e fé? 
            Ficarei feliz em te responder! 📧
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 text-sm">contato@programandoparacristo.com</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-gray-600 text-sm">Disponível após primeiro contato</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">Localização</h3>
            <p className="text-gray-600 text-sm">Online - Brasil 🇧🇷</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <h2 className="text-3xl text-gray-900 mb-6">Envie sua Mensagem</h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="whatsapp" className="block text-sm text-gray-700 mb-2">
                  WhatsApp (opcional)
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm text-gray-700 mb-2">
                  Assunto *
                </label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="duvida-tecnica">Dúvida Técnica</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="parceria">Parceria</option>
                  <option value="mentoria">Mentoria</option>
                  <option value="feedback">Feedback</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-gray-700 mb-2">
                Mensagem *
              </label>
              <textarea
                id="message"
                rows={6}
                placeholder="Escreva sua mensagem aqui..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                required
                minLength={20}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 20 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Mensagem
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-center text-gray-500 italic">
              "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles" - Mateus 18:20
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          <h2 className="text-3xl text-gray-900 mb-8 text-center">Perguntas Frequentes</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg text-gray-900 mb-2">
                Quanto tempo leva para receber resposta?
              </h3>
              <p className="text-gray-600">
                Geralmente respondo em até 24 horas durante dias úteis. Finais de semana podem levar um pouco mais.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg text-gray-900 mb-2">
                Oferecem mentoria individual?
              </h3>
              <p className="text-gray-600">
                Sim! Entre em contato para conversarmos sobre mentoria personalizada e valores.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg text-gray-900 mb-2">
                Posso sugerir conteúdo para a plataforma?
              </h3>
              <p className="text-gray-600">
                Com certeza! Adoraria ouvir suas sugestões de artigos, desafios ou funcionalidades.
              </p>
            </div>

            <div>
              <h3 className="text-lg text-gray-900 mb-2">
                Como posso contribuir com a plataforma?
              </h3>
              <p className="text-gray-600">
                Você pode contribuir compartilhando a plataforma, criando conteúdo, ou até mesmo tornando-se professor. Entre em contato para saber mais!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
