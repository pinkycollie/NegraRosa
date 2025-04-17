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
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {/* Sidebar */}
          {sidebarContent && (
            <div className="md:col-span-1">
              {sidebarContent}
            </div>
          )}
          
          {/* Main content */}
          <div className={sidebarContent ? "md:col-span-3" : "md:col-span-4"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}