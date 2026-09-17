import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { WifiOff, RefreshCw, X } from 'lucide-react';

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.error('SW registration error', error)
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // Add global online/offline detection for UI fallback
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offlineReady && !needRefresh && isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      
      {!isOnline && (
        <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 backdrop-blur-sm border border-red-400">
          <WifiOff size={20} />
          <div className="flex flex-col">
             <span className="font-semibold text-sm">You are offline</span>
             <span className="text-xs opacity-90">Live price search requires an internet connection.</span>
          </div>
        </div>
      )}

      {(offlineReady || needRefresh) && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-xl border border-gray-700 flex flex-col gap-3 max-w-sm animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start gap-4">
            <div className="text-sm">
              {offlineReady
                ? 'App is ready to work offline.'
                : 'New content is available, click on reload button to update.'}
            </div>
            <button onClick={close} className="text-gray-400 hover:text-white" aria-label="Close">
              <X size={16} />
            </button>
          </div>
          
          {needRefresh && (
            <button
              className="bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium py-1.5 px-3 rounded flex items-center justify-center gap-2 transition-colors"
              onClick={() => updateServiceWorker(true)}
            >
              <RefreshCw size={14} />
              Reload App
            </button>
          )}
        </div>
      )}

    </div>
  );
}

export default ReloadPrompt;
