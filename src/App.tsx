import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './components/pages/LandingPage';
import { ComingSoonPage } from './components/pages/ComingSoonPage';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { BlogPage } from './components/pages/BlogPage';
import { ArticlePage } from './components/pages/ArticlePage';
import { AdminPage } from './components/pages/AdminPage';
import { ChallengesPage } from './components/pages/ChallengesPage';

// Router component
function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    
    // Intercept link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const newPath = new URL(link.href).pathname;
        window.history.pushState({}, '', link.href);
        setCurrentPath(newPath);
        window.scrollTo(0, 0);
      }
    });

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Handle dynamic routes
  let matchedRoute: React.ReactNode = null;

  // PÁGINA EM BREVE - Todas as rotas exceto home vão para "Coming Soon"
  if (currentPath === '/') {
    matchedRoute = <LandingPage />;
  } else {
    // Todas as outras rotas mostram "Em Breve"
    matchedRoute = <ComingSoonPage />;
  }

  // Rotas desabilitadas temporariamente (modo "Coming Soon")
  /*
  if (currentPath === '/') {
    matchedRoute = <LandingPage />;
  } else if (currentPath === '/login') {
    matchedRoute = <LoginPage />;
  } else if (currentPath === '/registro') {
    matchedRoute = <RegisterPage />;
  } else if (currentPath === '/blog') {
    matchedRoute = <BlogPage />;
  } else if (currentPath.startsWith('/artigo/')) {
    const slug = currentPath.replace('/artigo/', '');
    matchedRoute = <ArticlePage slug={slug} />;
  } else if (currentPath === '/desafios') {
    matchedRoute = <ProtectedRoute><ChallengesPage /></ProtectedRoute>;
  } else if (currentPath === '/dashboard') {
    matchedRoute = <ProtectedRoute><DashboardPlaceholder /></ProtectedRoute>;
  } else if (currentPath === '/admin') {
    matchedRoute = <ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>;
  } else if (currentPath === '/contato') {
    matchedRoute = <ContactPlaceholder />;
  } else {
    matchedRoute = <NotFoundPage />;
  }
  */

  // Show pages without header/footer (Coming Soon não precisa de layout)
  return <>{matchedRoute}</>;
}

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">Você não tem permissão para acessar esta página.</p>
          <a href="/" className="text-blue-600 hover:text-blue-700">
            Voltar para o início
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Placeholder components (to be implemented)



function DashboardPlaceholder() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl text-gray-900 mb-4">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {user?.name}! 👋</p>
        <p className="text-gray-600 mt-2">Dashboard em construção...</p>
      </div>
    </div>
  );
}



function ContactPlaceholder() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl text-gray-900 mb-4">Contato</h1>
        <p className="text-gray-600">Página de contato em construção... 📧</p>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl text-gray-900 mb-2">Página não encontrada</h1>
        <p className="text-gray-600 mb-6">A página que você está procurando não existe.</p>
        <a
          href="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar para o início
        </a>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
