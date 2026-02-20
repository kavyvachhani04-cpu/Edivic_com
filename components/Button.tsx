import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-blue-600 text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-transparent hover:border-primary-400',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700',
    outline: 'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400',
    danger: 'bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/30',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs uppercase',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};