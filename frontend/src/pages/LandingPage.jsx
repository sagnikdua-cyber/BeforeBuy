import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../layouts/PageContainer';
import Logo from '../components/Logo';
import Button from '../components/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center flex-grow text-center space-y-12">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center space-y-6">
          <Logo className="scale-125 mb-4" />
          
          <div className="space-y-2">
            <h1 className="text-display">
              <span className="block">Compare prices.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-textSecondary to-textPrimary">Understand the trend.</span>
              <span className="block text-primary">Buy at the right time.</span>
            </h1>
          </div>
          
          <p className="text-body max-w-2xl text-xl mt-6">
            Make smarter purchasing decisions with intelligent price tracking and real-time market intelligence.
          </p>
        </div>

        {/* CTA Section */}
        <div className="pt-8">
          <Button 
            onClick={() => navigate('/search')}
            className="text-lg px-10 py-4"
            aria-label="Get Started"
          >
            GET STARTED
          </Button>
        </div>

        {/* Footer features */}
        <div className="absolute bottom-8 text-small flex gap-4 tracking-widest uppercase opacity-70">
          <span>Compare</span>
          <span>&bull;</span>
          <span>Analyze</span>
          <span>&bull;</span>
          <span>Track</span>
        </div>
        
      </div>
    </PageContainer>
  );
}
