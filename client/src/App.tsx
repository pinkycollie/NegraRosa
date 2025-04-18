import { Switch, Route, useLocation, Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import MainframeDashboard from "@/pages/MainframeDashboard";
import WebhookManagement from "@/pages/WebhookManagement";
import AccessibilityPage from "@/pages/AccessibilityPage";
import PricingPage from "@/pages/PricingPage";
import IndividualIdPage from "@/pages/IndividualIdPage";
import SupportBubble from "@/components/SupportBubble";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import ScrollToTop from "@/components/ScrollToTop";
import PinkSyncWidget from "@/components/PinkSyncWidget";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import "@/styles/ScrollStyles.css";

function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  // Track dropdown states for mobile accordions
  const [dropdowns, setDropdowns] = useState({
    security: false,
    accessibility: false,
    community: false
  });

  // Toggle a specific dropdown
  const toggleDropdown = (dropdown: keyof typeof dropdowns) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to section when clicking on smooth scroll links
  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    setActiveSection(sectionId);
    
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset menu state when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav 
      className={`bg-background border-b border-border sticky top-0 z-50 transition-all duration-200 ${
        scrolled ? 'shadow-md py-2' : 'py-4'
      }`}
      ref={menuRef}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <span className="text-lg font-semibold cursor-pointer">NegraRosa Security</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
            <div className="flex space-x-6 py-2 px-4 whitespace-nowrap">
              <SmoothScrollLink href="/" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Home
              </SmoothScrollLink>
              
              <SmoothScrollLink href="/mainframe" className="text-sm font-medium hover:text-purple-600 transition-colors">
                For Organizations
              </SmoothScrollLink>
              
              <div className="relative group">
                <button className="text-sm font-medium hover:text-purple-600 transition-colors flex items-center">
                  Security Features
                  <ChevronDown className="ml-1 h-4 w-4 transform group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 mt-2 hidden group-hover:block bg-white border border-border rounded-md shadow-lg p-2 z-10 w-48 transition-all">
                  <SmoothScrollLink href="/demo" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Demo
                  </SmoothScrollLink>
                  <SmoothScrollLink href="/individual-id" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Individual ID
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Authentication
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Data Protection
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Risk Management
                  </SmoothScrollLink>
                </div>
              </div>
              
              <div className="relative group">
                <button className="text-sm font-medium hover:text-purple-600 transition-colors flex items-center">
                  Accessibility
                  <ChevronDown className="ml-1 h-4 w-4 transform group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 mt-2 hidden group-hover:block bg-white border border-border rounded-md shadow-lg p-2 z-10 w-48 transition-all">
                  <SmoothScrollLink href="/accessibility" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Voice & Visual Guidance
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Accessibility Settings
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Resources
                  </SmoothScrollLink>
                </div>
              </div>
              
              <SmoothScrollLink href="/pricing" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Pricing
              </SmoothScrollLink>
              
              <div className="relative group">
                <button className="text-sm font-medium hover:text-purple-600 transition-colors flex items-center">
                  Community
                  <ChevronDown className="ml-1 h-4 w-4 transform group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 mt-2 hidden group-hover:block bg-white border border-border rounded-md shadow-lg p-2 z-10 w-48 transition-all">
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Directory
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Events
                  </SmoothScrollLink>
                  <SmoothScrollLink href="#" className="block px-3 py-2 text-sm hover:bg-purple-50 rounded-md">
                    Resources
                  </SmoothScrollLink>
                </div>
              </div>
              
              <SmoothScrollLink href="/webhooks" className="text-sm font-medium hover:text-purple-600 transition-colors">
                Integration
              </SmoothScrollLink>
            </div>
            
            <div className="ml-6 pl-6 border-l">
              <SmoothScrollLink 
                href="/login" 
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Login / Register
              </SmoothScrollLink>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-700 hover:text-purple-600 focus:outline-none transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100 mt-4 border-t pt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col space-y-4 pb-5">
            <SmoothScrollLink 
              href="/" 
              className="text-sm font-medium py-2 hover:text-purple-600 transition-colors"
            >
              Home
            </SmoothScrollLink>
            
            <SmoothScrollLink 
              href="/mainframe" 
              className="text-sm font-medium py-2 hover:text-purple-600 transition-colors"
            >
              For Organizations
            </SmoothScrollLink>
            
            <div className="border-b border-gray-100 py-1">
              <button 
                onClick={() => toggleDropdown('security')}
                className="flex items-center justify-between w-full text-sm font-medium py-2 hover:text-purple-600 transition-colors"
              >
                <span>Security Features</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${dropdowns.security ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`pl-4 space-y-2 overflow-hidden transition-all duration-200 ${
                dropdowns.security ? 'max-h-56 mt-2 mb-3' : 'max-h-0'
              }`}>
                <SmoothScrollLink href="/demo" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Demo
                </SmoothScrollLink>
                <SmoothScrollLink href="/individual-id" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Individual ID
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Authentication
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Data Protection
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Risk Management
                </SmoothScrollLink>
              </div>
            </div>
            
            <div className="border-b border-gray-100 py-1">
              <button 
                onClick={() => toggleDropdown('accessibility')}
                className="flex items-center justify-between w-full text-sm font-medium py-2 hover:text-purple-600 transition-colors"
              >
                <span>Accessibility</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${dropdowns.accessibility ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`pl-4 space-y-2 overflow-hidden transition-all duration-200 ${
                dropdowns.accessibility ? 'max-h-56 mt-2 mb-3' : 'max-h-0'
              }`}>
                <SmoothScrollLink href="/accessibility" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Voice & Visual Guidance
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Accessibility Settings
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Resources
                </SmoothScrollLink>
              </div>
            </div>
            
            <SmoothScrollLink 
              href="/pricing" 
              className="text-sm font-medium py-2 hover:text-purple-600 transition-colors"
            >
              Pricing
            </SmoothScrollLink>
            
            <div className="border-b border-gray-100 py-1">
              <button 
                onClick={() => toggleDropdown('community')}
                className="flex items-center justify-between w-full text-sm font-medium py-2 hover:text-purple-600 transition-colors"
              >
                <span>Community</span>
                <ChevronDown className={`h-4 w-4 transform transition-transform ${dropdowns.community ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`pl-4 space-y-2 overflow-hidden transition-all duration-200 ${
                dropdowns.community ? 'max-h-56 mt-2 mb-3' : 'max-h-0'
              }`}>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Directory
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Events
                </SmoothScrollLink>
                <SmoothScrollLink href="#" className="block py-1 text-sm hover:text-purple-600 transition-colors">
                  Resources
                </SmoothScrollLink>
              </div>
            </div>
            
            <SmoothScrollLink 
              href="/webhooks" 
              className="text-sm font-medium py-2 hover:text-purple-600 transition-colors"
            >
              Integration
            </SmoothScrollLink>
            
            <div className="pt-4">
              <SmoothScrollLink 
                href="/login" 
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Login / Register
              </SmoothScrollLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-800 text-white border-t border-gray-700 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium mb-4">NegraRosa Security</h3>
            <p className="text-sm text-gray-300 mb-4">
              Deaf-first security framework empowering organizations with accessible, 
              powerful security solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/"><span className="text-sm text-gray-300 hover:text-white">Home</span></Link></li>
              <li><Link href="/accessibility"><span className="text-sm text-gray-300 hover:text-white">Accessibility</span></Link></li>
              <li><Link href="/individual-id"><span className="text-sm text-gray-300 hover:text-white">Individual ID</span></Link></li>
              <li><Link href="/demo"><span className="text-sm text-gray-300 hover:text-white">Demo</span></Link></li>
              <li><Link href="/login"><span className="text-sm text-gray-300 hover:text-white">Login/Register</span></Link></li>
              <li><Link href="/sitemap"><span className="text-sm text-gray-300 hover:text-white">Sitemap</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Security Guide</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">ASL Resources</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Help Center</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Cookies Policy</a></li>
              <li><a href="#" className="text-sm text-gray-300 hover:text-white">Accessibility Statement</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-700 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <div>
            © {new Date().getFullYear()} MBTQ UNIVERSE. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0">
            Designed with accessibility as our priority.
          </div>
        </div>
      </div>
    </footer>
  );
}

function Router({ initialUserId }: { initialUserId: number }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <MainNav />
      <main className="flex-1">
        <Switch>
          <Route path="/">
            <Dashboard userId={initialUserId} />
          </Route>
          <Route path="/mainframe">
            <MainframeDashboard userId={initialUserId} />
          </Route>
          <Route path="/webhooks">
            <WebhookManagement />
          </Route>
          <Route path="/accessibility">
            <AccessibilityPage />
          </Route>
          <Route path="/pricing">
            <PricingPage />
          </Route>
          <Route path="/individual-id">
            <IndividualIdPage />
          </Route>
          <Route path="/demo">
            <div className="container mx-auto py-8">
              <h1 className="text-3xl font-bold mb-6">Interactive Demo</h1>
              <p className="text-muted-foreground mb-8">
                Experience the power of NegraRosa Security with our interactive demos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-medium mb-2">User Experience Demo</h3>
                  <p className="text-muted-foreground mb-4">
                    See how verification works from the user's perspective
                  </p>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    Try Demo
                  </button>
                </div>
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-medium mb-2">Business Integration Demo</h3>
                  <p className="text-muted-foreground mb-4">
                    Explore how businesses can integrate our verification system
                  </p>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                    Try Demo
                  </button>
                </div>
              </div>
            </div>
          </Route>
          <Route path="/sitemap">
            <div className="container mx-auto py-8">
              <h1 className="text-3xl font-bold mb-6">NegraRosa Security Framework: Site Map</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Home</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">About NegraRosa</a></li>
                    <li><a href="#" className="text-primary hover:underline">Deaf-First Philosophy</a></li>
                    <li><a href="#" className="text-primary hover:underline">Security Approach</a></li>
                    <li><a href="#" className="text-primary hover:underline">How It Works</a></li>
                  </ul>
                  <h3 className="text-lg font-medium mt-6 mb-3 border-b pb-2">For Organizations</h3>
                  <ul className="space-y-2">
                    <li><a href="/login" className="text-primary hover:underline">Organization Portal</a></li>
                    <li><a href="#" className="text-primary hover:underline">Organization Setup</a></li>
                    <li><a href="#" className="text-primary hover:underline">Security Assessment</a></li>
                    <li><a href="#" className="text-primary hover:underline">Team Management</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Security Features</h3>
                  <ul className="space-y-2">
                    <li><a href="/individual-id" className="text-primary hover:underline">Individual ID System</a></li>
                    <li><a href="#" className="text-primary hover:underline">Authentication</a></li>
                    <li><a href="#" className="text-primary hover:underline">Data Protection</a></li>
                    <li><a href="#" className="text-primary hover:underline">Risk Management</a></li>
                    <li><a href="#" className="text-primary hover:underline">Vulnerability Scanning</a></li>
                    <li><a href="#" className="text-primary hover:underline">Fraud Detection</a></li>
                  </ul>
                  <h3 className="text-lg font-medium mt-6 mb-3 border-b pb-2">Accessibility Center</h3>
                  <ul className="space-y-2">
                    <li><a href="/accessibility" className="text-primary hover:underline">Voice & Visual Guidance</a></li>
                    <li><a href="#" className="text-primary hover:underline">Accessibility Settings</a></li>
                    <li><a href="#" className="text-primary hover:underline">Accessibility Resources</a></li>
                    <li><a href="#" className="text-primary hover:underline">ASL Security Glossary</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Training & Support</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">Visual Learning Center</a></li>
                    <li><a href="#" className="text-primary hover:underline">Team Training</a></li>
                    <li><a href="#" className="text-primary hover:underline">Support Resources</a></li>
                  </ul>
                  <h3 className="text-lg font-medium mt-6 mb-3 border-b pb-2">Security Achievement System</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">Badge Center</a></li>
                    <li><a href="#" className="text-primary hover:underline">Business Defender</a></li>
                    <li><a href="#" className="text-primary hover:underline">Data Protector</a></li>
                    <li><a href="#" className="text-primary hover:underline">Identity Innovator</a></li>
                  </ul>
                  <h3 className="text-lg font-medium mt-6 mb-3 border-b pb-2">Integration</h3>
                  <ul className="space-y-2">
                    <li><a href="/webhooks" className="text-primary hover:underline">Integration Hooks</a></li>
                    <li><a href="#" className="text-primary hover:underline">API Documentation</a></li>
                    <li><a href="#" className="text-primary hover:underline">Developer Resources</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </Route>
          <Route path="/login">
            <div className="container mx-auto py-8">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold mb-6">Login or Register</h1>
                <div className="bg-card border rounded-lg p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border rounded-md" 
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Password</label>
                      <input 
                        type="password" 
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <button className="w-full bg-primary text-primary-foreground p-2 rounded-md">
                      Login
                    </button>
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">
                        Don't have an account? <a href="#" className="text-primary hover:underline">Register</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

interface AppProps {
  initialUserId: number;
}

function App({ initialUserId }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Router initialUserId={initialUserId} />
      <ScrollToTop showBelow={250} />
      <PinkSyncWidget />
      <SupportBubble 
        onASLRequest={() => {
          console.log("ASL support requested");
          // TODO: Implement ASL support request functionality
        }}
        onVideoChat={() => {
          console.log("Video chat requested");
          // TODO: Implement video chat functionality
        }}
        onTextChat={() => {
          console.log("Text chat requested");
          // TODO: Implement text chat functionality
        }}
      />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
