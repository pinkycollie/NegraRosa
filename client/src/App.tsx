import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import MainframeDashboard from "@/pages/MainframeDashboard";
import WebhookManagement from "@/pages/WebhookManagement";
import AccessibilityPage from "@/pages/AccessibilityPage";
import PricingPage from "@/pages/PricingPage";
import SupportBubble from "@/components/SupportBubble";

function MainNav() {
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg font-semibold">NegraRosa Security</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center overflow-x-auto whitespace-nowrap space-x-6 py-2 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <Link href="/">
              <span className="text-sm font-medium hover:underline cursor-pointer">Home</span>
            </Link>
            <Link href="/mainframe">
              <span className="text-sm font-medium hover:underline cursor-pointer">For Organizations</span>
            </Link>
            <div className="relative group">
              <span className="text-sm font-medium cursor-pointer">Security Features</span>
              <div className="absolute hidden group-hover:block bg-background border border-border rounded shadow-lg p-2 z-10 w-48">
                <Link href="/demo">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Demo</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Authentication</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Data Protection</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Risk Management</span>
                </Link>
              </div>
            </div>
            <div className="relative group">
              <span className="text-sm font-medium cursor-pointer">Accessibility</span>
              <div className="absolute hidden group-hover:block bg-background border border-border rounded shadow-lg p-2 z-10 w-48">
                <Link href="/accessibility">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Voice & Visual Guidance</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Accessibility Settings</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Resources</span>
                </Link>
              </div>
            </div>
            <Link href="/pricing">
              <span className="text-sm font-medium hover:underline cursor-pointer">Pricing</span>
            </Link>
            <div className="relative group">
              <span className="text-sm font-medium cursor-pointer">Community</span>
              <div className="absolute hidden group-hover:block bg-background border border-border rounded shadow-lg p-2 z-10 w-48">
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Directory</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Events</span>
                </Link>
                <Link href="#">
                  <span className="block px-2 py-1 text-sm hover:bg-gray-100 rounded">Resources</span>
                </Link>
              </div>
            </div>
            <Link href="/webhooks">
              <span className="text-sm font-medium hover:underline cursor-pointer">Integration</span>
            </Link>
            <Link href="/login">
              <span className="text-sm font-medium hover:underline cursor-pointer">Login / Register</span>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu (hidden by default) */}
          <div className="lg:hidden hidden w-full mt-2 pt-2 border-t">
            <div className="flex flex-col space-y-3 pb-3">
              <Link href="/">
                <span className="text-sm font-medium hover:underline cursor-pointer">Home</span>
              </Link>
              <Link href="/mainframe">
                <span className="text-sm font-medium hover:underline cursor-pointer">For Organizations</span>
              </Link>
              <Link href="/pricing">
                <span className="text-sm font-medium hover:underline cursor-pointer">Pricing</span>
              </Link>
              <Link href="/webhooks">
                <span className="text-sm font-medium hover:underline cursor-pointer">Integration</span>
              </Link>
              <Link href="/login">
                <span className="text-sm font-medium hover:underline cursor-pointer">Login / Register</span>
              </Link>
              <details className="cursor-pointer">
                <summary className="text-sm font-medium">Security Features</summary>
                <div className="ml-4 mt-2 space-y-2">
                  <Link href="/demo">
                    <span className="block text-sm hover:underline">Demo</span>
                  </Link>
                  <Link href="#">
                    <span className="block text-sm hover:underline">Authentication</span>
                  </Link>
                  <Link href="#">
                    <span className="block text-sm hover:underline">Data Protection</span>
                  </Link>
                </div>
              </details>
              <details className="cursor-pointer">
                <summary className="text-sm font-medium">Accessibility</summary>
                <div className="ml-4 mt-2 space-y-2">
                  <Link href="/accessibility">
                    <span className="block text-sm hover:underline">Voice & Visual Guidance</span>
                  </Link>
                  <Link href="#">
                    <span className="block text-sm hover:underline">Settings</span>
                  </Link>
                </div>
              </details>
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
