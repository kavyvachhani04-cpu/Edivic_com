import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer Ring */}
        <div className="h-16 w-16 rounded-full border-4 border-slate-700 border-t-primary-500 animate-spin"></div>
        
        {/* Inner Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 bg-primary-500/20 rounded-full animate-pulse"></div>
      </div>
      <p className="mt-4 text-slate-400 text-sm font-medium animate-pulse">Loading EDIVIC...</p>
    </div>
  );
};
