import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  showBelow?: number;
}

const ScrollToTop = ({ showBelow = 300 }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll events to show/hide button and update progress
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    // Set button visibility based on scroll position
    setIsVisible(scrollY > showBelow);
    
    // Calculate scroll progress percentage
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight) {
      setScrollProgress((scrollY / scrollHeight) * 100);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click to smoothly scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Scroll progress indicator */}
      <div 
        className="scroll-indicator" 
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />
      
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed right-6 bottom-24 z-40 bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <ArrowUp size={20} />
      </button>
    </>
  );
};

export default ScrollToTop;