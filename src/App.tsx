import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import MaintenanceMode from "@/components/MaintenanceMode";
import { useMaintenanceMode } from "@/lib/maintenance";
import Index from "./pages/Index";
import AboutTsmo from "./pages/AboutTsmo";
import Upload from "./pages/Upload";

import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import DeepWebScan from "./components/DeepWebScan";
import VisualRecognition from "./components/VisualRecognition";
import MonitoringDashboard from "./components/MonitoringDashboard";
import RealTimeDeepfakeMonitor from "./components/RealTimeDeepfakeMonitor";
import { ComprehensiveWebScanner } from "./components/ComprehensiveWebScanner";
import BlockchainVerification from "./components/BlockchainVerification";
import Community from "./pages/Community";
import Certificate from "./pages/Certificate";
import Lawyers from "./pages/Lawyers";
import DeepfakeDetection from "./pages/DeepfakeDetection";
import DeepfakeMatchDetails from "./pages/DeepfakeMatchDetails";
import LegalTemplatesPage from "./pages/LegalTemplates";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Use shared maintenance mode state
  const { isMaintenanceMode } = useMaintenanceMode();

  // If maintenance mode is enabled, show only the maintenance page
  if (isMaintenanceMode) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <MaintenanceMode />
          </AuthProvider>
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
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                
                <main className="flex-1 flex flex-col">
                  {/* Top Bar */}
                  <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 sticky top-0 z-40">
                    <SidebarTrigger className="h-8 w-8" />
                    <div className="flex-1" />
                  </header>
                  
                  {/* Content Area */}
                  <div className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/about-tsmo" element={<AboutTsmo />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/success" element={<Success />} />
                      <Route path="/deep-scan" element={<DeepWebScan />} />
                      <Route path="/visual-recognition" element={<VisualRecognition />} />
                      <Route path="/monitoring" element={<MonitoringDashboard />} />
                      <Route path="/realtime-monitor" element={<RealTimeDeepfakeMonitor />} />
                      <Route path="/web-scanner" element={<ComprehensiveWebScanner />} />
                      <Route path="/blockchain" element={<BlockchainVerification />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
                      <Route path="/deepfake-match/:matchId" element={<DeepfakeMatchDetails />} />
                      <Route path="/lawyers" element={<Lawyers />} />
                      <Route path="/legal-templates" element={<LegalTemplatesPage />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/certificate/:certificateId" element={<Certificate />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
