# 🔌 API Endpoints - Programando para Cristo

## 📊 Visão Geral

Documentação completa de todos os endpoints da API da plataforma Programando para Cristo. A API utiliza o framework Hono rodando no Supabase e sistema Key-Value Store para persistência.

**Base URL:** `https://[PROJECT_ID].supabase.co/functions/v1/server`

## 🔐 Autenticação

### Headers Necessários:
```http
Authorization: Bearer <supabase_access_token>
Content-Type: application/json
```

### Obtenção do Token:
O token é automaticamente gerenciado pelo Supabase Auth no frontend via `auth-context.tsx`.

---

## 👤 Autenticação e Usuários

### `POST /auth/signup`
**Descrição:** Criar nova conta de usuário

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "MinhaSenh@123",
  "name": "Nome Completo",
  "role": "student", // opcional: student|teacher|admin
  "secretCode": "ישוע המשיח הוא אדון" // obrigatório para teacher/admin
}
```

**Response 201:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome Completo",
    "role": "student"
  }
}
```

**Response 400:**
```json
{
  "error": "Código secreto inválido"
}
```

---

### `POST /auth/login`
**Descrição:** Fazer login na plataforma

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "MinhaSenh@123"
}
```

**Response 200:**
```json
{
  "success": true,
  "session": {
    "access_token": "jwt_token",
    "user": {
      "id": "uuid",
      "email": "usuario@exemplo.com"
    }
  }
}
```

---

### `GET /auth/me`
**Descrição:** Obter dados do usuário atual

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "name": "Nome Completo",
    "role": "student",
    "avatar": "https://exemplo.com/avatar.jpg",
    "gamification": {
      "points": 150,
      "level": 2,
      "rank": "Madeira"
    }
  }
}
```

---

## 📰 Artigos

### `GET /articles`
**Descrição:** Listar todos os artigos publicados

**Query Parameters:**
- `category` (opcional): aulas|fe|carreira|comunidade
- `level` (opcional): iniciante|básico|intermediário|avançado
- `author` (opcional): ID do autor
- `limit` (opcional): número máximo de resultados

**Response 200:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "Como Aprender Python",
      "slug": "como-aprender-python",
      "excerpt": "Guia completo para iniciantes",
      "coverImage": "https://exemplo.com/capa.jpg",
      "category": "aulas",
      "level": "iniciante",
      "tags": ["python", "programação"],
      "authorName": "João Silva",
      "views": 150,
      "likes": 23,
      "commentsCount": 5,
      "readTime": 8,
      "publishedAt": "2024-11-01T10:00:00Z"
    }
  ]
}
```

---

### `GET /articles/:slug`
**Descrição:** Obter artigo específico por slug

**Response 200:**
```json
{
  "article": {
    "id": "uuid",
    "title": "Como Aprender Python",
    "slug": "como-aprender-python",
    "excerpt": "Guia completo para iniciantes",
    "content": "# Introdução\n\nPython é uma linguagem...",
    "coverImage": "https://exemplo.com/capa.jpg",
    "category": "aulas",
    "level": "iniciante",
    "tags": ["python", "programação"],
    "authorId": "uuid",
    "authorName": "João Silva",
    "views": 150,
    "likes": 23,
    "commentsCount": 5,
    "readTime": 8,
    "verse": {
      "text": "Tudo posso naquele que me fortalece",
      "reference": "Filipenses 4:13"
    },
    "publishedAt": "2024-11-01T10:00:00Z"
  }
}
```

---

### `POST /articles`
**Descrição:** Criar novo artigo

**Headers:** `Authorization: Bearer <token>`

**Permissões:** teacher, admin

**Body:**
```json
{
  "title": "Título do Artigo",
  "slug": "titulo-do-artigo", // opcional, será gerado se não fornecido
  "excerpt": "Resumo do artigo",
  "content": "# Conteúdo em Markdown\n\nTexto do artigo...",
  "coverImage": "https://exemplo.com/imagem.jpg",
  "category": "aulas",
  "level": "iniciante",
  "tags": ["python", "tutorial"],
  "status": "published", // draft|published
  "verse": {
    "text": "Versículo opcional",
    "reference": "Referência"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "article": {
    "id": "uuid",
    "title": "Título do Artigo",
    "slug": "titulo-do-artigo"
  },
  "pointsEarned": 100
}
```

---

### `PUT /articles/:id`
**Descrição:** Atualizar artigo existente

**Headers:** `Authorization: Bearer <token>`

**Permissões:** author, admin

**Body:** Mesma estrutura do POST

**Response 200:**
```json
{
  "success": true,
  "article": {
    "id": "uuid",
    "title": "Título Atualizado"
  }
}
```

---

### `DELETE /articles/:id`
**Descrição:** Deletar artigo

**Headers:** `Authorization: Bearer <token>`

**Permissões:** author, admin

**Response 200:**
```json
{
  "success": true,
  "message": "Artigo deletado com sucesso"
}
```

---

## 🎯 Desafios

### `GET /challenges`
**Descrição:** Listar todos os desafios publicados

**Query Parameters:**
- `level` (opcional): iniciante|intermediário|avançado
- `technology` (opcional): tecnologia específica
- `author` (opcional): ID do autor

**Response 200:**
```json
{
  "challenges": [
    {
      "id": "uuid",
      "title": "Calculadora em JavaScript",
      "description": "Crie uma calculadora funcional",
      "level": "intermediário",
      "technologies": ["HTML", "CSS", "JavaScript"],
      "points": 75,
      "authorName": "Maria Santos",
      "views": 89,
      "likes": 12,
      "commentsCount": 3,
      "estimatedTime": "2-3 horas",
      "demoUrl": "https://demo.exemplo.com",
      "githubUrl": "https://github.com/exemplo/calc",
      "publishedAt": "2024-11-01T14:00:00Z"
    }
  ]
}
```

---

### `GET /challenges/:slug`
**Descrição:** Obter desafio específico por slug

**Response 200:**
```json
{
  "challenge": {
    "id": "uuid",
    "title": "Calculadora em JavaScript",
    "description": "## Objetivo\n\nCrie uma calculadora...",
    "level": "intermediário",
    "technologies": ["HTML", "CSS", "JavaScript"],
    "points": 75,
    "requirements": [
      "Conhecimento básico de JavaScript",
      "Entendimento de DOM"
    ],
    "steps": [
      "Crie a estrutura HTML",
      "Estilize com CSS",
      "Implemente a lógica JavaScript"
    ],
    "tips": [
      "Use event listeners para os botões",
      "Valide as operações matemáticas"
    ],
    "resources": [
      {
        "title": "MDN JavaScript",
        "url": "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript",
        "description": "Documentação oficial do JavaScript"
      }
    ],
    "demoUrl": "https://demo.exemplo.com",
    "githubUrl": "https://github.com/exemplo/calc",
    "estimatedTime": "2-3 horas",
    "authorName": "Maria Santos",
    "verse": {
      "text": "Em tudo dai graças",
      "reference": "1 Tessalonicenses 5:18"
    }
  }
}
```

---

### `POST /challenges`
**Descrição:** Criar novo desafio

**Headers:** `Authorization: Bearer <token>`

**Permissões:** teacher, admin

**Body:**
```json
{
  "title": "Título do Desafio",
  "description": "## Descrição em Markdown",
  "level": "intermediário",
  "technologies": ["HTML", "CSS", "JavaScript"],
  "requirements": ["Requisito 1", "Requisito 2"],
  "steps": ["Passo 1", "Passo 2"],
  "tips": ["Dica 1", "Dica 2"],
  "resources": [
    {
      "title": "Recurso Útil",
      "url": "https://exemplo.com",
      "description": "Descrição do recurso"
    }
  ],
  "demoUrl": "https://demo.exemplo.com",
  "githubUrl": "https://github.com/exemplo/projeto",
  "estimatedTime": "2-3 horas",
  "status": "published",
  "verse": {
    "text": "Versículo opcional",
    "reference": "Referência"
  }
}
```

**Response 201:**
```json
{
  "success": true,
  "challenge": {
    "id": "uuid",
    "title": "Título do Desafio",
    "points": 75
  },
  "pointsEarned": 150
}
```

---

## 💬 Comentários

### `GET /comments/:contentType/:contentId`
**Descrição:** Obter comentários de um conteúdo

**Parâmetros:**
- `contentType`: article|challenge
- `contentId`: slug do conteúdo

**Response 200:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "Excelente artigo!",
      "authorName": "Pedro Silva",
      "authorAvatar": "https://exemplo.com/avatar.jpg",
      "status": "approved",
      "createdAt": "2024-11-01T15:30:00Z"
    }
  ]
}
```

---

### `POST /comments`
**Descrição:** Criar novo comentário

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "contentType": "article",
  "contentId": "uuid-do-artigo",
  "content": "Meu comentário aqui..."
}
```

**Response 201:**
```json
{
  "success": true,
  "comment": {
    "id": "uuid",
    "status": "pending"
  },
  "message": "Comentário enviado para moderação"
}
```

---

### `PUT /comments/:contentType/:contentId/:commentId/moderate`
**Descrição:** Moderar comentário (aprovar/rejeitar)

**Headers:** `Authorization: Bearer <token>`

**Permissões:** admin

**Body:**
```json
{
  "action": "approve" // approve|reject
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Comentário aprovado com sucesso"
}
```

---

## ❤️ Curtidas

### `GET /likes/check`
**Descrição:** Verificar se usuário curtiu conteúdo

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `contentType`: article|challenge
- `contentId`: ID do conteúdo

**Response 200:**
```json
{
  "liked": true
}
```

---

### `POST /likes/toggle`
**Descrição:** Curtir/descurtir conteúdo

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "contentType": "article",
  "contentId": "uuid-do-conteudo"
}
```

**Response 200:**
```json
{
  "success": true,
  "liked": true,
  "likes": 24
}
```

---

## 🎮 Gamificação

### `POST /gamification/read-article`
**Descrição:** Registrar leitura de artigo

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "articleId": "uuid-do-artigo"
}
```

**Response 200:**
```json
{
  "success": true,
  "pointsEarned": 10,
  "totalPoints": 160,
  "message": "Primeira leitura! +10 pontos"
}
```

**Response 200 (já lido):**
```json
{
  "success": true,
  "pointsEarned": 0,
  "message": "Artigo já foi lido anteriormente"
}
```

---

### `POST /gamification/complete-challenge`
**Descrição:** Registrar conclusão de desafio

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "challengeId": "uuid-do-desafio"
}
```

**Response 200:**
```json
{
  "success": true,
  "pointsEarned": 75,
  "totalPoints": 235,
  "newLevel": 3,
  "newRank": "Madeira",
  "message": "Desafio completado! +75 pontos"
}
```

---

### `GET /gamification/leaderboard`
**Descrição:** Obter ranking de usuários

**Query Parameters:**
- `limit` (opcional): número de usuários (padrão: 10)

**Response 200:**
```json
{
  "leaderboard": [
    {
      "id": "uuid",
      "name": "João Silva",
      "avatar": "https://exemplo.com/avatar.jpg",
      "role": "student",
      "points": 2150,
      "level": 22,
      "rank": "Prata"
    },
    {
      "id": "uuid",
      "name": "Maria Santos",
      "avatar": null,
      "role": "teacher",
      "points": 1890,
      "level": 19,
      "rank": "Bronze"
    }
  ]
}
```

---

## 📊 Dashboard e Estatísticas

### `GET /dashboard/stats`
**Descrição:** Estatísticas do usuário atual

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "stats": {
    "articlesRead": 12,
    "challengesCompleted": 8,
    "articlesPublished": 3, // apenas para teachers/admins
    "challengesCreated": 2,  // apenas para teachers/admins
    "commentsApproved": 15,
    "likesReceived": 67,
    "currentStreak": 5,
    "totalPoints": 1250,
    "level": 13,
    "rank": "Bronze",
    "achievements": [
      "primeiro-passo",
      "leitor-avido",
      "rank-bronze"
    ]
  }
}
```

---

### `GET /admin/stats`
**Descrição:** Estatísticas globais da plataforma

**Headers:** `Authorization: Bearer <token>`

**Permissões:** admin

**Response 200:**
```json
{
  "globalStats": {
    "totalUsers": 156,
    "totalArticles": 45,
    "publishedArticles": 38,
    "totalChallenges": 23,
    "publishedChallenges": 20,
    "totalViews": 8934,
    "totalLikes": 1247,
    "pendingComments": 7,
    "approvedComments": 234,
    "usersByRole": {
      "student": 142,
      "teacher": 12,
      "admin": 2
    },
    "unreadContacts": 3
  }
}
```

---

### `GET /admin/users`
**Descrição:** Listar todos os usuários

**Headers:** `Authorization: Bearer <token>`

**Permissões:** admin

**Response 200:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "role": "student",
      "points": 850,
      "level": 9,
      "rank": "Bronze",
      "createdAt": "2024-10-15T10:00:00Z",
      "lastLoginAt": "2024-11-01T09:30:00Z"
    }
  ]
}
```

---

## 📧 Newsletter e Contato

### `POST /newsletter/subscribe`
**Descrição:** Inscrever-se na newsletter

**Body:**
```json
{
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "whatsappOptIn": false
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso!"
}
```

**Webhook N8N:** Dados enviados automaticamente para o webhook configurado.

---

### `POST /contact`
**Descrição:** Enviar mensagem de contato

**Body:**
```json
{
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "whatsapp": "+5511999999999", // opcional
  "subject": "Assunto da Mensagem",
  "message": "Conteúdo da mensagem..."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso!"
}
```

---

### `GET /admin/contacts`
**Descrição:** Listar mensagens de contato

**Headers:** `Authorization: Bearer <token>`

**Permissões:** admin

**Response 200:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@exemplo.com",
      "whatsapp": "+5511999999999",
      "subject": "Dúvida sobre React",
      "message": "Gostaria de saber mais sobre...",
      "status": "new", // new|replied|closed
      "createdAt": "2024-11-01T16:45:00Z"
    }
  ]
}
```

---

## ⚠️ Códigos de Erro

### Códigos HTTP Comuns:

| Código | Significado | Exemplo |
|--------|-------------|---------|
| 200 | Sucesso | Operação realizada com sucesso |
| 201 | Criado | Recurso criado com sucesso |
| 400 | Requisição Inválida | Dados obrigatórios ausentes |
| 401 | Não Autorizado | Token ausente ou inválido |
| 403 | Proibido | Sem permissão para a operação |
| 404 | Não Encontrado | Recurso não existe |
| 409 | Conflito | Email já cadastrado |
| 500 | Erro do Servidor | Erro interno |

### Exemplos de Respostas de Erro:

**400 Bad Request:**
```json
{
  "error": "Campo 'title' é obrigatório",
  "code": "MISSING_FIELD"
}
```

**401 Unauthorized:**
```json
{
  "error": "Token de acesso inválido ou expirado",
  "code": "INVALID_TOKEN"
}
```

**403 Forbidden:**
```json
{
  "error": "Apenas professores e admins podem criar artigos",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

---

## 🔧 Rate Limiting

### Limites Atuais:
- **Comentários**: 5 por minuto por usuário
- **Likes**: 20 por minuto por usuário
- **Newsletter**: 1 inscrição por IP por hora
- **Contato**: 3 mensagens por IP por hora

### Header de Resposta:
```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 17
X-RateLimit-Reset: 1699027200
```

---

## 🚀 Versionamento

**Versão Atual:** `v1`

### Changelog da API:
- **v1.0**: Versão inicial com todas as funcionalidades
- **v1.1**: Adição do sistema de gamificação
- **v1.2**: Sistema de comentários moderados
- **v1.3**: Sistema completo de gerenciamento de conteúdo

---

## 📝 Notas Importantes

### Autenticação:
- Tokens têm validade de 1 hora
- Refresh automático gerenciado pelo Supabase
- Logout limpa todos os tokens

### Dados:
- Todos os timestamps são em UTC (ISO 8601)
- Slugs são gerados automaticamente se não fornecidos
- Markdown é renderizado no frontend (não no backend)

### Limites:
- Artigos: 10.000 caracteres no conteúdo
- Comentários: 1.000 caracteres
- Tags: máximo 10 por artigo
- Upload de imagens: via URL externa apenas

---

## 🙏 Versículo de Encerramento

> "Tudo quanto te vier à mão para fazer, faze-o conforme as tuas forças."  
> — Eclesiastes 9:10

Esta API foi desenvolvida com excelência técnica para servir à missão de ensinar programação com propósito cristão! 🚀✝️