import React, { useState } from 'react';
import PageContainer from '../layouts/PageContainer';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import AlternativeCard from '../components/AlternativeCard';
import AnalyzerPanel from '../components/AnalyzerPanel';
import TrackingModal from '../components/TrackingModal';
import { AlertCircle, Search } from 'lucide-react';

export default function SearchPage() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, empty, error
  const [results, setResults] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentQuery, setCurrentQuery] = useState('');
  const [analyzingProduct, setAnalyzingProduct] = useState(null);
  const [trackingProduct, setTrackingProduct] = useState(null);

  const handleSearch = async (query) => {
    if (!query || query.trim() === '') return;
    
    setStatus('loading');
    setCurrentQuery(query);
    setErrorMsg('');
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Live price search is temporarily unavailable.');
      }
      
      if (!data.results || data.results.length === 0) {
        setStatus('empty');
      } else {
        setResults(data.results);
        setAlternatives(data.alternatives || []);
        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Live price search is temporarily unavailable.');
      setStatus('error');
    }
  };

  return (
    <PageContainer>
      <Header />
      
      <main className="flex-grow flex flex-col items-center mt-6 space-y-8 w-full pb-12">
        
        <div className="text-center space-y-4 w-full">
          <h2 className="text-section">Find the best price before you buy.</h2>
        </div>

        <div className="w-full max-w-2xl sticky top-4 z-20">
          <SearchBar onSearch={handleSearch} disabled={status === 'loading'} />
        </div>

        <div className="w-full max-w-4xl mt-8">
          {/* IDLE STATE */}
          {status === 'idle' && (
            <div className="mt-8 max-w-3xl mx-auto w-full text-center py-16 opacity-80 border-dashed border-border border-2 bg-surface p-6 rounded-2xl shadow-2xl">
              <Search className="mx-auto mb-4 text-textSecondary" size={48} />
              <h3 className="text-xl font-semibold mb-2">Ready to search</h3>
              <p className="text-textSecondary">
                Enter a product name above to discover real-time pricing across merchants.
              </p>
            </div>
          )}

          {/* LOADING STATE */}
          {status === 'loading' && (
            <div className="mt-12 text-center space-y-8">
              <div className="inline-flex items-center gap-3 text-primary animate-pulse">
                <Search size={24} className="animate-bounce" />
                <span className="text-xl font-medium tracking-wide">Searching the market...</span>
              </div>
              <div className="space-y-4 max-w-3xl mx-auto opacity-50">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card flex gap-6 animate-pulse">
                    <div className="w-32 h-32 bg-border rounded-xl"></div>
                    <div className="flex-1 space-y-4 py-2">
                      <div className="h-4 bg-border rounded w-3/4"></div>
                      <div className="h-4 bg-border rounded w-1/4"></div>
                      <div className="h-8 bg-border rounded w-1/3 mt-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {status === 'empty' && (
            <div className="mt-8 max-w-3xl mx-auto w-full text-center py-16 opacity-80 border-dashed border-border border-2 bg-surface p-6 rounded-2xl shadow-2xl">
              <Search className="mx-auto mb-4 text-textSecondary" size={48} />
              <h3 className="text-xl font-semibold mb-2">No matching shopping results found.</h3>
              <p className="text-textSecondary">
                We couldn't find active listings for "{currentQuery}". Try refining your search terms.
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {status === 'error' && (
            <div className="mt-8 max-w-3xl mx-auto w-full text-center py-16 border border-warning/30 bg-warning/5 p-6 rounded-2xl shadow-2xl">
              <AlertCircle className="mx-auto mb-4 text-warning" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-warning">Live price search is temporarily unavailable.</h3>
              <p className="text-textSecondary mb-6">
                {errorMsg}
              </p>
              <button 
                onClick={() => handleSearch(currentQuery)}
                className="btn-secondary mx-auto"
              >
                Try Again
              </button>
            </div>
          )}

          {/* SUCCESS STATE */}
          {status === 'success' && (
            <div className="space-y-6">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-semibold text-textSecondary">
                  Results for <span className="text-textPrimary">"{currentQuery}"</span>
                </h3>
                <span className="text-sm text-textSecondary">{results.length} items found</span>
              </div>
              
              {analyzingProduct && (
                <AnalyzerPanel 
                  productKey={analyzingProduct.productId || analyzingProduct.title.toLowerCase().replace(/[^a-z0-9]/g, '-')} 
                  title={analyzingProduct.title}
                  currentPrice={analyzingProduct.extractedPrice}
                  onClose={() => setAnalyzingProduct(null)} 
                />
              )}
              
              <div className="flex flex-col gap-6">
                {results.map((product, index) => (
                  <ProductCard 
                    key={product.id || index} 
                    product={product} 
                    onAnalyze={(p) => {
                      setAnalyzingProduct(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onTrack={(p) => setTrackingProduct(p)}
                  />
                ))}
              </div>

              {/* BEFORE YOU BUY / ALTERNATIVES SECTION */}
              <div className="mt-16 border-t border-gray-800 pt-10">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">BEFORE YOU BUY</h3>
                  <p className="text-gray-400">Compare similar options before making a decision.</p>
                </div>
                
                {alternatives.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {alternatives.map((alt, idx) => (
                      <AlternativeCard 
                        key={alt.id || idx} 
                        product={alt} 
                        onTrack={(p) => setTrackingProduct(p)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-900/50 rounded-xl border border-gray-800">
                    <p className="text-gray-400 italic">No comparable alternatives found from the current shopping results.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Tracking Modal */}
      <TrackingModal 
        isOpen={!!trackingProduct} 
        product={trackingProduct} 
        onClose={() => setTrackingProduct(null)} 
      />
    </PageContainer>
  );
}
