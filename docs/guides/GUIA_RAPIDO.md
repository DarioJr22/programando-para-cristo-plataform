# 🚀 Guia Rápido - Programando para Cristo

## 📝 Cadastro e Login

### Como Criar uma Conta:

#### Aluno (Padrão):
1. Acesse `/registro`
2. Preencha: Nome, Email, Senha (mínimo 8 caracteres com maiúscula, minúscula e número)
3. Clique em "Criar Conta Gratuita"
4. Será redirecionado para fazer login

#### Professor:
1. Acesse `/registro?role=teacher`
2. Selecione "Professor" no campo "Tipo de Conta"
3. Preencha os dados e crie a conta

#### Administrador:
1. Acesse `/registro?role=admin`
2. Selecione "Administrador" no campo "Tipo de Conta"
3. Preencha os dados e crie a conta

### Login:
1. Acesse `/login`
2. Digite email e senha
3. Será redirecionado para `/dashboard`

**⚠️ PROBLEMA RESOLVIDO:** O loop infinito de autenticação foi corrigido!

## 🎮 Sistema de Gamificação

### Como Ganhar Pontos:

#### Todos os Usuários:
- **Ler um artigo**: +10 pontos
- **Completar desafio iniciante**: +50 pontos
- **Completar desafio intermediário**: +75 pontos
- **Completar desafio avançado**: +100 pontos

#### Professores e Admins:
- **Publicar artigo**: +100 pontos
- **Criar desafio**: +150 pontos

### Ranks:
- 🪵 **Madeira**: 0 - 499 pontos
- 🥉 **Bronze**: 500 - 1,999 pontos
- 🥈 **Prata**: 2,000 - 4,999 pontos
- 🥇 **Ouro**: 5,000 - 9,999 pontos
- 💎 **Diamante**: 10,000+ pontos

## 📱 Navegação

### Páginas Públicas (sem login):
- **/** - Landing page com apresentação da plataforma
- **/blog** - Lista de artigos publicados
- **/artigo/{slug}** - Visualização de artigo individual
- **/contato** - Formulário de contato
- **/login** - Página de login
- **/registro** - Página de cadastro

### Páginas Protegidas (requer login):
- **/dashboard** - Dashboard pessoal com gamificação
- **/desafios** - Lista de desafios de programação

### Páginas Administrativas (requer role professor/admin):
- **/admin** - Painel administrativo completo

## 👨‍🎓 Para Alunos

### O que você pode fazer:
1. ✅ Ler artigos do blog
2. ✅ Resolver desafios de programação
3. ✅ Comentar (comentários são moderados)
4. ✅ Dar likes em artigos e desafios
5. ✅ Ver seu progresso no dashboard
6. ✅ Competir no ranking global
7. ✅ Criar artigos em modo rascunho

### Primeiro Acesso - Passo a Passo:
1. Faça cadastro em `/registro`
2. Faça login em `/login`
3. Acesse o `/dashboard` para ver seu progresso
4. Vá para `/blog` e leia um artigo (+10 pontos)
5. Vá para `/desafios` e complete um desafio (+50-100 pontos)
6. Suba de nível e desbloqueie conquistas!

## 👨‍🏫 Para Professores

### Permissões Adicionais:
1. ✅ Publicar artigos diretamente (sem moderação)
2. ✅ Criar e publicar desafios
3. ✅ Ganhar mais pontos (+100 por artigo, +150 por desafio)
4. ✅ Acesso ao painel administrativo

### Como Publicar Conteúdo:
1. Acesse `/admin`
2. Clique em "Criar Artigo" ou "Criar Desafio"
3. Preencha os campos:
   - **Artigo**: Título, slug, categoria, conteúdo, imagem
   - **Desafio**: Título, descrição, nível, tecnologias, links
4. Selecione status "Publicado"
5. Clique em "Publicar" e ganhe pontos!

## 👑 Para Administradores

### Acesso Completo:
1. ✅ Todas as permissões de professor
2. ✅ Ver métricas globais da plataforma
3. ✅ Moderar comentários pendentes
4. ✅ Gerenciar todos os usuários
5. ✅ Ver mensagens de contato
6. ✅ Editar/deletar qualquer conteúdo

### Dashboard Admin:
- **Estatísticas:**
  - Total de artigos e desafios
  - Visualizações e likes
  - Comentários pendentes
  - Total de usuários (por role)
  
- **Ações:**
  - Aprovar/Rejeitar comentários
  - Criar/Editar/Deletar conteúdo
  - Ver mensagens de contato

## 🎯 Dicas para Subir Rápido no Ranking

### Para Alunos:
1. Leia 10 artigos = +100 pontos
2. Complete 10 desafios = +500 a 1000 pontos
3. **Meta realista:** Em 1 semana você pode alcançar Bronze (500 pontos)

### Para Professores:
1. Publique 5 artigos = +500 pontos
2. Crie 3 desafios = +450 pontos
3. Leia 5 artigos = +50 pontos
4. **Meta realista:** Em 1 semana você pode alcançar Prata (2000 pontos)

## 📊 Entendendo o Dashboard

### Seção Superior:
- **Card de Perfil:** Seu nome, rank, nível e pontos totais
- **Barra de Progresso:** Mostra quanto falta para o próximo rank

### Grid de Estatísticas:
- Desafios completados
- Artigos lidos
- Artigos publicados (se professor/admin)
- Sequência de dias

### Tabs:
1. **🏆 Ranking:** Top 10 usuários globais
2. **🎯 Conquistas:** Suas conquistas desbloqueadas
3. **📊 Atividade:** Histórico (em desenvolvimento)

### Ações Rápidas:
- Botões para ir direto para desafios, blog ou admin

## 🐛 Problemas Comuns e Soluções

### "Não consigo fazer login" / Loop Infinito
✅ **CORRIGIDO!** A autenticação foi completamente refeita.

Se ainda tiver problema:
1. Limpe o cache do navegador
2. Abra em aba anônima
3. Verifique se email e senha estão corretos

### "Meu comentário não aparece"
✅ **Normal!** Comentários passam por moderação antes de aparecer.

### "Não consigo publicar artigos"
- Verifique seu role (só professores e admins podem publicar)
- Alunos podem criar rascunhos em `/admin`

### "Completei um desafio mas não ganhei pontos"
- Você já completou esse desafio antes
- Cada desafio só dá pontos na primeira conclusão

## 📧 Precisa de Ajuda?

1. **Dúvidas técnicas:** Acesse `/contato` e envie uma mensagem
2. **Sugestões:** Use o formulário de contato
3. **Bugs:** Relate no formulário de contato com detalhes

## 🎓 Versículo de Motivação

> "Tudo posso naquele que me fortalece" - Filipenses 4:13

Continue aprendendo, subindo de nível e glorificando a Deus através da tecnologia! 🙏✨
