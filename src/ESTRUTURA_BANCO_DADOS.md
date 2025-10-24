# Estrutura do Banco de Dados - Programando para Cristo

## Visão Geral

O sistema utiliza Supabase como backend, com um sistema de Key-Value Store (KV) para armazenar todos os dados. A estrutura está organizada com prefixos para diferentes tipos de dados.

## Tabelas Principais (Prefixos KV)

### 1. Usuários (`users:`)

**Chave**: `users:{userId}`

**Estrutura**:
```json
{
  "id": "uuid",
  "email": "string",
  "name": "string",
  "username": "string | null",
  "role": "student | teacher | admin",
  "status": "active | inactive",
  "emailVerified": "boolean",
  "avatar": "string | null",
  "bio": "string | null",
  "gamification": {
    "points": "number",
    "level": "number",
    "rank": "Madeira | Bronze | Prata | Ouro | Diamante",
    "completedChallenges": "number",
    "articlesPublished": "number",
    "articlesRead": "number",
    "commentsApproved": "number",
    "likesReceived": "number",
    "streak": "number",
    "lastActivityDate": "ISO date",
    "achievements": "array"
  },
  "studentData": {
    "level": "iniciante | intermediário | avançado",
    "completedChallenges": "number",
    "articlesRead": "number",
    "joinedAt": "ISO date",
    "lastLoginAt": "ISO date",
    "streak": "number",
    "totalPoints": "number"
  },
  "preferences": {
    "theme": "system | light | dark",
    "emailNotifications": "boolean",
    "newsletterSubscribed": "boolean",
    "favoriteCategories": "array"
  },
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Índices Secundários**:
- `user-email:{email}` → `userId` (para busca por email)
- `username:{username}` → `userId` (para busca por username)

---

### 2. Artigos (`articles:`)

**Chave**: `articles:{articleId}`

**Estrutura**:
```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "markdown string",
  "coverImage": "url | null",
  "category": "aulas | fe | carreira | comunidade",
  "level": "iniciante | intermediário | avançado",
  "tags": ["array", "of", "strings"],
  "status": "draft | published | archived",
  "authorId": "uuid",
  "authorName": "string",
  "views": "number",
  "likes": "number",
  "commentsCount": "number",
  "sharesCount": "number",
  "readTime": "number (minutos)",
  "verse": {
    "text": "string",
    "reference": "string"
  },
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "publishedAt": "ISO date | null"
}
```

**Índices Secundários**:
- `article-slug:{slug}` → `articleId` (para busca por slug)

**Relacionamentos**:
- `authorId` → `users:{userId}`
- Likes → `likes:article:{articleId}:{userId}`
- Comentários → `comments:article:{articleId}:{commentId}`
- Leituras → `article-read:{userId}:{articleId}`

---

### 3. Desafios (`challenges:`)

**Chave**: `challenges:{challengeId}`

**Estrutura**:
```json
{
  "id": "uuid",
  "title": "string",
  "description": "markdown string",
  "level": "iniciante | intermediário | avançado",
  "technologies": ["HTML", "CSS", "JavaScript", "React", etc],
  "points": "number",
  "status": "draft | published | archived",
  "authorId": "uuid",
  "authorName": "string",
  "requirements": ["array", "of", "requirements"],
  "tips": ["array", "of", "tips"],
  "demoUrl": "url | null",
  "codeUrl": "url | null",
  "views": "number",
  "likes": "number",
  "commentsCount": "number",
  "demoClicks": "number",
  "codeClicks": "number",
  "createdAt": "ISO date",
  "updatedAt": "ISO date",
  "publishedAt": "ISO date | null"
}
```

**Relacionamentos**:
- `authorId` → `users:{userId}`
- Likes → `likes:challenge:{challengeId}:{userId}`
- Comentários → `comments:challenge:{challengeId}:{commentId}`
- Conclusões → `challenge-completion:{userId}:{challengeId}`

---

### 4. Likes (`likes:`)

**Chave**: `likes:{contentType}:{contentId}:{userId}`

Onde `contentType` pode ser:
- `article` para artigos
- `challenge` para desafios

**Estrutura**:
```json
{
  "userId": "uuid",
  "contentType": "article | challenge",
  "contentId": "uuid",
  "createdAt": "ISO date"
}
```

**Relacionamentos**:
- `userId` → `users:{userId}`
- `contentId` → `articles:{articleId}` ou `challenges:{challengeId}`

---

### 5. Comentários (`comments:`)

**Chave**: `comments:{contentType}:{contentId}:{commentId}`

**Estrutura**:
```json
{
  "id": "uuid",
  "contentType": "article | challenge",
  "contentId": "uuid",
  "content": "string",
  "authorId": "uuid",
  "authorName": "string",
  "authorAvatar": "url | null",
  "status": "pending | approved | rejected",
  "moderatedBy": "uuid | null",
  "moderatedAt": "ISO date | null",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Relacionamentos**:
- `authorId` → `users:{userId}`
- `moderatedBy` → `users:{userId}`
- `contentId` → `articles:{articleId}` ou `challenges:{challengeId}`

---

### 6. Newsletter (`newsletter:`)

**Chave**: `newsletter:{email}`

**Estrutura**:
```json
{
  "email": "string",
  "name": "string",
  "status": "active | unsubscribed",
  "source": "Landing Page | Blog | etc",
  "sourceUrl": "url",
  "utmCampaign": "string | null",
  "utmSource": "string | null",
  "utmMedium": "string | null",
  "optInWhatsApp": "boolean",
  "subscribedAt": "ISO date",
  "createdAt": "ISO date"
}
```

**Webhook N8N Payload**:
```json
{
  "Nome": "string",
  "Email": "string",
  "Origem": "string",
  "Status": "Novo",
  "date:Data de Captação:start": "YYYY-MM-DD",
  "Interesse": "Curso",
  "Source URL": "url",
  "UTM Campaign": "string | null",
  "Opt-in Email": true,
  "Opt-in WhatsApp": "boolean"
}
```

---

### 7. Contatos (`contacts:`)

**Chave**: `contacts:{contactId}`

**Estrutura**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "whatsapp": "string | null",
  "subject": "string",
  "message": "string",
  "status": "new | replied | closed",
  "createdAt": "ISO date"
}
```

---

### 8. Gamificação - Conclusão de Desafios

**Chave**: `challenge-completion:{userId}:{challengeId}`

**Estrutura**:
```json
{
  "userId": "uuid",
  "challengeId": "uuid",
  "completedAt": "ISO date",
  "pointsEarned": "number"
}
```

**Relacionamentos**:
- `userId` → `users:{userId}`
- `challengeId` → `challenges:{challengeId}`

---

### 9. Gamificação - Leitura de Artigos

**Chave**: `article-read:{userId}:{articleId}`

**Estrutura**:
```json
{
  "userId": "uuid",
  "articleId": "uuid",
  "readAt": "ISO date"
}
```

**Relacionamentos**:
- `userId` → `users:{userId}`
- `articleId` → `articles:{articleId}`

---

## Sistema de Pontos (Gamificação)

### Pontuação por Ação

| Ação | Pontos | Quem Ganha |
|------|--------|------------|
| Ler artigo | 10 | Todos |
| Completar desafio iniciante | 50 | Alunos |
| Completar desafio intermediário | 75 | Alunos |
| Completar desafio avançado | 100 | Alunos |
| Publicar artigo | 100 | Professores e Admins |
| Criar desafio | 150 | Professores e Admins |
| Comentário aprovado | 5 | Todos (futuro) |

### Ranks (baseados em pontos)

| Rank | Pontos Necessários |
|------|-------------------|
| Madeira | 0 - 499 |
| Bronze | 500 - 1,999 |
| Prata | 2,000 - 4,999 |
| Ouro | 5,000 - 9,999 |
| Diamante | 10,000+ |

### Nível

Calculado como: `Math.floor(pontos / 100) + 1`

---

## Roles (Tipos de Usuário)

### Student (Aluno)
- Pode ler artigos
- Pode resolver desafios
- Pode curtir e comentar
- Pode visualizar ranking
- Pode ver próprio dashboard

### Teacher (Professor)
- Tudo que o aluno pode
- Pode publicar artigos
- Pode criar desafios
- Ganha pontos por publicar conteúdo

### Admin (Administrador)
- Tudo que o professor pode
- Pode moderar comentários
- Pode visualizar todas as estatísticas
- Pode gerenciar usuários
- Pode deletar conteúdo

**Código Secreto para Teacher/Admin**: `ישוע המשיח הוא אדון` (Jesus Cristo é Senhor em hebraico)

---

## Fluxo de Dados

### 1. Criação de Artigo
1. Professor/Admin cria artigo via interface
2. Sistema valida permissões
3. Artigo salvo em `articles:{articleId}`
4. Índice criado em `article-slug:{slug}`
5. Se publicado, autor ganha 100 pontos

### 2. Leitura de Artigo
1. Usuário acessa artigo público
2. Sistema incrementa `views`
3. Se logado e primeira leitura:
   - Cria `article-read:{userId}:{articleId}`
   - Usuário ganha 10 pontos
   - Atualiza gamificação do usuário

### 3. Conclusão de Desafio
1. Aluno completa desafio
2. Sistema verifica se já foi completado
3. Se não:
   - Cria `challenge-completion:{userId}:{challengeId}`
   - Calcula pontos (50/75/100)
   - Atualiza gamificação do usuário
   - Recalcula rank e nível

### 4. Sistema de Comentários
1. Usuário logado envia comentário
2. Comentário criado com status `pending`
3. Admin acessa painel de moderação
4. Admin aprova/rejeita comentário
5. Se aprovado, comentário aparece publicamente

---

## Melhorias Futuras Sugeridas

1. **Migrar para Tabelas SQL Reais**
   - Melhor performance em queries complexas
   - Relacionamentos nativos
   - Suporte a transações

2. **Adicionar Índices**
   - Busca por tags
   - Filtro por categoria + nível
   - Ranking por período

3. **Sistema de Notificações**
   - Notificar quando comentário for aprovado
   - Notificar sobre novos artigos/desafios
   - Alertas de conquistas

4. **Sistema de Conquistas (Achievements)**
   - Primeira leitura
   - Primeiro desafio completado
   - 10 artigos lidos
   - Rank Ouro alcançado
   - etc.

---

## Considerações Técnicas

### Vantagens do Sistema KV Atual
- Fácil de prototipar
- Flexível para mudanças de schema
- Não requer migrações
- Simples de entender

### Limitações do Sistema KV
- Queries complexas são caras (getByPrefix pega tudo)
- Sem relacionamentos nativos
- Sem transações ACID
- Dificuldade em manter consistência em updates relacionados
- Performance degrada com muitos registros

### Quando Migrar para SQL
- Quando houver mais de 1000 usuários ativos
- Quando precisar de queries complexas (ex: "artigos mais lidos do mês")
- Quando precisar de relatórios analíticos
- Quando precisar de integridade referencial forte
