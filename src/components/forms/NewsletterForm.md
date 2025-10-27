# Exemplo de Uso do NewsletterForm

O componente `NewsletterForm` foi atualizado para integrar com webhook do n8n e capturar todos os dados necessários conforme especificado.

## Campos Capturados Automaticamente

- **Data de Captação**: Gerada automaticamente no formato YYYY-MM-DD
- **Source URL**: URL atual da página
- **UTM Campaign**: Capturada automaticamente da URL
- **Status**: Sempre definido como "Novo"
- **Opt-in Email**: Sempre `true` (obrigatório para newsletter)

## Campos Configuráveis

- **Origem**: Definida via prop `origin`
- **Interesse**: Definida via prop `interesse` (padrão: "Newsletter")
- **Webhook URL**: Definida via variável de ambiente `VITE_N8N_WEBHOOK_URL`

## Campos do Formulário

- **Nome**: Campo obrigatório preenchido pelo usuário
- **Email**: Campo obrigatório preenchido pelo usuário  
- **WhatsApp**: Campo opcional com formatação automática (11) 99999-9999
- **Opt-in WhatsApp**: Checkbox opcional (se marcado, o WhatsApp se torna obrigatório)

## Configuração

1. Defina a variável de ambiente:
```bash
VITE_N8N_WEBHOOK_URL=https://seu-n8n-instance.com/webhook/newsletter
```

2. Use o componente:

### Exemplo 1: Landing Page de Curso
```tsx
<NewsletterForm 
  origin="Landing Page" 
  interesse="Curso"
/>
```

### Exemplo 2: Blog
```tsx
<NewsletterForm 
  origin="Blog" 
  interesse="Newsletter"
/>
```

### Exemplo 3: Com webhook customizado
```tsx
<NewsletterForm 
  origin="Página de Contato" 
  interesse="Suporte"
  webhookUrl="https://webhook-personalizado.com/api"
/>
```

## Payload Enviado para o Webhook

```json
{
  "Nome": "João Silva",
  "Email": "joao@exemplo.com",
  "WhatsApp": "(11) 99999-9999",
  "Origem": "Landing Page",
  "Status": "Novo",
  "date:Data de Captação:start": "2025-10-13",
  "Interesse": "Curso",
  "Source URL": "https://bombatech.com.br/lp-curso",
  "UTM Campaign": "curso-programacao-out-2025",
  "Opt-in Email": true,
  "Opt-in WhatsApp": true
}
```

**Nota**: O campo `WhatsApp` só é incluído no payload se um número for fornecido.

## Integração com Google Analytics

O componente também envia eventos para o Google Analytics (GA4) quando disponível:

```javascript
gtag('event', 'newsletter_signup', {
  origin: 'Landing Page',
  interesse: 'Curso',
  utm_campaign: 'curso-programacao-out-2025'
});
```

## Tratamento de Erros

- Validação de campos obrigatórios (nome e email)
- Tratamento de erros de rede
- Feedback visual para o usuário
- Estado de loading durante o envio