import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { LoginForm } from '@/features/auth/LoginForm';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { ForgotPasswordForm } from '@/features/auth/ForgotPasswordForm';
import { useAuth } from '@/hooks/useAuth';

type AuthView = 'login' | 'register' | 'forgot';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState<AuthView>((location.state as any)?.tab || 'login');

  useEffect(() => {
    if ((location.state as any)?.tab) {
      setView((location.state as any).tab);
    }
  }, [location.state]);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1 mb-8">
          {(['login', 'register'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-all',
                view === tab
                  ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'login' && (
              <LoginForm
                onForgotPassword={() => setView('forgot')}
                onSuccess={() => navigate('/dashboard')}
              />
            )}
            {view === 'register' && (
              <RegisterForm onSuccess={() => navigate('/dashboard')} />
            )}
            {view === 'forgot' && (
              <ForgotPasswordForm onBack={() => setView('login')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
