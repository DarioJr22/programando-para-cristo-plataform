# Programando para Cristo 🙏💻

Uma plataforma educacional cristã para ensinar programação do zero, integrando fé, tecnologia e propósito.

## ✨ Funcionalidades

### Área Pública
- ✅ Landing Page inspiradora com seções completas
- ✅ Blog com artigos sobre programação, fé e carreira
- ✅ Sistema de filtros e busca
- ✅ Newsletter integrada com webhook N8N
- ✅ Formulário de contato
- ✅ Leitura de artigos sem necessidade de login

### Área de Alunos (Requer Login)
- ✅ Dashboard pessoal com estatísticas
- ✅ Acesso a desafios de programação
- ✅ Sistema de likes em artigos e desafios
- ✅ Sistema de comentários (com moderação)
- ✅ Perfil e configurações

### Área Administrativa (Requer Role Admin)
- ✅ Dashboard com métricas completas
- ✅ CRUD de artigos e desafios
- ✅ Moderação de comentários
- ✅ Criação de conteúdo de exemplo
- ✅ Visualização de estatísticas

## 🚀 Como Começar

### 1. Primeiro Acesso

**Criar o primeiro usuário admin:**

1. Vá para a página de registro: `/registro`
2. Crie uma conta com:
   - Nome: Seu nome
   - Email: seu@email.com
   - Senha: Mínimo 8 caracteres com maiúscula, minúscula e número

3. **IMPORTANTE:** O primeiro usuário criado será um estudante por padrão. Para torná-lo admin:
   - Abra o console do navegador (F12)
   - Execute o seguinte código:

   \`\`\`javascript
   // Faça login primeiro, depois execute:
   const response = await fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-fe860986/auth/me', {
     headers: {
       'Authorization': 'Bearer ' + (await supabase.auth.getSession()).data.session.access_token
     }
   });
   const userData = await response.json();
   
   // Agora atualize o role para admin manualmente no KV store
   // Você precisará fazer isso via backend ou usando as ferramentas do Supabase
   \`\`\`

   **Solução mais simples:** Modifique temporariamente o backend para criar o primeiro usuário como admin:

   Em `/supabase/functions/server/index.tsx`, na rota `/auth/signup`, altere:
   \`\`\`typescript
   role: 'student', // ← Mude para 'admin' temporariamente
   \`\`\`

   Depois de criar sua conta admin, reverta para 'student'.

### 2. Popular com Conteúdo de Exemplo

1. Faça login como admin
2. Vá para `/admin`
3. Clique em "Criar Artigo de Exemplo" para adicionar um artigo de teste
4. Clique em "Criar Desafio de Exemplo" para adicionar um desafio de teste
5. Navegue pelo blog e desafios para ver o conteúdo

### 3. Configurar Newsletter (Opcional)

Para integrar com N8N:

1. Crie um workflow no N8N com um webhook
2. Configure a variável de ambiente `N8N_WEBHOOK_URL` no Supabase:
   - Vá para Settings > Edge Functions > Environment Variables
   - Adicione: `N8N_WEBHOOK_URL` = sua URL do webhook N8N

## 📝 Estrutura de Dados

### KV Store Schema

```typescript
// Usuários
users:{userId} → {
  id, email, name, role, avatar, bio, studentData, preferences...
}

// Artigos
articles:{articleId} → {
  id, slug, title, content, category, tags, views, likes...
}

// Desafios
challenges:{challengeId} → {
  id, slug, title, description, level, technologies, demoUrl, githubUrl...
}

// Comentários
comments:{contentType}:{contentId}:{commentId} → {
  id, contentType, contentId, authorId, content, status...
}

// Likes
likes:{contentType}:{contentId}:{userId} → {
  userId, contentType, contentId, createdAt
}

// Newsletter
newsletter:{email} → {
  email, name, status, source, utmCampaign...
}
```

## 🎨 Customização

### Cores e Estilos

As cores principais estão configuradas no `styles/globals.css`. Você pode personalizar:

- **Primary:** Azul (#3B82F6)
- **Secondary:** Roxo (#A855F7)  
- **Accent:** Dourado (#F59E0B)

### Conteúdo

#### Criar Artigo

Use o formato Markdown para o conteúdo:

```markdown
## Título da Seção

Parágrafo com **negrito** e *itálico*.

### Subtítulo

- Item de lista 1
- Item de lista 2

```javascript
// Bloco de código
console.log('Hello World');
```

[Link para recurso](https://exemplo.com)
```

#### Categorias de Artigos

- `aulas`: Tutoriais e aulas práticas
- `fe`: Fé e programação
- `carreira`: Orientação de carreira
- `comunidade`: Desafios e projetos

#### Níveis

- `iniciante`: Para quem está começando do zero
- `basico`: Conhecimento básico de programação
- `intermediario`: Experiência com conceitos intermediários

## 🔐 Autenticação

### Fluxos

**Registro:**
1. Usuário preenche nome, email, senha
2. Validação de senha forte (8+ chars, maiúscula, minúscula, número)
3. Conta criada via Supabase Auth
4. Dados armazenados no KV Store
5. Email confirmado automaticamente (sem servidor de email configurado)

**Login:**
1. Usuário fornece email e senha
2. Autenticação via Supabase Auth
3. JWT token retornado
4. Redirecionamento baseado em role (admin → /admin, student → /dashboard)

**Proteção de Rotas:**
- Desafios: Requer login (qualquer usuário autenticado)
- Dashboard: Requer login (student ou admin)
- Admin: Requer login + role admin

## 📊 Analytics

### Google Analytics 4

Para configurar GA4:

1. Crie uma propriedade GA4
2. Obtenha o Measurement ID (G-XXXXXXXXXX)
3. Adicione ao `<head>` do HTML:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Eventos Rastreados

- `newsletter_signup` - Inscrição na newsletter
- `sign_up` - Criação de conta
- `login` - Login de usuário
- `article_view` - Visualização de artigo
- `article_like` - Curtida em artigo
- `article_share` - Compartilhamento de artigo
- `challenge_view` - Visualização de desafio
- `challenge_like` - Curtida em desafio

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons

**Backend:**
- Supabase (Auth + Storage)
- Deno (Edge Functions)
- Hono (Web Framework)
- KV Store (Banco de Dados)

**Integrações:**
- N8N (Newsletter Webhook)
- Unsplash (Imagens)
- Google Analytics 4 (Analytics)

### Estrutura de Pastas

```
/
├── components/
│   ├── layout/          # Header, Footer
│   ├── auth/            # Login, Register
│   ├── pages/           # Landing, Blog, Article, Admin
│   ├── forms/           # Newsletter, Contact
│   └── ui/              # Shadcn components
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── auth-context.tsx # Auth context
├── supabase/
│   └── functions/
│       └── server/      # Backend API routes
├── styles/
│   └── globals.css      # Global styles
└── App.tsx              # Main app with routing
```

## 📱 Responsividade

A plataforma é totalmente responsiva:

- **Mobile:** 1 coluna, menu hambúrguer
- **Tablet:** 2 colunas, navegação completa
- **Desktop:** 3 colunas, sidebars sticky

## ♿ Acessibilidade

Implementado seguindo WCAG 2.1 Nível AA:

- ✅ Navegação completa por teclado
- ✅ Foco visível em todos os elementos
- ✅ Contraste de cores adequado
- ✅ Headings semânticos
- ✅ ARIA labels em ícones
- ✅ Alt text em imagens

## 🙏 Tom de Voz Cristão

A plataforma integra valores cristãos naturalmente:

- Versículos inspiradores em seções estratégicas
- Mensagens motivacionais baseadas em princípios bíblicos
- Categoria específica "Fé e Programação"
- Tom acolhedor e encorajador
- Testemunhos de transformação

## 📄 Licença

Este projeto foi criado para fins educacionais e ministeriais.

## 🤝 Contribuindo

Para contribuir com o projeto:

1. Faça login como admin
2. Crie artigos e desafios de qualidade
3. Modere comentários ativamente
4. Compartilhe feedback e sugestões

---

**Versículo do Projeto:**

> "Tudo quanto te vier à mão para fazer, faze-o conforme as tuas forças."  
> — Eclesiastes 9:10a

Que este projeto abençoe vidas e glorifique a Deus! 🚀✝️
