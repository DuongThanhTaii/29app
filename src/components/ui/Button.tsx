'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'action' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-full font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2 select-none';

  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:opacity-90 active:scale-95',
    secondary: 'border-2 border-primary text-primary hover:bg-primary hover:text-on-primary active:scale-95',
    action: 'bg-secondary text-on-secondary hover:opacity-90 active:scale-95',
    ghost: 'text-primary hover:bg-surface-container-low active:scale-95',
  };

  const sizeStyles = {
    sm: 'py-2 px-4 text-[10px]',
    md: 'py-3 px-6 text-[11px]',
    lg: 'py-4 px-8 text-[12px]',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace", boxShadow: variant === 'primary' ? '4px 4px 0 rgba(0,0,0,0.1)' : undefined }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
