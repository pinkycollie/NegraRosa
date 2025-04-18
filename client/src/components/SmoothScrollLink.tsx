import { Link, useLocation } from "wouter";
import { ReactNode } from "react";

interface SmoothScrollLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  scrollToTop?: boolean;
  onClick?: () => void;
}

export default function SmoothScrollLink({ 
  href, 
  children, 
  className = "", 
  activeClassName = "text-purple-600 font-medium",
  scrollToTop = true,
  onClick
}: SmoothScrollLinkProps) {
  const [location] = useLocation();
  const isActive = location === href;
  
  const handleClick = (e: React.MouseEvent) => {
    // If this is an anchor link, handle smooth scrolling
    if (href.startsWith('#') && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    } else if (scrollToTop) {
      // Otherwise, if it's a different page, scroll to top after a small delay
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }, 100);
    }
    
    // Call any additional onClick handler
    if (onClick) onClick();
  };

  return (
    <Link href={href}>
      <a 
        className={`${className} ${isActive ? activeClassName : ''} transition-colors`}
        onClick={handleClick}
      >
        {children}
      </a>
    </Link>
  );
}