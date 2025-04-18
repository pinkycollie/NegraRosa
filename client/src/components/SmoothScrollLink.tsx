import { Link, useLocation } from 'wouter';
import { ReactNode, MouseEvent } from 'react';

interface SmoothScrollLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const SmoothScrollLink = ({ href, className, children, onClick }: SmoothScrollLinkProps) => {
  const [location] = useLocation();
  
  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // If it's a hash link (in-page navigation)
    if (href.startsWith('#')) {
      e.preventDefault();
      
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
      
      if (onClick) onClick();
    }
    // If it's a normal page link but we're already on that page
    else if (href === location || href === '/') {
      e.preventDefault();
      
      // Smooth scroll to the top of the page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      if (onClick) onClick();
    }
    // Otherwise, let wouter's Link handle the navigation
  };

  // Use a div with a role="link" for accessibility when this is just smooth scrolling on the current page
  if (href.startsWith('#') || href === location || href === '/') {
    return (
      <div 
        role="link"
        tabIndex={0}
        className={className} 
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      >
        {children}
      </div>
    );
  }
  
  // Otherwise use wouter's Link for actual page navigation
  return (
    <Link href={href}>
      <div className={className}>
        {children}
      </div>
    </Link>
  );
};

export default SmoothScrollLink;