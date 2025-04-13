import { Switch, Route, useLocation, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import WebhookManagement from "@/pages/WebhookManagement";

function MainNav() {
  return (
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg font-semibold">NegraRosa Security</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <span className="text-sm font-medium hover:underline cursor-pointer">Dashboard</span>
            </Link>
            <Link href="/webhooks">
              <span className="text-sm font-medium hover:underline cursor-pointer">Webhook Management</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
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
          <Route path="/webhooks">
            <WebhookManagement />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
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
