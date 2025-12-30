import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/Navigation";
import { useEffect } from "react";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import OrderTracking from "@/pages/OrderTracking";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EmployeeDashboard from "@/pages/admin/EmployeeDashboard";
import About from "@/pages/About";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  // Simple scroll to top on route change emulation if needed, 
  // but wouter doesn't have a native one.
  return null;
}

// Navigation performance logging
function Router() {
  const [location] = useLocation();

  useEffect(() => {
    // Only log if enabled
    const isEnabled = typeof window !== 'undefined' && localStorage.getItem('ENABLE_PERFORMANCE_LOGGING') === 'true';
    if (isEnabled) {
      console.log(`[PERF] Navigated to ${location} at ${new Date().toISOString()}`);
    }
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/products/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders/:id/confirmation" component={OrderConfirmation} />
      <Route path="/orders/:id" component={OrderTracking} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/employee" component={EmployeeDashboard} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-background min-h-screen text-foreground font-sans">
        <Navigation />
        <Router />
        <Toaster />

        {/* Minimal Footer */}
        <footer className="border-t border-border py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold mb-6">URBANTURBAN</h2>
            <div className="flex justify-center gap-8 text-sm font-medium text-muted-foreground mb-8">
              <a href="https://instagram.com/urbanturban" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Instagram</a>
              <a href="https://twitter.com/urbanturban" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">Twitter</a>
              <a href="mailto:connect@urbanturban.com" className="hover:text-foreground">Connect</a>
            </div>
            <p className="text-xs text-muted-foreground/50">
              © {new Date().getFullYear()} UrbanTurban. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
