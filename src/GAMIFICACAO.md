# 🎮 Sistema de Gamificação - Programando para Cristo

## 📊 Visão Geral

O sistema de gamificação foi implementado para motivar alunos e professores através de pontos, níveis e ranks. Todos os usuários (alunos, professores e admins) participam do sistema de gamificação.

## 🎯 Roles (Funções)

### 👨‍🎓 Aluno (Student)
- **Permissões:**
  - Ler artigos públicos no blog
  - Acessar desafios de programação (protegido por login)
  - Criar artigos em modo rascunho (não publicados)
  - Comentar em artigos e desafios (moderado)
  - Dar likes em conteúdo
  - Ver dashboard pessoal e ranking
- **Pontos:**
  - +10 pontos por artigo lido
  - +50-100 pontos por desafio completado (varia com dificuldade)

### 👨‍🏫 Professor (Teacher)
- **Permissões:**
  - Todas as permissões de aluno
  - Publicar artigos diretamente
  - Criar e publicar desafios de programação
- **Pontos:**
  - +100 pontos por artigo publicado
  - +150 pontos por desafio publicado
  - +10 pontos por artigo lido
  - +50-100 pontos por desafio completado

### 👑 Admin (Administrador)
- **Permissões:**
  - Todas as permissões de professor
  - Ver métricas completas da plataforma
  - Moderar comentários (aprovar/rejeitar)
  - Gerenciar usuários
  - Ver contatos e mensagens
  - Editar qualquer conteúdo
- **Pontos:**
  - Mesmos pontos que professores
  - Acesso a dashboard administrativo completo

## 🏆 Sistema de Ranks

| Rank | Pontos Necessários | Cor | Ícone |
|------|-------------------|-----|-------|
| 🪵 Madeira | 0 - 499 | Marrom | Award |
| 🥉 Bronze | 500 - 1,999 | Laranja | Award |
| 🥈 Prata | 2,000 - 4,999 | Cinza | Trophy |
| 🥇 Ouro | 5,000 - 9,999 | Amarelo | Crown |
| 💎 Diamante | 10,000+ | Ciano | Star |

## 📈 Sistema de Níveis

- Nível = `Math.floor(pontos / 100) + 1`
- A cada 100 pontos, o usuário sobe 1 nível
- Exemplo: 
  - 0-99 pontos = Nível 1
  - 100-199 pontos = Nível 2
  - 500 pontos = Nível 6

## 💰 Como Ganhar Pontos

### Para Todos os Usuários:
1. **Ler Artigo** → +10 pontos
   - Apenas na primeira leitura
   - Rastreado automaticamente

2. **Completar Desafio** → +50 a +100 pontos
   - Iniciante: +50 pontos
   - Intermediário: +75 pontos
   - Avançado: +100 pontos
   - Apenas uma vez por desafio

### Para Professores e Admins:
3. **Publicar Artigo** → +100 pontos
   - Apenas artigos publicados
   - Rascunhos não contam

4. **Criar Desafio** → +150 pontos
   - Apenas desafios publicados

## 🎯 Conquistas

### Conquistas Disponíveis:
- ⚡ **Primeiro Passo**: Complete seu primeiro desafio
- 💻 **Programador Dedicado**: Complete 10 desafios
- 📚 **Leitor Ávido**: Leia 5 artigos
- 🏆 **Rank Bronze**: Alcance 500 pontos
- 🥈 **Rank Prata**: Alcance 2,000 pontos
- 🥇 **Rank Ouro**: Alcance 5,000 pontos
- 💎 **Rank Diamante**: Alcance 10,000 pontos

## 📱 Dashboard do Aluno

### Informações Exibidas:
- **Card de Perfil:**
  - Nome do usuário
  - Rank atual com badge colorido
  - Nível atual
  - Total de pontos
  - Barra de progresso para próximo rank

- **Estatísticas:**
  - Desafios completados
  - Artigos lidos
  - Artigos publicados (se professor/admin)
  - Sequência de dias (streak)

- **Ranking Global:**
  - Top 10 usuários
  - Posição no ranking
  - Comparação com outros usuários

- **Conquistas:**
  - Grid de conquistas desbloqueadas
  - Conquistas bloqueadas (em progresso)

## 🔐 Autenticação

### Cadastro:
- URL padrão: `/registro` → Cria conta de aluno
- URL com role: `/registro?role=teacher` → Permite criar conta de professor
- URL com role admin: `/registro?role=admin` → Permite criar conta de admin

### Login:
- Sistema corrigido para evitar loop infinito
- Usa Supabase Auth nativo
- Token armazenado na sessão
- Redirecionamento automático após login

## 🛠️ Rotas da API

### Gamificação:
- `POST /gamification/complete-challenge` - Registrar conclusão de desafio
- `POST /gamification/read-article` - Registrar leitura de artigo
- `GET /gamification/leaderboard?limit=10` - Buscar ranking global

### Dashboard:
- `GET /dashboard/stats` - Estatísticas do usuário atual
- `GET /admin/stats` - Estatísticas globais (admin only)
- `GET /admin/users` - Lista de todos os usuários (admin only)

### Autenticação:
- `POST /auth/signup` - Criar nova conta (aceita `role` opcional)
- `POST /auth/login` - Login (retorna token Supabase)
- `GET /auth/me` - Dados do usuário atual

## 💡 Exemplos de Uso

### Completar um Desafio:
```javascript
const response = await fetchAPI('/gamification/complete-challenge', {
  method: 'POST',
  body: JSON.stringify({ challengeId: 'abc123' })
});

// Retorna:
{
  success: true,
  pointsEarned: 75,
  totalPoints: 575,
  newLevel: 6,
  newRank: 'Bronze'
}
```

### Registrar Leitura de Artigo:
```javascript
const response = await fetchAPI('/gamification/read-article', {
  method: 'POST',
  body: JSON.stringify({ articleId: 'xyz789' })
});

// Retorna:
{
  success: true,
  pointsEarned: 10,
  totalPoints: 585
}
```

## 🎨 Componentes

### DashboardPage
- Localização: `/components/pages/DashboardPage.tsx`
- Exibe gamificação completa
- Tabs: Ranking, Conquistas, Atividade
- Cards de estatísticas
- Ações rápidas

### RegisterPage (Atualizado)
- Suporta seleção de role via URL param
- Validação de senha robusta
- Role padrão: student

### AuthContext (Corrigido)
- Corrigido loop infinito
- Usa Supabase Auth nativo
- Ref para evitar múltiplas chamadas
- Suporte a 3 roles

## 🐛 Correções Implementadas

### Loop Infinito de Autenticação:
**Problema:** O listener `onAuthStateChange` disparava múltiplas vezes causando loop

**Solução:**
1. Removido `setSession` manual
2. Usado `signInWithPassword` diretamente do Supabase
3. Adicionado `useRef` para evitar múltiplas chamadas de `fetchUser`
4. Removido listener desnecessário de SIGNED_IN

### Sistema de Pontos:
- Validação de desafio/artigo já completado/lido
- Cálculo correto de rank e nível
- Armazenamento em KV store

## 📊 Métricas Admin

### Dashboard Admin tem acesso a:
- Total de artigos (publicados e rascunhos)
- Total de desafios
- Total de visualizações
- Total de likes
- Comentários pendentes de moderação
- Total de usuários por role
- Contatos não lidos

## 🚀 Próximos Passos

- [ ] Implementar sistema de streak (sequência de dias)
- [ ] Adicionar mais conquistas
- [ ] Sistema de notificações de progresso
- [ ] Badges visuais personalizados
- [ ] Histórico de atividades detalhado
- [ ] Gráficos de evolução de pontos
- [ ] Competições e desafios temporários
