import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';

interface LoginFormProps {
  onForgotPassword: () => void;
  onSuccess?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function LoginForm({ onForgotPassword, onSuccess }: LoginFormProps) {
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Formato de correo inválido';
    if (!password) errors.password = 'La contraseña es requerida';
    else if (password.length < 6) errors.password = 'Mínimo 6 caracteres';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch {
      setError('Correo o contraseña inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bienvenido de vuelta</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Inicia sesión en tu cuenta</p>
      </motion.div>

      <motion.form onSubmit={handleSubmit} className="space-y-5" variants={itemVariants}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors',
                fieldErrors.email
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-300 dark:border-zinc-600 focus:ring-worldcup-500/30 focus:border-worldcup-500'
              )}
            />
          </div>
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors',
                fieldErrors.password
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-300 dark:border-zinc-600 focus:ring-worldcup-500/30 focus:border-worldcup-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-zinc-600 text-worldcup-600 focus:ring-worldcup-500/30"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Recordarme</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-worldcup-600 dark:text-worldcup-400 hover:underline font-medium"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm text-center bg-red-500/10 rounded-lg py-2"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'w-full py-2.5 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2',
            isLoading
              ? 'bg-worldcup-400 cursor-not-allowed'
              : 'bg-worldcup-600 hover:bg-worldcup-700 shadow-lg shadow-worldcup-600/20'
          )}
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </motion.button>
      </motion.form>

      <motion.div variants={itemVariants} className="mt-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
          <span className="text-sm text-gray-400 dark:text-gray-500">o</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
        </div>

        <div className="mt-4 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                try {
                  await googleLogin(credentialResponse.credential);
                  onSuccess?.();
                } catch {
                  setError('Falló el inicio de sesión con Google');
                }
              }
            }}
            onError={() => setError('Falló el inicio de sesión con Google')}
            size="large"
            width={400}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
