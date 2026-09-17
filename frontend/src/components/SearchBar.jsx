import { useState, useEffect } from 'react';
import { Mic, Search, X } from 'lucide-react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [supportSpeech, setSupportSpeech] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupportSpeech(false);
    }
  }, []);

  const handleVoiceSearch = () => {
    if (isListening) return;
    
    setVoiceStatus('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupportSpeech(false);
      return;
    }

    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Listening...');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      setVoiceStatus('');
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
         setVoiceStatus('Microphone access denied.');
      } else if (event.error === 'no-speech') {
         setVoiceStatus('No speech detected.');
      } else {
         setVoiceStatus('Recognition error. Try again.');
      }
      setTimeout(() => setVoiceStatus(''), 4000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (voiceStatus === 'Listening...') {
         setVoiceStatus('');
      }
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition", e);
        setIsListening(false);
        setVoiceStatus('Recognition error.');
        setTimeout(() => setVoiceStatus(''), 4000);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative flex-1 group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textSecondary group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a product..."
          aria-label="Search for a product"
          className="w-full bg-surface border-2 border-border rounded-xl py-4 pl-12 pr-12 text-textPrimary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-inner text-lg"
        />
        
        {query && (
          <button 
            type="button"
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-10 pr-3 flex items-center text-textSecondary hover:text-white"
          >
            <X size={16} />
          </button>
        )}

        {supportSpeech ? (
          <button 
            type="button"
            onClick={handleVoiceSearch}
            title={isListening ? 'Listening...' : 'Voice Search'}
            aria-label="Voice Search"
            disabled={isListening}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
              isListening ? 'bg-primary/20 text-primary animate-pulse' : 'text-textSecondary hover:text-primary hover:bg-surfaceHover'
            }`}
          >
            <Mic size={20} />
          </button>
        ) : (
          <button 
            type="button"
            title="Voice Search not supported in this browser"
            aria-label="Voice Search not supported"
            disabled
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-600 cursor-not-allowed"
          >
            <Mic size={20} />
          </button>
        )}
      </div>
      <button type="submit" className="btn-primary flex-shrink-0" aria-label="Search">
        <span>Search</span>
      </button>
      
      {voiceStatus && (
        <div className="absolute -bottom-6 left-2 text-xs text-primary font-medium animate-in fade-in">
          {voiceStatus}
        </div>
      )}
    </form>
  );
}
