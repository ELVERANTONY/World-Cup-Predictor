import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';

interface LoadingProps {
  fullPage?: boolean;
  message?: string;
}

export function Loading({ fullPage = true, message = 'Loading...' }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Trophy className="w-12 h-12 text-worldcup-500" />
      </motion.div>
      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-worldcup-500"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </motion.div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{message}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}
