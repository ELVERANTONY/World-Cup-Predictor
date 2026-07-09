import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { UserCredentials } from '../../types/auth.types';
import {
  Ripple,
  AuthTabs,
  TechOrbitDisplay,
} from '../ui/auth-components';
import type { IconConfig } from '../ui/auth-components';
import worldCupImage from '../../assets/World Cup.png';

export interface ReadonlyLoginFormProps {
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly onSubmit?: (credentials: UserCredentials) => Promise<void>;
}

const iconsArray: IconConfig[] = [
  {
    component: () => (
      <img
        src='https://flagcdn.com/ar.svg'
        alt='Argentina'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 25,
    delay: 10,
    radius: 240,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/br.svg'
        alt='Brazil'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 25,
    delay: 22,
    radius: 240,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/fr.svg'
        alt='France'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[46px] border-none bg-transparent',
    radius: 265,
    duration: 30,
    delay: 10,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/gb-eng.svg'
        alt='England'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[46px] border-none bg-transparent',
    radius: 265,
    duration: 30,
    delay: 25,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/es.svg'
        alt='Spain'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 35,
    delay: 10,
    radius: 290,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/de.svg'
        alt='Germany'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[36px] border-none bg-transparent',
    duration: 35,
    delay: 27,
    radius: 290,
    path: false,
    reverse: false,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/pt.svg'
        alt='Portugal'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[46px] border-none bg-transparent',
    radius: 315,
    duration: 40,
    delay: 10,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/it.svg'
        alt='Italy'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[46px] border-none bg-transparent',
    radius: 315,
    duration: 40,
    delay: 30,
    path: false,
    reverse: true,
  },
  {
    component: () => (
      <img
        src='https://flagcdn.com/us.svg'
        alt='USA'
        className='w-full h-full object-cover rounded-full shadow-md'
      />
    ),
    className: 'size-[46px] border-none bg-transparent',
    radius: 340,
    duration: 45,
    delay: 20,
    path: false,
    reverse: false,
  },
];

export function LoginForm({ isLoading, error, onSubmit }: ReadonlyLoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const goToForgotPassword = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    event.preventDefault();
    console.log('forgot password');
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    name: 'email' | 'password'
  ) => {
    const value = event.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (onSubmit) {
      onSubmit(formData).catch(() => {});
    } else {
      console.log('Form submitted', formData);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your account',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as const,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as const,
        placeholder: 'Enter your password',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: isLoading ? 'Signing in...' : 'Sign in',
    textVariantButton: 'Forgot password?',
  };

  return (
    <section className='flex max-lg:justify-center bg-white dark:bg-black min-h-screen'>
      {/* Left Side */}
      <span className='flex flex-col justify-center w-1/2 max-lg:hidden relative'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay 
          iconsArray={iconsArray} 
          text='World Cup 2026' 
          centerImage={<img src={worldCupImage} alt="World Cup" className="h-[28rem] md:h-[30rem] w-auto object-contain drop-shadow-2xl z-20" />} 
        />
      </span>

      {/* Right Side */}
      <span className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%] relative z-10'>
        <AuthTabs
          formFields={formFields}
          goTo={goToForgotPassword}
          handleSubmit={handleSubmit}
        />
        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}
      </span>
    </section>
  );
}
