import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5 uppercase tracking-wider text-xs">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg shadow-inner text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
          error ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-700 hover:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};