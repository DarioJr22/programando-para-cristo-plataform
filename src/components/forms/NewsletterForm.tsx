import React, { useState } from 'react';
import { fetchAPI } from '../../lib/supabase';

interface NewsletterFormProps {
  origin: string;
}

export function NewsletterForm({ origin }: NewsletterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    optInWhatsApp: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Capture UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const metadata = {
        origin,
        sourceUrl: window.location.href,
        utmCampaign: urlParams.get('utm_campaign'),
        utmSource: urlParams.get('utm_source'),
        utmMedium: urlParams.get('utm_medium'),
        utmContent: urlParams.get('utm_content'),
        utmTerm: urlParams.get('utm_term'),
      };

      const response = await fetchAPI('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          metadata,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Track with GA4 if available
        if (typeof (window as any).gtag !== 'undefined') {
          (window as any).gtag('event', 'newsletter_signup', {
            origin,
            utm_campaign: metadata.utmCampaign,
          });
        }
      } else {
        setError(data.error || 'Erro ao inscrever. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao inscrever. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-2xl mb-3">Inscrição confirmada!</h3>
        <p className="text-blue-100">
          Você receberá conteúdos exclusivos no email cadastrado.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Seu nome"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          minLength={2}
          disabled={isLoading}
          className="w-full px-6 py-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        />
      </div>

      <div>
        <input
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
          disabled={isLoading}
          className="w-full px-6 py-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="whatsapp-opt"
          checked={formData.optInWhatsApp}
          onChange={(e) => setFormData((prev) => ({ ...prev, optInWhatsApp: e.target.checked }))}
          disabled={isLoading}
          className="w-5 h-5 rounded border-white/20 bg-white/10"
        />
        <label htmlFor="whatsapp-opt" className="text-sm text-blue-100 cursor-pointer">
          Quero receber também por WhatsApp
        </label>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Inscrevendo...' : 'Quero receber conteúdos'}
      </button>

      <p className="text-xs text-center text-blue-100">
        Ao inscrever-se, você concorda com nossa política de privacidade
      </p>
    </form>
  );
}
