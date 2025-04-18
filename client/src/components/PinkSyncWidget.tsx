import { useEffect, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';

const PinkSyncWidget = () => {
  // State to control visibility
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if user has dismissed this component before
  useEffect(() => {
    const dismissed = localStorage.getItem('pinkSyncDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    } else {
      // Show after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Dismiss the widget and remember this choice
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pinkSyncDismissed', 'true');
  };

  // Minimize the widget
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsVisible(false);
  };

  // Restore from minimized state
  const handleRestore = () => {
    setIsMinimized(false);
    setIsVisible(true);
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Minimized state */}
      {isMinimized && (
        <button
          onClick={handleRestore}
          className="fixed bottom-24 left-6 z-40 bg-pink-500 text-white p-3 rounded-full shadow-lg 
                    transition-all duration-300 hover:bg-pink-600 hover-float"
          aria-label="Show PinkSync"
        >
          <span className="flex items-center text-xs font-medium">
            <svg 
              viewBox="0 0 24 24" 
              className="h-4 w-4 mr-1" 
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" 
              />
            </svg>
            PinkSync
          </span>
        </button>
      )}

      {/* Full widget */}
      {isVisible && (
        <div 
          className="fixed bottom-24 left-6 z-40 w-64 bg-white rounded-lg shadow-xl border-2 border-pink-300
                    transition-all duration-300 transform hover-float"
        >
          <div className="flex items-center justify-between bg-pink-500 text-white p-3 rounded-t-lg">
            <h3 className="text-sm font-semibold flex items-center">
              <svg 
                viewBox="0 0 24 24" 
                className="h-4 w-4 mr-2" 
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" 
                />
              </svg>
              PinkSync Available
            </h3>
            <div className="flex space-x-1">
              <button 
                onClick={handleMinimize}
                className="text-white hover:text-pink-200 transition-colors"
                aria-label="Minimize PinkSync widget"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 12H6" />
                </svg>
              </button>
              <button 
                onClick={handleDismiss}
                className="text-white hover:text-pink-200 transition-colors"
                aria-label="Close PinkSync widget"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-gray-700 mb-3">
              PinkSync offers complementary services for enhanced accessibility and synchronized communications.
            </p>
            <a 
              href="https://pinksync.example.com" 
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center justify-between w-full text-sm bg-pink-100 hover:bg-pink-200 
                        text-pink-800 px-3 py-2 rounded transition-colors"
            >
              <span>Visit PinkSync Website</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default PinkSyncWidget;