import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import MainframeDashboard from "@/pages/MainframeDashboard";
import WebhookManagement from "@/pages/WebhookManagement";

function MainNav() {
  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg font-semibold">NegraRosa Security</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/">
              <span className="text-sm font-medium hover:underline cursor-pointer">Dashboard</span>
            </Link>
            <Link href="/mainframe">
              <span className="text-sm font-medium hover:underline cursor-pointer">Deaf-First Platform</span>
            </Link>
            <Link href="/demo">
              <span className="text-sm font-medium hover:underline cursor-pointer">Demo</span>
            </Link>
            <Link href="/webhooks">
              <span className="text-sm font-medium hover:underline cursor-pointer">Integration Hooks</span>
            </Link>
            <Link href="/login">
              <span className="text-sm font-medium hover:underline cursor-pointer">Login / Register</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} MBTQ UNIVERSE. All rights reserved.
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/sitemap">
              <span className="text-sm text-gray-600 hover:text-primary hover:underline cursor-pointer">Sitemap</span>
            </Link>
            <a href="#" className="text-sm text-gray-600 hover:text-primary hover:underline">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-primary hover:underline">Terms of Service</a>
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
              <h1 className="text-3xl font-bold mb-6">Sitemap</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Features</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">Authentication System</a></li>
                    <li><a href="#" className="text-primary hover:underline">Reputation Stats</a></li>
                    <li><a href="#" className="text-primary hover:underline">Risk Rates</a></li>
                    <li><a href="#" className="text-primary hover:underline">Fraud Detection</a></li>
                    <li><a href="#" className="text-primary hover:underline">E&O Protection</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Integration</h3>
                  <ul className="space-y-2">
                    <li><a href="/webhooks" className="text-primary hover:underline">Integration Hooks</a></li>
                    <li><a href="#" className="text-primary hover:underline">API Documentation</a></li>
                    <li><a href="#" className="text-primary hover:underline">Developer Resources</a></li>
                    <li><a href="#" className="text-primary hover:underline">Use Cases</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Company</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-primary hover:underline">About Us</a></li>
                    <li><a href="#" className="text-primary hover:underline">Contact</a></li>
                    <li><a href="#" className="text-primary hover:underline">Privacy Policy</a></li>
                    <li><a href="#" className="text-primary hover:underline">Terms of Service</a></li>
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
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
