import React from 'react';
import logoUrl from '../assets/logo.png';

export default function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img src={logoUrl} alt="BeforeBuy Logo" className="w-10 h-10 object-contain" />
      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-success">
        BeforeBuy
      </span>
    </div>
  );
}
