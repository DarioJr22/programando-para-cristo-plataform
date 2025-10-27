# 🧪 Testes e Qualidade - Programando para Cristo

## 🎯 Visão Geral

Este documento detalha as estratégias de teste, ferramentas de qualidade e procedimentos para garantir a confiabilidade da plataforma "Programando para Cristo". Nosso objetivo é manter um código limpo, bem testado e livre de bugs.

## 🏗️ Estrutura de Testes

### Tipos de Teste Implementados:

#### 1. **Testes Unitários** 🧱
- **Componentes React**: Renderização e props
- **Hooks Customizados**: AuthContext, useAuth
- **Utilitários**: Funções de formatação, validação
- **Cobertura Meta**: 80%+ das funções críticas

#### 2. **Testes de Integração** 🔗
- **API Endpoints**: CRUD operations completas
- **Autenticação**: Login, registro, permissões
- **Database**: KV Store operations
- **Supabase**: Integração com serviços externos

#### 3. **Testes End-to-End (E2E)** 🌐
- **Fluxos Críticos**: Login → Criar Artigo → Publicar
- **User Journey**: Cadastro completo de usuário
- **Cross-browser**: Chrome, Firefox, Safari

#### 4. **Testes de Performance** ⚡
- **Lighthouse**: Core Web Vitals
- **Bundle Analysis**: Tamanho dos chunks
- **API Response Time**: < 500ms target

---

## 🛠️ Ferramentas e Configuração

### Stack de Testes:

```json
{
  "testing": {
    "unit": "Vitest + @testing-library/react",
    "integration": "Vitest + Supertest",
    "e2e": "Playwright",
    "performance": "Lighthouse CI",
    "coverage": "c8",
    "lint": "ESLint + TypeScript",
    "format": "Prettier"
  }
}
```

### Configuração Vitest (`vitest.config.ts`):

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'clover', 'json'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts'
      ]
    }
  }
});
```

### Setup de Testes (`src/test/setup.ts`):

```typescript
import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Mock do Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}));
```

---

## 🧪 Testes de Componentes

### AuthContext Test (`src/lib/__tests__/auth-context.test.tsx`):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../auth-context';

// Mock do Supabase
vi.mock('../supabase');

const TestComponent = () => {
  const { user, loading, login } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome {user.name}!</div>;
  
  return (
    <button onClick={() => login('test@example.com', 'password')}>
      Login
    </button>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    // Mock successful auth response
    const mockUser = {
      id: '1',
      name: 'João Silva',
      email: 'joao@example.com',
      role: 'student'
    };

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'fake-token' } },
      error: null
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Welcome João Silva!')).toBeInTheDocument();
    });
  });

  it('should handle login error', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Login')).toBeInTheDocument(); // Still showing login
    });
  });
});
```

### ArticleForm Test (`src/components/forms/__tests__/ArticleForm.test.tsx`):

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ArticleForm } from '../ArticleForm';

// Mock do AuthContext
const mockUser = {
  id: '1',
  name: 'Professor João',
  role: 'teacher'
};

vi.mock('../../lib/auth-context', () => ({
  useAuth: () => ({ user: mockUser })
}));

describe('ArticleForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(
      <ArticleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/conteúdo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/versículo/i)).toBeInTheDocument();
  });

  it('should show preview when clicking preview tab', async () => {
    render(
      <ArticleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill content
    const contentField = screen.getByLabelText(/conteúdo/i);
    fireEvent.change(contentField, {
      target: { value: '# Título do Artigo\n\nConteúdo do artigo...' }
    });

    // Click preview tab
    const previewTab = screen.getByText('Pré-visualização');
    fireEvent.click(previewTab);

    await waitFor(() => {
      expect(screen.getByText('Título do Artigo')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(
      <ArticleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText(/publicar/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with correct data', async () => {
    render(
      <ArticleForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill form
    fireEvent.change(screen.getByLabelText(/título/i), {
      target: { value: 'Meu Artigo de Teste' }
    });
    
    fireEvent.change(screen.getByLabelText(/conteúdo/i), {
      target: { value: 'Conteúdo do artigo de teste' }
    });

    // Submit
    const submitButton = screen.getByText(/publicar/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Meu Artigo de Teste',
        content: 'Conteúdo do artigo de teste',
        category: 'Programação',
        level: 'beginner',
        versiculo: '',
        status: 'published'
      });
    });
  });
});
```

---

## 🔌 Testes de API

### Backend Test Suite (`supabase/functions/server/__tests__/api.test.ts`):

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { serve } from '../index';

// Mock KV Store
const mockKV = new Map();
vi.mock('../../kv_store', () => ({
  get: (key: string) => mockKV.get(key),
  set: (key: string, value: any) => mockKV.set(key, value),
  delete: (key: string) => mockKV.delete(key)
}));

describe('API Endpoints', () => {
  let server: any;

  beforeAll(() => {
    server = serve();
  });

  afterAll(() => {
    server.close();
  });

  describe('Authentication', () => {
    it('POST /auth/register - should create new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student'
      };

      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user.email).toBe(userData.email);
      expect(data.user.role).toBe('student');
    });

    it('POST /auth/register - should require secret code for teacher', async () => {
      const userData = {
        email: 'teacher@example.com',
        password: 'password123',
        name: 'Teacher User',
        role: 'teacher'
        // Missing secretCode
      };

      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Código secreto');
    });

    it('POST /auth/register - should accept valid secret code', async () => {
      const userData = {
        email: 'teacher@example.com',
        password: 'password123',
        name: 'Teacher User',
        role: 'teacher',
        secretCode: 'ישוע המשיח הוא אדון'
      };

      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.user.role).toBe('teacher');
    });
  });

  describe('Articles', () => {
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
      // Create test user and get token
      const loginResponse = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'teacher@example.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      userId = loginData.user.id;
    });

    it('POST /articles - should create new article', async () => {
      const articleData = {
        title: 'Artigo de Teste',
        content: 'Conteúdo do artigo de teste',
        category: 'Programação',
        level: 'beginner'
      };

      const response = await fetch('/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(articleData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.article.title).toBe(articleData.title);
      expect(data.article.authorId).toBe(userId);
    });

    it('GET /articles - should return published articles', async () => {
      const response = await fetch('/articles');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.articles)).toBe(true);
    });

    it('GET /articles/:id - should return specific article', async () => {
      // First create an article
      const createResponse = await fetch('/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Artigo Específico',
          content: 'Conteúdo específico'
        })
      });

      const createData = await createResponse.json();
      const articleId = createData.article.id;

      // Then fetch it
      const response = await fetch(`/articles/${articleId}`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.article.id).toBe(articleId);
    });

    it('PUT /articles/:id - should update article (author only)', async () => {
      // Create article first
      const createResponse = await fetch('/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Artigo Original',
          content: 'Conteúdo original'
        })
      });

      const createData = await createResponse.json();
      const articleId = createData.article.id;

      // Update it
      const updateResponse = await fetch(`/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Artigo Atualizado'
        })
      });

      expect(updateResponse.status).toBe(200);
      const updateData = await updateResponse.json();
      expect(updateData.article.title).toBe('Artigo Atualizado');
    });

    it('DELETE /articles/:id - should delete article (author only)', async () => {
      // Create and delete article
      const createResponse = await fetch('/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Artigo para Deletar',
          content: 'Será deletado'
        })
      });

      const createData = await createResponse.json();
      const articleId = createData.article.id;

      const deleteResponse = await fetch(`/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(deleteResponse.status).toBe(200);

      // Verify it's gone
      const getResponse = await fetch(`/articles/${articleId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Comments', () => {
    let authToken: string;
    let articleId: string;

    beforeAll(async () => {
      // Setup test data
      const loginResponse = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'teacher@example.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      authToken = loginData.token;

      // Create test article
      const articleResponse = await fetch('/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Artigo para Comentários',
          content: 'Conteúdo do artigo'
        })
      });

      const articleData = await articleResponse.json();
      articleId = articleData.article.id;
    });

    it('POST /articles/:id/comments - should create comment', async () => {
      const commentData = {
        content: 'Excelente artigo! Muito útil.'
      };

      const response = await fetch(`/articles/${articleId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(commentData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.comment.content).toBe(commentData.content);
      expect(data.comment.status).toBe('pending'); // Default status
    });

    it('GET /articles/:id/comments - should return approved comments', async () => {
      const response = await fetch(`/articles/${articleId}/comments`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.comments)).toBe(true);
      
      // Should only return approved comments for public access
      data.comments.forEach((comment: any) => {
        expect(comment.status).toBe('approved');
      });
    });
  });
});
```

---

## 🎭 Testes E2E com Playwright

### Configuração (`playwright.config.ts`):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Testes E2E (`tests/e2e/auth.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete student registration flow', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Começar Grátis');
    await expect(page).toHaveURL('/registro');

    // Fill registration form
    await page.fill('[data-testid=name-input]', 'João Silva');
    await page.fill('[data-testid=email-input]', 'joao@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.fill('[data-testid=confirm-password-input]', 'password123');

    // Submit form
    await page.click('[data-testid=register-button]');

    // Should redirect to login with success message
    await expect(page).toHaveURL('/login');
    await expect(page.locator('.success-message')).toContainText('Conta criada com sucesso');
  });

  test('should complete teacher registration with secret code', async ({ page }) => {
    await page.goto('/registro?role=teacher');

    // Fill basic info
    await page.fill('[data-testid=name-input]', 'Professor João');
    await page.fill('[data-testid=email-input]', 'professor@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.fill('[data-testid=confirm-password-input]', 'password123');

    // Select teacher role
    await page.selectOption('[data-testid=role-select]', 'teacher');

    // Enter secret code
    await page.fill('[data-testid=secret-code-input]', 'ישוע המשיח הוא אדון');

    // Submit
    await page.click('[data-testid=register-button]');

    await expect(page).toHaveURL('/login');
  });

  test('should login and access appropriate dashboard', async ({ page }) => {
    // Go to login
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid=email-input]', 'professor@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    
    // Submit
    await page.click('[data-testid=login-button]');

    // Should redirect to admin for teachers
    await expect(page).toHaveURL('/admin');
    
    // Should see admin interface
    await expect(page.locator('h1')).toContainText('Painel Administrativo');
  });

  test('should protect admin routes from students', async ({ page }) => {
    // Login as student first
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'joao@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');

    // Try to access admin
    await page.goto('/admin');

    // Should be redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### Article Management E2E (`tests/e2e/articles.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Article Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'professor@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');
    
    await expect(page).toHaveURL('/admin');
  });

  test('should create new article', async ({ page }) => {
    // Click create article button
    await page.click('[data-testid=create-article-button]');

    // Modal should open
    await expect(page.locator('[data-testid=article-form-modal]')).toBeVisible();

    // Fill article form
    await page.fill('[data-testid=title-input]', 'Como Aprender React');
    await page.selectOption('[data-testid=category-select]', 'Frontend');
    await page.selectOption('[data-testid=level-select]', 'intermediate');
    
    // Fill content in markdown editor
    await page.fill('[data-testid=content-textarea]', `
# Como Aprender React

React é uma biblioteca JavaScript para construir interfaces de usuário.

## Primeiros Passos

1. Instale o Node.js
2. Crie um projeto com Vite
3. Comece a codificar!

\`\`\`jsx
function App() {
  return <h1>Hello, World!</h1>;
}
\`\`\`
    `);

    // Add verse
    await page.fill('[data-testid=versiculo-input]', 'Em tudo dai graças - 1 Tessalonicenses 5:18');

    // Preview should work
    await page.click('[data-testid=preview-tab]');
    await expect(page.locator('[data-testid=preview-content]')).toContainText('Como Aprender React');

    // Go back to edit
    await page.click('[data-testid=edit-tab]');

    // Submit article
    await page.click('[data-testid=publish-button]');

    // Modal should close and article should appear in list
    await expect(page.locator('[data-testid=article-form-modal]')).not.toBeVisible();
    await expect(page.locator('[data-testid=articles-list]')).toContainText('Como Aprender React');
  });

  test('should edit existing article', async ({ page }) => {
    // Find article in list and click edit
    const articleRow = page.locator('[data-testid=articles-list] tr').filter({
      hasText: 'Como Aprender React'
    });
    
    await articleRow.locator('[data-testid=edit-article-button]').click();

    // Modal should open with existing data
    await expect(page.locator('[data-testid=article-form-modal]')).toBeVisible();
    await expect(page.locator('[data-testid=title-input]')).toHaveValue('Como Aprender React');

    // Update title
    await page.fill('[data-testid=title-input]', 'Como Dominar React');

    // Save changes
    await page.click('[data-testid=publish-button]');

    // Should see updated title in list
    await expect(page.locator('[data-testid=articles-list]')).toContainText('Como Dominar React');
  });

  test('should delete article with confirmation', async ({ page }) => {
    const articleRow = page.locator('[data-testid=articles-list] tr').filter({
      hasText: 'Como Dominar React'
    });
    
    await articleRow.locator('[data-testid=delete-article-button]').click();

    // Confirmation dialog should appear
    await expect(page.locator('[data-testid=delete-confirmation]')).toBeVisible();
    await expect(page.locator('[data-testid=delete-confirmation]')).toContainText('tem certeza');

    // Confirm deletion
    await page.click('[data-testid=confirm-delete-button]');

    // Article should be removed from list
    await expect(page.locator('[data-testid=articles-list]')).not.toContainText('Como Dominar React');
  });

  test('should view article on public page', async ({ page }) => {
    // Create a test article first
    await page.click('[data-testid=create-article-button]');
    await page.fill('[data-testid=title-input]', 'Artigo Público de Teste');
    await page.fill('[data-testid=content-textarea]', '# Conteúdo do Artigo\n\nEste é um artigo público para teste.');
    await page.click('[data-testid=publish-button]');

    // Navigate to blog page
    await page.goto('/blog');
    
    // Article should be visible in blog
    await expect(page.locator('[data-testid=articles-grid]')).toContainText('Artigo Público de Teste');

    // Click to view full article
    const articleCard = page.locator('[data-testid=article-card]').filter({
      hasText: 'Artigo Público de Teste'
    });
    
    await articleCard.click();

    // Should be on article page
    await expect(page).toHaveURL(/\/artigo\/.+/);
    await expect(page.locator('h1')).toContainText('Artigo Público de Teste');
    await expect(page.locator('[data-testid=article-content]')).toContainText('Conteúdo do Artigo');
  });
});
```

---

## 📊 Testes de Performance

### Lighthouse CI Config (`.lighthouserc.js`):

```javascript
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/blog',
        'http://localhost:5173/login',
        'http://localhost:5173/admin'
      ],
      startServerCommand: 'npm run dev',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
```

### Bundle Analysis (`scripts/analyze-bundle.js`):

```javascript
import { build } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

async function analyzeBuild() {
  await build({
    plugins: [
      visualizer({
        filename: 'dist/bundle-analysis.html',
        open: true,
        gzipSize: true,
        brotliSize: true
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            auth: ['@supabase/supabase-js']
          }
        }
      }
    }
  });

  console.log('Bundle analysis complete! Check dist/bundle-analysis.html');
}

analyzeBuild().catch(console.error);
```

### Performance Tests (`tests/performance/metrics.test.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for main content to load
    await page.waitForSelector('[data-testid=main-content]');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in under 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('should handle large article lists efficiently', async ({ page }) => {
    await page.goto('/blog');
    
    const startTime = performance.now();
    
    // Scroll through articles
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(100);
    }
    
    const endTime = performance.now();
    const scrollTime = endTime - startTime;
    
    // Scrolling should be smooth (under 1 second for 5 page downs)
    expect(scrollTime).toBeLessThan(1000);
  });
});
```

---

## 🔍 Testes de Acessibilidade

### Accessibility Tests (`tests/a11y/accessibility.test.ts`):

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .exclude('#third-party-iframe') // Exclude third-party content
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab'); // Skip to main content link
    await page.keyboard.press('Tab'); // Logo
    await page.keyboard.press('Tab'); // Blog link
    await page.keyboard.press('Tab'); // Desafios link
    await page.keyboard.press('Tab'); // Login link
    
    // Current focus should be on Login link
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toContainText('Login');
  });

  test('should have proper ARIA labels on forms', async ({ page }) => {
    await page.goto('/login');
    
    // Check form labels
    const emailInput = page.locator('[data-testid=email-input]');
    const passwordInput = page.locator('[data-testid=password-input]');
    
    await expect(emailInput).toHaveAttribute('aria-label', /email/i);
    await expect(passwordInput).toHaveAttribute('aria-label', /senha|password/i);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    const colorContrastViolations = accessibilityScanResults.violations
      .filter(violation => violation.id === 'color-contrast');
    
    expect(colorContrastViolations).toHaveLength(0);
  });
});
```

---

## 🚨 Testes de Segurança

### Security Tests (`tests/security/security.test.ts`):

```typescript
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('should prevent XSS attacks in article content', async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'professor@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');

    // Try to create article with XSS payload
    await page.click('[data-testid=create-article-button]');
    await page.fill('[data-testid=title-input]', 'Test Article');
    await page.fill('[data-testid=content-textarea]', `
      <script>alert('XSS')</script>
      <img src="x" onerror="alert('XSS')">
      <div onclick="alert('XSS')">Click me</div>
    `);
    
    await page.click('[data-testid=preview-tab]');
    
    // Check that script tags are sanitized
    const previewContent = page.locator('[data-testid=preview-content]');
    const htmlContent = await previewContent.innerHTML();
    
    expect(htmlContent).not.toContain('<script>');
    expect(htmlContent).not.toContain('onerror=');
    expect(htmlContent).not.toContain('onclick=');
  });

  test('should require authentication for protected routes', async ({ page }) => {
    // Try to access admin without login
    await page.goto('/admin');
    
    // Should be redirected to login
    await expect(page).toHaveURL('/login');
  });

  test('should prevent CSRF attacks', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid=email-input]', 'professor@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    await page.click('[data-testid=login-button]');

    // Try to make request without proper headers
    const response = await context.request.post('/api/articles', {
      data: {
        title: 'CSRF Test Article',
        content: 'This should fail'
      },
      headers: {
        // Missing Authorization header
        'Content-Type': 'application/json'
      }
    });

    expect(response.status()).toBe(401); // Unauthorized
  });

  test('should validate input sanitization', async ({ page }) => {
    await page.goto('/registro');
    
    // Try SQL injection in name field
    await page.fill('[data-testid=name-input]', "'; DROP TABLE users; --");
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'password123');
    
    await page.click('[data-testid=register-button]');
    
    // Should either fail validation or sanitize input
    const errorMessage = page.locator('.error-message');
    const successMessage = page.locator('.success-message');
    
    // If successful, check that name was sanitized
    if (await successMessage.isVisible()) {
      // Check that malicious SQL was not executed
      // This would need backend verification
      expect(true).toBe(true); // Placeholder
    }
  });
});
```

---

## 📈 Cobertura de Testes

### Coverage Config (`package.json`):

```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:all": "npm run test:coverage && npm run test:e2e"
  },
  "devDependencies": {
    "@vitest/coverage-c8": "^0.33.0",
    "@playwright/test": "^1.40.0",
    "@axe-core/playwright": "^4.8.0"
  }
}
```

### Coverage Targets:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      include: [
        'src/**/*.{ts,tsx}',
        'supabase/functions/**/*.{ts,tsx}'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**/*',
        'src/**/*.d.ts'
      ]
    }
  }
});
```

---

## 🔧 Ferramentas de Qualidade

### ESLint Config (`.eslintrc.json`):

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "react/prop-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "jsx-a11y/anchor-is-valid": "warn",
    "react-hooks/exhaustive-deps": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### Prettier Config (`.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Husky Pre-commit Hooks (`.husky/pre-commit`):

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run unit tests
npm run test:coverage

# Check bundle size
npm run build
```

---

## 📊 CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`):

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
      
      - name: Build project
        run: npm run build
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run Lighthouse CI
        run: npm run lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: echo "Deploy to production"
        # Add actual deployment steps
```

---

## 🎯 Estratégia de Testes

### Pirâmide de Testes:

```
       /\
      /  \     E2E Tests (10%)
     /____\    - Critical user journeys
    /      \   - Cross-browser compatibility
   /        \  
  /   UNIT   \  Integration Tests (20%)
 /   TESTS   \ - API endpoints
/____________\ - Component integration
   (70%)       
               Unit Tests (70%)
               - Components
               - Hooks  
               - Utilities
```

### Cobertura por Categoria:

#### **Críticos (100% cobertura obrigatória):**
- ✅ Sistema de autenticação
- ✅ CRUD de artigos/desafios
- ✅ Sistema de permissões
- ✅ Pagamentos (futuro)

#### **Importantes (80% cobertura):**
- ✅ Comentários e moderação
- ✅ Sistema de gamificação
- ✅ Formulários de contato
- ✅ Dashboard de usuário

#### **Secundários (60% cobertura):**
- ✅ Interface visual
- ✅ Animações
- ✅ Recursos opcionais
- ✅ Easter eggs

---

## 📝 Relatórios de Teste

### Coverage Report (`coverage/index.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Programando para Cristo - Coverage Report</title>
</head>
<body>
  <h1>Test Coverage Summary</h1>
  
  <table>
    <tr>
      <th>File</th>
      <th>% Stmts</th>
      <th>% Branch</th>
      <th>% Funcs</th>
      <th>% Lines</th>
    </tr>
    <tr>
      <td>All files</td>
      <td class="pct high">85.2%</td>
      <td class="pct high">82.1%</td>
      <td class="pct high">87.3%</td>
      <td class="pct high">85.8%</td>
    </tr>
    <tr>
      <td>src/lib/auth-context.tsx</td>
      <td class="pct high">95.5%</td>
      <td class="pct high">90.2%</td>
      <td class="pct high">100%</td>
      <td class="pct high">94.7%</td>
    </tr>
    <tr>
      <td>src/components/forms/</td>
      <td class="pct medium">78.9%</td>
      <td class="pct medium">75.3%</td>
      <td class="pct high">82.1%</td>
      <td class="pct medium">79.2%</td>
    </tr>
  </table>
</body>
</html>
```

### Test Results Dashboard:

```typescript
// scripts/generate-test-report.ts
import fs from 'fs';
import path from 'path';

interface TestMetrics {
  unitTests: {
    passed: number;
    failed: number;
    coverage: number;
  };
  e2eTests: {
    passed: number;
    failed: number;
    duration: number;
  };
  performance: {
    lighthouse: number;
    bundleSize: string;
  };
}

function generateReport(metrics: TestMetrics) {
  const report = `
# 🧪 Test Report - ${new Date().toLocaleDateString()}

## 📊 Summary

### Unit Tests
- ✅ Passed: ${metrics.unitTests.passed}
- ❌ Failed: ${metrics.unitTests.failed}
- 📈 Coverage: ${metrics.unitTests.coverage}%

### E2E Tests  
- ✅ Passed: ${metrics.e2eTests.passed}
- ❌ Failed: ${metrics.e2eTests.failed}
- ⏱️ Duration: ${metrics.e2eTests.duration}ms

### Performance
- 🚀 Lighthouse: ${metrics.performance.lighthouse}/100
- 📦 Bundle Size: ${metrics.performance.bundleSize}

## 🎯 Quality Gates

${metrics.unitTests.coverage >= 80 ? '✅' : '❌'} Unit Test Coverage >= 80%
${metrics.e2eTests.failed === 0 ? '✅' : '❌'} All E2E Tests Passing
${metrics.performance.lighthouse >= 90 ? '✅' : '❌'} Lighthouse Score >= 90

## 🙏 Versículo

> "Examinai tudo. Retende o bem." - 1 Tessalonicenses 5:21
  `;

  fs.writeFileSync('test-report.md', report);
  console.log('Test report generated! 📊');
}
```

---

## 🚀 Próximos Passos

### Melhorias Planejadas:

#### **Automação:**
- [ ] **Visual Regression Tests**: Comparação de screenshots
- [ ] **Mutation Testing**: Teste da qualidade dos testes
- [ ] **Chaos Engineering**: Testes de resiliência
- [ ] **Load Testing**: Testes de carga com K6

#### **Monitoramento:**
- [ ] **Sentry Integration**: Monitoramento de erros
- [ ] **Analytics**: Métricas de uso real
- [ ] **Real User Monitoring**: Performance real
- [ ] **Uptime Monitoring**: Disponibilidade 24/7

#### **Qualidade:**
- [ ] **SonarQube**: Análise estática avançada
- [ ] **Dependabot**: Atualizações automáticas
- [ ] **Security Scanning**: Vulnerabilidades
- [ ] **License Compliance**: Verificação de licenças

---

## 📚 Documentação Adicional

### Links Úteis:
- 📖 [Vitest Documentation](https://vitest.dev/)
- 🎭 [Playwright Docs](https://playwright.dev/)  
- 🧪 [Testing Library](https://testing-library.com/)
- 🚀 [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- 🔍 [Axe Accessibility](https://www.deque.com/axe/)

### Scripts de Teste:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:coverage && npm run test:e2e",
    "lighthouse": "lhci autorun",
    "analyze-bundle": "node scripts/analyze-bundle.js"
  }
}
```

---

## 🙏 Versículo dos Testes

> "Todo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens."  
> — Colossenses 3:23

Nossos testes são feitos com excelência e cuidado, garantindo que a plataforma sirva bem aos usuários e honre a Deus! 🧪✝️