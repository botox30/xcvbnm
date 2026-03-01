import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Components
import { Navbar } from "@/components/layout/Navbar";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/AuthPage";

// Pages
import Home from "@/pages/Home";
import Market from "@/pages/Market";
import Official from "@/pages/Official";
import CreateTicket from "@/pages/CreateTicket";
import Checkout from "@/pages/Checkout";
import AdminPanel from "@/pages/AdminPanel";

function ProtectedRoute({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Route path={path} component={Component} />;
}

function Router() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black selection:bg-accent/30 selection:text-white">
      {/* Global Background gradient for non-hero pages */}
      <div className="fixed inset-0 z-[-2] bg-gradient-to-br from-black via-zinc-900 to-black pointer-events-none" />
      
      <Navbar />
      
      <main>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/market" component={Market} />
          <Route path="/official" component={Official} />
          <ProtectedRoute path="/sell" component={CreateTicket} />
          <ProtectedRoute path="/checkout/:id" component={Checkout} />
          <ProtectedRoute path="/admin" component={AdminPanel} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
