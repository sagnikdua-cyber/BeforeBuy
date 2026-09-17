import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 mb-8">
      <Link to="/" className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded-lg">
        <Logo />
      </Link>
      
      <div className="flex items-center">
        <Link 
            to="/tracked" 
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-teal-400 bg-gray-800/50 hover:bg-gray-800 px-4 py-2 rounded-full border border-gray-700 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            Tracked Alerts
        </Link>
      </div>
    </header>
  );
}
