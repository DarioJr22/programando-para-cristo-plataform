# 🎯 Guia de Novas Funcionalidades - Programando para Cristo

## 📝 Índice
1. [Registro como Professor/Admin](#1-registro-como-professoradmin)
2. [Escrevendo Artigos em Markdown](#2-escrevendo-artigos-em-markdown)
3. [Newsletter com Integração N8N](#3-newsletter-com-integração-n8n)
4. [Página de Perfil](#4-página-de-perfil)
5. [Estrutura do Banco de Dados](#5-estrutura-do-banco-de-dados)

---

## 1. Registro como Professor/Admin

### Como se Registrar

#### Passo 1: Acesse a Página de Registro
```
URL: /registro
```

#### Passo 2: Preencha os Dados Básicos
- **Nome Completo**: Seu nome completo
- **Email**: Seu email válido
- **Senha**: Mínimo 8 caracteres com maiúscula, minúscula e número
- **Confirmar Senha**: Digite a senha novamente

#### Passo 3: Selecione o Tipo de Conta

**Opções Disponíveis:**

##### 🎓 Aluno (Padrão)
- Acesso a artigos e desafios
- Dashboard de progresso
- Sistema de pontos e ranking
- **Não requer código secreto**

##### 👨‍🏫 Professor
- Tudo que o aluno tem
- Pode publicar artigos
- Pode criar desafios
- Ganha pontos por publicar conteúdo
- **⚠️ REQUER CÓDIGO SECRETO**

##### 👑 Administrador
- Acesso completo ao sistema
- Pode moderar comentários
- Vê todas as estatísticas
- Gerencia usuários
- **⚠️ REQUER CÓDIGO SECRETO**

#### Passo 4: Digite o Código Secreto (se Professor ou Admin)

**Código Secreto:**
```
ישוע המשיח הוא אדון
```
*(Jesus Cristo é Senhor em hebraico)*

**Como copiar:**
1. Selecione o texto acima
2. Copie (Ctrl+C / Cmd+C)
3. Cole no campo "Código Secreto"

**⚠️ Importante:**
- O código é sensível a maiúsculas/minúsculas
- Não inclua espaços extras
- Se o código estiver incorreto, você receberá um erro

#### Passo 5: Criar Conta
Clique em "Criar Conta Gratuita" e pronto! 🎉

---

## 2. Escrevendo Artigos em Markdown

### O que é Markdown?

Markdown é uma linguagem de marcação leve que permite formatar texto de forma simples. É o mesmo formato usado no Notion, GitHub, Discord, etc.

### Sintaxe Suportada

#### Headers (Títulos)
```markdown
# Título Principal (H1)
## Subtítulo (H2)
### Subsubtítulo (H3)
```

**Resultado:**
# Título Principal
## Subtítulo
### Subsubtítulo

---

#### Formatação de Texto

```markdown
**Texto em negrito**
*Texto em itálico*
__Também negrito__
_Também itálico_
```

**Resultado:**
**Texto em negrito**
*Texto em itálico*

---

#### Links

```markdown
[Texto do Link](https://exemplo.com)
```

**Resultado:**
[Texto do Link](https://exemplo.com)

---

#### Imagens

```markdown
![Texto alternativo](https://url-da-imagem.jpg)
```

**Resultado:**
![Imagem exemplo](https://via.placeholder.com/300)

---

#### Code Blocks (Blocos de Código)

Com syntax highlighting:

```markdown
```javascript
function soma(a, b) {
  return a + b;
}
```
```

**Resultado:**
```javascript
function soma(a, b) {
  return a + b;
}
```

Outras linguagens suportadas: `python`, `html`, `css`, `typescript`, etc.

---

#### Inline Code (Código Inline)

```markdown
Use a função `console.log()` para debug.
```

**Resultado:**
Use a função `console.log()` para debug.

---

#### Listas Não-Ordenadas

```markdown
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3
```

**Resultado:**
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

---

#### Listas Ordenadas

```markdown
1. Primeiro passo
2. Segundo passo
3. Terceiro passo
```

**Resultado:**
1. Primeiro passo
2. Segundo passo
3. Terceiro passo

---

#### Blockquotes (Citações)

```markdown
> "Tudo posso naquele que me fortalece"
> — Filipenses 4:13
```

**Resultado:**
> "Tudo posso naquele que me fortalece"
> — Filipenses 4:13

---

#### Horizontal Rule (Linha Horizontal)

```markdown
---
```

**Resultado:**
---

### Exemplo de Artigo Completo

```markdown
# Como Começar a Programar em Python

## Introdução

Python é uma linguagem de programação **poderosa** e *fácil de aprender*. 

### Por que Python?

- Sintaxe simples
- Comunidade grande
- Muitas bibliotecas

## Primeiro Programa

Vamos criar o clássico "Hello World":

```python
print("Hello, World!")
```

Execute este código e você verá a mensagem no console.

### Próximos Passos

1. Instale o Python
2. Configure um editor
3. Pratique diariamente

> "A prática leva à perfeição"

---

**Conclusão:** Python é uma ótima escolha para iniciantes!

[Documentação Oficial](https://python.org)
```

### Dicas para Escrever Bons Artigos

1. **Use Headers Hierarquicamente**
   - H2 para seções principais
   - H3 para subseções
   - Não pule níveis (não vá direto de H2 para H4)

2. **Quebre em Parágrafos**
   - Use linha vazia entre parágrafos
   - Mantenha parágrafos curtos (3-5 linhas)

3. **Use Code Blocks para Exemplos**
   - Sempre especifique a linguagem
   - Inclua comentários explicativos

4. **Adicione Imagens**
   - Use imagens para ilustrar conceitos
   - Sempre adicione texto alternativo

5. **Estruture com Listas**
   - Torne informações escaneáveis
   - Use listas quando apropriado

---

## 3. Newsletter com Integração N8N

### Campos Capturados Automaticamente

Quando alguém se inscreve na newsletter, os seguintes dados são enviados ao webhook N8N:

#### Campos Preenchidos pelo Usuário:
- ✅ **Nome**: Nome completo
- ✅ **Email**: Email válido
- ✅ **Opt-in WhatsApp**: Checkbox (true/false)

#### Campos Automáticos:
- ✅ **Origem**: De onde veio (Landing Page, Blog, etc)
- ✅ **Status**: Sempre "Novo"
- ✅ **Data de Captação**: Formato YYYY-MM-DD
- ✅ **Interesse**: Sempre "Curso"
- ✅ **Source URL**: URL completa da página
- ✅ **UTM Campaign**: Capturado da URL (?utm_campaign=)
- ✅ **Opt-in Email**: Sempre true

### Payload Enviado ao N8N

```json
{
  "Nome": "João Silva",
  "Email": "joao@exemplo.com",
  "Origem": "Landing Page",
  "Status": "Novo",
  "date:Data de Captação:start": "2025-10-24",
  "Interesse": "Curso",
  "Source URL": "https://bombatech.com.br/lp-curso?utm_campaign=outubro",
  "UTM Campaign": "outubro",
  "Opt-in Email": true,
  "Opt-in WhatsApp": false
}
```

### Como Configurar o Webhook N8N

1. **Crie um Webhook no N8N**
   - Crie um novo workflow
   - Adicione um node "Webhook"
   - Copie a URL do webhook

2. **Configure a Variável de Ambiente**
   ```
   N8N_WEBHOOK_URL=https://seu-n8n.app/webhook/sua-url
   ```

3. **O Sistema Fará Automaticamente**
   - Captura os dados do formulário
   - Adiciona metadados (UTMs, origem, data)
   - Envia para o webhook
   - Salva no banco de dados local

### Usando UTM Parameters

Para rastrear campanhas, adicione UTM parameters na URL:

```
https://bombatech.com.br/?utm_campaign=curso-outubro&utm_source=facebook&utm_medium=ads
```

Esses dados serão capturados e enviados ao N8N automaticamente.

---

## 4. Página de Perfil

### Acessando Seu Perfil

#### Opção 1: Clique no Avatar
No header (topo da página), clique no seu avatar (círculo colorido com sua inicial).

#### Opção 2: Menu Mobile
No menu mobile, selecione "👤 Meu Perfil".

#### Opção 3: URL Direta
```
/perfil
```

### Funcionalidades da Página de Perfil

#### 1. Visualização de Informações

**Card de Avatar:**
- Avatar/foto de perfil
- Nome completo
- Username (@seunome)
- Badge de role (Aluno/Professor/Admin)

**Card de Estatísticas:**
- Rank atual (Madeira/Bronze/Prata/Ouro/Diamante)
- Nível
- Pontos totais

#### 2. Edição de Perfil

**Clique em "Editar"** para entrar no modo de edição:

**Campos Editáveis:**

1. **URL do Avatar**
   - Cole a URL de uma imagem
   - Pode usar serviços como:
     - Gravatar: https://gravatar.com
     - ImgBB: https://imgbb.com
     - Imgur: https://imgur.com
   - Formatos: JPG, PNG, GIF
   - Tamanho recomendado: 400x400px

2. **Nome Completo**
   - Seu nome como quer ser chamado
   - Mínimo 2 caracteres

3. **Nome de Usuário**
   - Identificador único (@username)
   - Só letras, números e underline
   - Exemplo: `joao_silva`
   - ⚠️ Deve ser único na plataforma

4. **Bio**
   - Conte sobre você
   - Suas habilidades
   - Seus objetivos
   - Máximo: ilimitado (texto longo)

**Campo NÃO Editável:**
- ❌ **Email**: Não pode ser alterado (segurança)

#### 3. Salvando Alterações

1. Faça as edições desejadas
2. Clique em "Salvar" (ícone de disquete)
3. Aguarde a confirmação verde
4. Pronto! Perfil atualizado ✅

**Para Cancelar:**
- Clique no "X" vermelho
- Todas as alterações serão descartadas

### Dicas para um Bom Perfil

#### Avatar
- ✅ Use foto profissional
- ✅ Rosto visível
- ✅ Boa iluminação
- ❌ Evite imagens muito escuras
- ❌ Evite logos complexos

#### Username
- ✅ Use seu nome real ou apelido
- ✅ Mantenha simples
- ✅ Fácil de lembrar
- ❌ Evite números aleatórios
- ❌ Evite caracteres especiais

#### Bio
**Bom exemplo:**
```
Desenvolvedor Full Stack apaixonado por React e Node.js. 
Atualmente estudando TypeScript e GraphQL.
Objetivo: Construir aplicações que impactem vidas para Cristo. 🙏
```

**Evite:**
```
developer
```

### Erros Comuns

#### "Nome de usuário já está em uso"
**Solução:** Escolha outro username. Ele deve ser único.

#### "URL do avatar inválida"
**Solução:** 
- Verifique se a URL começa com `https://`
- Teste a URL no navegador antes
- Use serviços de hospedagem de imagens confiáveis

---

## 5. Estrutura do Banco de Dados

### Entendendo o Sistema KV (Key-Value)

A plataforma usa um sistema de Key-Value Store do Supabase. Cada dado é armazenado com uma chave única.

### Principais Tabelas (Prefixos)

#### 1. `users:` - Usuários
**Exemplo de chave:**
```
users:abc-123-def-456
```

**O que armazena:**
- Dados pessoais (nome, email, avatar)
- Role (student/teacher/admin)
- Gamificação (pontos, nível, rank)
- Preferências

#### 2. `articles:` - Artigos
**Exemplo de chave:**
```
articles:xyz-789-abc-012
```

**O que armazena:**
- Título, conteúdo (Markdown)
- Autor
- Categoria, tags
- Likes, visualizações
- Status (draft/published)

**Índice secundário:**
```
article-slug:como-aprender-python → xyz-789-abc-012
```

#### 3. `challenges:` - Desafios
**Exemplo de chave:**
```
challenges:def-456-ghi-789
```

**O que armazena:**
- Descrição do desafio
- Dificuldade (iniciante/intermediário/avançado)
- Tecnologias
- Links (demo, código)

#### 4. `likes:` - Curtidas
**Exemplo de chave:**
```
likes:article:xyz-789:abc-123
```

**Formato:**
```
likes:{tipo}:{conteudoId}:{usuarioId}
```

#### 5. `comments:` - Comentários
**Exemplo de chave:**
```
comments:article:xyz-789:comment-123
```

**O que armazena:**
- Texto do comentário
- Autor
- Status (pending/approved/rejected)

#### 6. `newsletter:` - Inscritos
**Exemplo de chave:**
```
newsletter:joao@email.com
```

**O que armazena:**
- Nome, email
- Origem da inscrição
- UTM parameters
- Opt-ins

### Relacionamentos

```
Usuário (1) ─────── (N) Artigos
   │
   ├─────── (N) Desafios
   │
   ├─────── (N) Likes
   │
   ├─────── (N) Comentários
   │
   └─────── (N) Leituras/Conclusões

Artigo (1) ─────── (N) Comentários
   │
   └─────── (N) Likes

Desafio (1) ─────── (N) Comentários
   │
   ├─────── (N) Likes
   │
   └─────── (N) Conclusões
```

### Tracking de Progresso

#### Leitura de Artigos
```
article-read:{usuarioId}:{artigoId}
```

Criado quando você lê um artigo pela primeira vez.
Garante que você só ganha pontos uma vez.

#### Conclusão de Desafios
```
challenge-completion:{usuarioId}:{desafioId}
```

Criado quando você completa um desafio.
Armazena pontos ganhos e data de conclusão.

### Para Desenvolvedores

**Documentação completa:**
```
/ESTRUTURA_BANCO_DADOS.md
```

**Inclui:**
- Estrutura detalhada de cada tabela
- Relacionamentos
- Fluxos de dados
- Sugestões de melhorias
- Quando migrar para SQL

---

## 🎓 Próximos Passos

1. **Crie sua Conta**
   - Escolha o role adequado
   - Complete seu perfil

2. **Explore a Plataforma**
   - Leia artigos
   - Tente desafios
   - Suba no ranking

3. **Professor/Admin?**
   - Use o código secreto
   - Comece a criar conteúdo
   - Inspire outros alunos

4. **Compartilhe**
   - Convide amigos
   - Divulgue nas redes
   - Ajude a comunidade a crescer

---

## 💬 Suporte

**Encontrou algum problema?**
- Acesse `/contato`
- Descreva o problema
- Inclua prints se possível

**Tem sugestões?**
- Envie via formulário de contato
- Seja específico
- Explique o benefício

---

## 🙏 Versículo

> "Instrui o menino no caminho em que deve andar, e até quando envelhecer não se desviará dele."
> — Provérbios 22:6

**Que Deus abençoe sua jornada de aprendizado!** ✝️
