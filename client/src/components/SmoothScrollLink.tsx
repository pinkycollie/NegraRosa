import { Link } from 'wouter';
import { ReactNode, MouseEvent } from 'react';

interface SmoothScrollLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const SmoothScrollLink = ({ href, className, children, onClick }: SmoothScrollLinkProps) => {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
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
    else if (href === window.location.pathname || href === '/') {
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

  return (
    <Link href={href}>
      <a className={className} onClick={handleClick}>
        {children}
      </a>
    </Link>
  );
};

export default SmoothScrollLink;