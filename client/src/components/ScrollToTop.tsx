import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  showBelow: number;
}

const ScrollToTop = ({ showBelow }: ScrollToTopProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle scroll events to determine when to show the button
  useEffect(() => {
    const checkScrollHeight = () => {
      if (!showBelow) return;
      
      const scrollHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight,
        document.body.offsetHeight, 
        document.documentElement.offsetHeight,
        document.body.clientHeight, 
        document.documentElement.clientHeight
      );
      
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Calculate scroll progress percentage
      const progress = Math.min(scrollY / (scrollHeight - windowHeight), 1);
      setScrollProgress(progress * 100);
      
      // Determine if the scroll-to-top button should be visible
      if (scrollY > showBelow) {
        if (!isVisible) setIsVisible(true);
      } else {
        if (isVisible) setIsVisible(false);
      }
    };

    window.addEventListener('scroll', checkScrollHeight);
    return () => window.removeEventListener('scroll', checkScrollHeight);
  }, [showBelow, isVisible]);

  // Scroll to top when clicking the button
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Scroll progress indicator */}
      <div className="scroll-progress-container">
        <div 
          className="scroll-progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Scroll to top button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className={`
            fixed bottom-12 right-6 z-40 bg-purple-600 text-white p-3 rounded-full 
            shadow-lg transition-all duration-300 hover:bg-purple-700 hover-float 
            scroll-to-top-button focus:outline-none focus:ring-2 focus:ring-purple-400 
            focus:ring-opacity-50
          `}
        >
          <ChevronUp size={20} />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;