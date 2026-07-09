import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { TechOrbitDisplay, Ripple } from '@/components/ui/auth-components';
import type { IconConfig } from '@/components/ui/auth-components';
import worldCupImage from '@/assets/World Cup.png';

const iconsArray: IconConfig[] = [
  { component: () => <img src='https://flagcdn.com/ar.svg' alt='Argentina' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[36px] border-none bg-transparent', duration: 25, delay: 10, radius: 240, path: false, reverse: false },
  { component: () => <img src='https://flagcdn.com/br.svg' alt='Brazil' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[36px] border-none bg-transparent', duration: 25, delay: 22, radius: 240, path: false, reverse: false },
  { component: () => <img src='https://flagcdn.com/fr.svg' alt='France' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[46px] border-none bg-transparent', radius: 265, duration: 30, delay: 10, path: false, reverse: true },
  { component: () => <img src='https://flagcdn.com/gb-eng.svg' alt='England' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[46px] border-none bg-transparent', radius: 265, duration: 30, delay: 25, path: false, reverse: true },
  { component: () => <img src='https://flagcdn.com/es.svg' alt='Spain' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[36px] border-none bg-transparent', duration: 35, delay: 10, radius: 290, path: false, reverse: false },
  { component: () => <img src='https://flagcdn.com/de.svg' alt='Germany' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[36px] border-none bg-transparent', duration: 35, delay: 27, radius: 290, path: false, reverse: false },
  { component: () => <img src='https://flagcdn.com/pt.svg' alt='Portugal' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[46px] border-none bg-transparent', radius: 315, duration: 40, delay: 10, path: false, reverse: true },
  { component: () => <img src='https://flagcdn.com/it.svg' alt='Italy' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[46px] border-none bg-transparent', radius: 315, duration: 40, delay: 30, path: false, reverse: true },
  { component: () => <img src='https://flagcdn.com/us.svg' alt='USA' className='w-full h-full object-cover rounded-full shadow-md' />, className: 'size-[46px] border-none bg-transparent', radius: 340, duration: 45, delay: 20, path: false, reverse: false },
];

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-black">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-gradient-to-br from-worldcup-900 via-worldcup-800 to-black">
        <Ripple mainCircleSize={100} mainCircleOpacity={0.15} />
        <TechOrbitDisplay
          iconsArray={iconsArray}
          text="World Cup 2026"
          centerImage={
              <motion.img
              src={worldCupImage}
              alt="World Cup"
              className="h-[28rem] md:h-[30rem] w-auto object-contain drop-shadow-2xl z-20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          }
        />
      </div>
      <motion.div
        className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
