export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  return password.length >= 8;
}

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score === 4) return { score, label: 'Strong', color: 'bg-lime-500' };
  return { score, label: 'Very Strong', color: 'bg-green-500' };
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2;
}

export interface ValidationErrors {
  [key: string]: string;
}

export function validateRegisterForm(data: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isValidName(data.fullName)) {
    errors.fullName = 'Name must be at least 2 characters';
  }
  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!isStrongPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters';
  }
  if (!doPasswordsMatch(data.password, data.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match';
  }
  if (!data.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
  }

  return errors;
}

export function validateLoginForm(data: {
  email: string;
  password: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  }

  return errors;
}
