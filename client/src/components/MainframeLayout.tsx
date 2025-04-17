import React, { ReactNode } from "react";

interface MainframeBlockProps {
  title: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "system" | "security" | "upload";
  icon?: ReactNode;
}

export function MainframeBlock({ 
  title, 
  children, 
  variant = "primary",
  icon 
}: MainframeBlockProps) {
  const variantStyles = {
    primary: "border-purple-400 bg-purple-50/30 dark:bg-purple-950/20",
    secondary: "border-blue-400 bg-blue-50/30 dark:bg-blue-950/20",
    system: "border-green-400 bg-green-50/30 dark:bg-green-950/20",
    security: "border-amber-400 bg-amber-50/30 dark:bg-amber-950/20",
    upload: "border-red-400 bg-red-50/30 dark:bg-red-950/20"
  };

  return (
    <div className={`border-2 ${variantStyles[variant]} rounded-lg p-4 shadow-sm relative overflow-hidden`}>
      {/* Decorative grid lines for mainframe feel */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-20">
        {Array(12).fill(0).map((_, i) => (
          <div key={`v-${i}`} className="h-full w-px bg-current absolute" style={{ left: `${(i+1) * 8.33}%` }} />
        ))}
        {Array(12).fill(0).map((_, i) => (
          <div key={`h-${i}`} className="w-full h-px bg-current absolute" style={{ top: `${(i+1) * 8.33}%` }} />
        ))}
      </div>
      
      {/* Top header bar */}
      <div className="flex items-center mb-3 border-b pb-2 relative z-10">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <div className="ml-auto flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Terminal-style pointer at bottom right */}
      <div className="absolute bottom-1 right-2 text-muted-foreground text-xs opacity-70 font-mono">
        <span className="animate-pulse">▌</span>
      </div>
    </div>
  );
}

interface ProcessUnitProps {
  title: string;
  children: ReactNode;
  variant?: "verification" | "identity" | "risk" | "community";
  steps?: number;
  currentStep?: number;
}

export function ProcessUnit({ 
  title, 
  children, 
  variant = "verification",
  steps = 0,
  currentStep = 0
}: ProcessUnitProps) {
  const getVariantStyles = () => {
    switch(variant) {
      case "verification":
        return "border-l-4 border-l-purple-500";
      case "identity":
        return "border-l-4 border-l-blue-500";
      case "risk":
        return "border-l-4 border-l-amber-500";
      case "community":
        return "border-l-4 border-l-green-500";
    }
  };

  return (
    <div className={`bg-card rounded-r-md ${getVariantStyles()} p-4 shadow-sm mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold">{title}</h4>
        {steps > 0 && (
          <div className="text-xs text-muted-foreground">
            Step {currentStep} of {steps}
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

interface MainframeLayoutProps {
  children: ReactNode;
  sidebarContent?: ReactNode;
}

export default function MainframeLayout({ 
  children,
  sidebarContent
}: MainframeLayoutProps) {
  return (
    <div className="bg-gradient-to-b from-background to-muted min-h-screen">
      {/* Visible grid pattern overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="h-full w-full bg-grid-pattern opacity-5"></div>
      </div>
      
      {/* Support Button - Floating Sign Language Icon */}
      <div className="fixed bottom-24 right-4 z-50">
        <button className="bg-purple-800 hover:bg-purple-700 text-white rounded-full p-3 shadow-lg flex items-center gap-2 transition-all hover:shadow-xl">
          <span className="text-xl">🤟</span>
          <span className="pr-2">Support & Inquiries</span>
        </button>
      </div>
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {/* Sticky Sidebar */}
          {sidebarContent && (
            <div className="md:col-span-1">
              <div className="sticky top-6">
                {sidebarContent}
              </div>
            </div>
          )}
          
          {/* Main content */}
          <div className={sidebarContent ? "md:col-span-3" : "md:col-span-4"}>
            {children}
          </div>
        </div>
      </div>
      
      {/* B-roll component - Top sticky menu */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-sm border-b border-purple-800/50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer px-3 py-1 rounded-full hover:bg-purple-900/30">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="text-sm whitespace-nowrap">Home</span>
              </div>
              
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer px-3 py-1 rounded-full hover:bg-purple-900/30">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
                <span className="text-sm whitespace-nowrap">Verification</span>
              </div>
              
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer px-3 py-1 rounded-full hover:bg-purple-900/30">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span className="text-sm whitespace-nowrap">Community</span>
              </div>
              
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer px-3 py-1 rounded-full hover:bg-purple-900/30">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <path d="m21 15-5-5L5 21"></path>
                </svg>
                <span className="text-sm whitespace-nowrap">Visual Security</span>
              </div>
              
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer px-3 py-1 rounded-full hover:bg-purple-900/30">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <span className="text-sm whitespace-nowrap">Status</span>
              </div>
              
              <div className="flex items-center gap-2 text-purple-400 cursor-pointer px-3 py-1 rounded-full hover:bg-purple-900/30">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                </svg>
                <span className="text-sm whitespace-nowrap">Integration</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center text-purple-400 cursor-pointer text-sm">
                <span className="text-lg mr-1">🤟</span>
                <span className="hidden sm:inline">Sign In</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add top padding to account for sticky menu */}
      <div className="h-14"></div>
    </div>
  );
}