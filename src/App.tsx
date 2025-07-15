import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MaintenanceMode from "@/components/MaintenanceMode";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { useMaintenanceMode } from "@/lib/maintenance";
import Index from "./pages/Index";
import AboutTsmo from "./pages/AboutTsmo";
import Upload from "./pages/Upload";
import Monitoring from "./pages/Monitoring";
import Demo from "./pages/Demo";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import DeepWebScan from "./components/DeepWebScan";
import BlockchainVerification from "./components/BlockchainVerification";
import Community from "./pages/Community";
import Certificate from "./pages/Certificate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Use shared maintenance mode state
  const { isMaintenanceMode } = useMaintenanceMode();

  // If maintenance mode is enabled, show only the maintenance page
  if (isMaintenanceMode) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <MaintenanceMode />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Normal app when maintenance mode is disabled
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navigation />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about-tsmo" element={<AboutTsmo />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                } />
                <Route path="/monitoring" element={
                  <ProtectedRoute>
                    <Monitoring />
                  </ProtectedRoute>
                } />
                <Route path="/demo" element={<Demo />} />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/success" element={<Success />} />
                <Route path="/deep-scan" element={
                  <ProtectedRoute>
                    <DeepWebScan />
                  </ProtectedRoute>
                } />
                <Route path="/blockchain" element={
                  <ProtectedRoute>
                    <BlockchainVerification />
                  </ProtectedRoute>
                } />
                <Route path="/community" element={<Community />} />
                <Route path="/certificate/:certificateId" element={<Certificate />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
