import React from 'react';

export default function PageContainer({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="glow-bg"></div>
      <div className="relative z-10 flex flex-col flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
