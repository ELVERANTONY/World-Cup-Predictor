import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';

interface RegisterFormProps {
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

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: '', width: '0%' };
  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length + (length >= 8 ? 1 : 0);

  if (length < 6 || score <= 1) return { label: 'Débil', color: 'bg-red-500', width: '25%' };
  if (score <= 2) return { label: 'Regular', color: 'bg-orange-500', width: '50%' };
  if (score <= 3) return { label: 'Bueno', color: 'bg-yellow-500', width: '75%' };
  return { label: 'Fuerte', color: 'bg-green-500', width: '100%' };
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const strength = getPasswordStrength(formData.password);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'El nombre es requerido';
    if (!formData.email) errors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Formato de correo inválido';
    if (!formData.password) errors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (!formData.confirmPassword) errors.confirmPassword = 'Por favor confirma tu contraseña';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';
    if (!acceptTerms) errors.acceptTerms = 'Debes aceptar los términos';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register(formData.fullName, formData.email, formData.password);
      onSuccess?.();
    } catch {
      setError('Error al registrarse. Por favor intenta nuevamente.');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear cuenta</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Únete a World Cup Predictor</p>
      </motion.div>

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={itemVariants}>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Ingresa tu nombre completo"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors',
                fieldErrors.fullName
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-300 dark:border-zinc-600 focus:ring-worldcup-500/30 focus:border-worldcup-500'
              )}
            />
          </div>
          {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
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
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Crea una contraseña"
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
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                <div className={cn('h-1 rounded-full transition-all', strength.color)} style={{ width: strength.width }} />
              </div>
              <p className={cn('text-xs mt-1', strength.color === 'bg-red-500' ? 'text-red-500' : strength.color === 'bg-orange-500' ? 'text-orange-500' : strength.color === 'bg-yellow-500' ? 'text-yellow-500' : 'text-green-500')}>
                Fuerza de la contraseña: {strength.label}
              </p>
            </div>
          )}
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Confirma tu contraseña"
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors',
                fieldErrors.confirmPassword
                  ? 'border-red-500 focus:ring-red-500/30'
                  : 'border-gray-300 dark:border-zinc-600 focus:ring-worldcup-500/30 focus:border-worldcup-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-zinc-600 text-worldcup-600 focus:ring-worldcup-500/30"
          />
          <label className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            Acepto los{' '}
            <a href="#" className="text-worldcup-600 dark:text-worldcup-400 hover:underline">Términos de Servicio</a>
            {' '}y la{' '}
            <a href="#" className="text-worldcup-600 dark:text-worldcup-400 hover:underline">Política de Privacidad</a>
          </label>
        </div>
        {fieldErrors.acceptTerms && <p className="text-red-500 text-xs">{fieldErrors.acceptTerms}</p>}

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
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
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
                  setError('Falló el registro con Google');
                }
              }
            }}
            onError={() => setError('Falló el registro con Google')}
            size="large"
            width={400}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
