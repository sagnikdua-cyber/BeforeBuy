import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) {
  const baseClasses = 'flex items-center justify-center gap-2 px-6 py-3 text-base font-bold tracking-wide uppercase rounded-xl transition-all';
  const primaryClasses = 'bg-primary text-background hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(0,240,255,0.4)]';
  const secondaryClasses = 'bg-surfaceHover text-textPrimary hover:bg-surfaceHover/80 border border-border';
  
  const finalClasses = `${baseClasses} ${variant === 'primary' ? primaryClasses : secondaryClasses} ${className}`;
  
  return (
    <button 
      className={finalClasses}
      {...props}
    >
      {children}
    </button>
  );
}
