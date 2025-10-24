# 🚀 Modo "Coming Soon" Ativo

Esta plataforma está atualmente configurada no **modo "Em Breve"** (Coming Soon).

## 📋 O que está ativo:

✅ **Landing Page** (`/`) - Com formulário de newsletter funcional
✅ **Newsletter** - Captura de emails totalmente funcional
✅ **Página Coming Soon** - Mostrada para todas as outras rotas

## 🚫 O que está desabilitado:

- Login/Registro
- Blog e Artigos
- Desafios
- Dashboard
- Painel Admin
- Página de Contato

## 🔄 Como ativar o modo completo:

### Opção 1: Editar manualmente o `src/App.tsx`

1. Abra o arquivo `src/App.tsx`
2. Encontre a seção com o comentário `// PÁGINA EM BREVE`
3. Descomente o bloco de rotas completo (marcado com `/*` e `*/`)
4. Comente ou remova as linhas:
   ```tsx
   } else {
     matchedRoute = <ComingSoonPage />;
   }
   ```
5. Restaure o código do layout:
   ```tsx
   // Show pages without header/footer
   const pagesWithoutLayout = ['/login', '/registro'];
   if (pagesWithoutLayout.includes(currentPath)) {
     return <>{matchedRoute}</>;
   }

   return (
     <>
       <Header />
       <main>{matchedRoute}</main>
       <Footer />
     </>
   );
   ```

### Opção 2: Usar git

Reverter para o estado anterior (se houver commits anteriores):
```bash
git log --oneline  # Ver commits
git revert HEAD    # Reverter último commit
```

## 🧹 Remover logs de debug

Os logs de debug estão ativos nos seguintes arquivos:
- `src/components/auth/LoginPage.tsx`
- `src/lib/auth-context.tsx`
- `src/lib/supabase.ts`

Para remover, procure por `console.log` com emojis (🔵, 🟡, 🟢) e delete essas linhas.

## 📝 Estrutura atual:

```
/                    → LandingPage (com newsletter)
/login               → ComingSoonPage
/registro            → ComingSoonPage
/blog                → ComingSoonPage
/desafios            → ComingSoonPage
/dashboard           → ComingSoonPage
/admin               → ComingSoonPage
/contato             → ComingSoonPage
/qualquer-outra      → ComingSoonPage
```

## 🎯 Próximos passos sugeridos:

1. Testar a captura de newsletter
2. Configurar domínio personalizado
3. Adicionar Google Analytics
4. Implementar pixel do Facebook/Meta
5. Criar conteúdo inicial antes de ativar modo completo
6. Configurar email marketing (MailChimp, ConvertKit, etc)

---

**Data de ativação do modo Coming Soon:** 23 de Outubro de 2025
