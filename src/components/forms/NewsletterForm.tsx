import React, { useState } from 'react';

interface NewsletterFormProps {
  origin: string;
  interesse?: string; // Permite especificar o tipo de interesse
  webhookUrl?: string; // Permite customizar a URL do webhook
}

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  optInWhatsApp: boolean;
}

interface WebhookPayload {
  Nome: string;
  Email: string;
  WhatsApp?: string;
  Origem: string;
  Status: string;
  "date:Data de Captação:start": string;
  Interesse: string;
  "Source URL": string;
  "UTM Campaign": string;
  "Opt-in Email": boolean;
  "Opt-in WhatsApp": boolean;
}

export function NewsletterForm({ 
  origin, 
  interesse = 'Newsletter', 
  webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '' 
}: NewsletterFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    optInWhatsApp: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validação: Se opt-in WhatsApp marcado, número é obrigatório
    if (formData.optInWhatsApp && !formData.whatsapp.trim()) {
      setError('Por favor, preencha o WhatsApp para receber conteúdos neste canal.');
      setIsLoading(false);
      return;
    }

    try {
      // Captura parâmetros UTM da URL
      const urlParams = new URLSearchParams(window.location.search);
      const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

      // Monta o payload conforme especificado
      const payload: WebhookPayload = {
        "Nome": formData.name,
        "Email": formData.email,
        "Origem": origin,
        "Status": "Novo",
        "date:Data de Captação:start": currentDate,
        "Interesse": interesse,
        "Source URL": window.location.href,
        "UTM Campaign": urlParams.get('utm_campaign') || '',
        "Opt-in Email": true, // Sempre true pois é obrigatório para newsletter
        "Opt-in WhatsApp": formData.optInWhatsApp
      };

      // Adiciona WhatsApp ao payload apenas se fornecido
      if (formData.whatsapp.trim()) {
        payload.WhatsApp = formData.whatsapp.trim();
      }

      // Envia para o webhook do n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        
        // Track com GA4 se disponível
        if (typeof (window as any).gtag !== 'undefined') {
          (window as any).gtag('event', 'newsletter_signup', {
            origin,
            interesse,
            utm_campaign: urlParams.get('utm_campaign'),
          });
        }
      } else {
        throw new Error('Erro na resposta do servidor');
      }
    } catch (err) {
      console.error('Erro ao enviar para newsletter:', err);
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
          Você receberá conteúdos exclusivos no email cadastrado
          {formData.optInWhatsApp && formData.whatsapp && ' e também no WhatsApp'}.
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          required
          disabled={isLoading}
          className="w-full px-6 py-4 border-2 border-white/20 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
        />
      </div>

      <div>
        <input
          type="tel"
          placeholder="(11) 99999-9999"
          value={formData.whatsapp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Formatação básica do telefone
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
              value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
              value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
              value = value.replace(/(\d{2})(\d{4})/, '($1) $2');
              value = value.replace(/(\d{2})/, '$1');
              setFormData((prev) => ({ ...prev, whatsapp: value }));
            }
          }}
          disabled={isLoading}
          className={`w-full px-6 py-4 border-2 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 disabled:opacity-50 ${
            formData.optInWhatsApp 
              ? 'border-yellow-300/50 focus:ring-yellow-300/50' 
              : 'border-white/20 focus:ring-white/50'
          }`}
        />
        {formData.optInWhatsApp && (
          <p className="text-xs text-yellow-200 mt-1">
            📱 WhatsApp obrigatório para receber conteúdos neste canal
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="whatsapp-opt"
          checked={formData.optInWhatsApp}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData((prev) => ({ ...prev, optInWhatsApp: e.target.checked }));
            // Se desmarcou o checkbox, limpa o erro se existir
            if (!e.target.checked && error.includes('WhatsApp')) {
              setError('');
            }
          }}
          disabled={isLoading}
          className="w-5 h-5 rounded border-white/20 bg-white/10"
        />
        <label htmlFor="whatsapp-opt" className="text-sm text-blue-100 cursor-pointer">
          Quero receber conteúdos também por WhatsApp 
          {formData.optInWhatsApp && ' (obrigatório)'}
          {!formData.optInWhatsApp && ' (opcional)'}
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
