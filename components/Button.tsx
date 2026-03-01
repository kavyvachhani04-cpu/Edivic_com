import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
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
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-full';
  
  const variants = {
    primary: 'bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/5',
    gold: 'bg-gold text-black hover:bg-gold-light shadow-lg shadow-gold/20',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10',
    outline: 'border border-white/20 text-white hover:border-white/40 hover:bg-white/[0.02]',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-4 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
