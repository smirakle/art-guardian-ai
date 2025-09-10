import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/blockchain/config'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import MaintenanceMode from "@/components/MaintenanceMode";
import { useMaintenanceMode } from "@/lib/maintenance";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { BlockchainProvider } from "@/contexts/BlockchainContext";
import SecurityHeaders from "@/components/security/SecurityHeaders";
import Index from "./pages/Index";
import AboutTsmo from "./pages/AboutTsmo";
import FAQ from "./pages/FAQ";
import Upload from "./pages/Upload";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import DeepWebScan from "./components/DeepWebScan";
import BlockchainVerification from "./components/BlockchainVerification";
import Community from "./pages/Community";
import Certificate from "./pages/Certificate";
import Lawyers from "./pages/Lawyers";
import DeepfakeDetection from "./pages/DeepfakeDetection";
import DeepfakeMatchDetails from "./pages/DeepfakeMatchDetails";
import LegalTemplatesPage from "./pages/LegalTemplates";
import Pricing from "./pages/Pricing";
import SLAStatus from "./pages/SLAStatus";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AIProtectionSettings from "./pages/AIProtectionSettings";
import AITrainingProtection from "./pages/AITrainingProtection";
import Phase1Dashboard from "./pages/Phase1Dashboard";
import Phase2Dashboard from "./pages/Phase2Dashboard";
import Phase3Dashboard from "./pages/Phase3Dashboard";
import { CustomIntegrations } from "./components/CustomIntegrations";
import { EnterpriseAPIAccess } from "./components/EnterpriseAPIAccess";
import ProfileMonitoring from "./pages/ProfileMonitoring";
import PortfolioMonitoring from "./pages/PortfolioMonitoring";
import TrademarkMonitoring from "./pages/TrademarkMonitoring";
import InvestorHub from "./pages/InvestorHub";
import Roadmap from "./pages/Roadmap";
import CreatorMarkets from "./pages/CreatorMarkets";
import ForgeryDetection from "./pages/ForgeryDetection";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import AttorneyPacket from "./pages/AttorneyPacket";
import { PartnerPricingManager } from "./components/partner/PartnerPricingManager";
import { PartnerSuccessPage } from "./components/partner/PartnerSuccessPage";
import EmailMarketing from "./pages/EmailMarketing";
import TaxManagement from "./pages/TaxManagement";
import GetApp from "./pages/GetApp";
import DMCACenter from "./pages/DMCACenter";
import USPTOPatentGenerator from "./components/patent/USPTOPatentGenerator";
import { CopyrightFooter } from "./components/CopyrightFooter";

const queryClient = new QueryClient();

const App = () => {
  // Use shared maintenance mode state
  const { isMaintenanceMode } = useMaintenanceMode();

  // If maintenance mode is enabled, show only the maintenance page
  if (isMaintenanceMode) {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <MaintenanceMode />
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  // Normal app when maintenance mode is disabled
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <BlockchainProvider>
            <SecurityHeaders />
            <Toaster />
            <Sonner />
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1 flex flex-col">
                  <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur-sm">
                    <SidebarTrigger className="ml-4" />
                  </header>
                   <div className="p-4 flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/about-tsmo" element={<AboutTsmo />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <Admin />
                        </ProtectedRoute>
                      } />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/success" element={<Success />} />
                      <Route path="/deep-scan" element={<DeepWebScan />} />
                      <Route path="/blockchain" element={<BlockchainVerification />} />
                      <Route path="/community" element={<Community />} />
                     <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
                     <Route path="/deepfake-match/:matchId" element={<DeepfakeMatchDetails />} />
                      <Route path="/lawyers" element={<Lawyers />} />
                      <Route path="/legal-templates" element={<LegalTemplatesPage />} />
                       <Route path="/pricing" element={<Pricing />} />
                       <Route path="/sla-status" element={<SLAStatus />} />
                           <Route path="/ai-protection-settings" element={<AIProtectionSettings />} />
                           <Route path="/ai-training-protection" element={<AITrainingProtection />} />
                           <Route path="/phase1" element={<Phase1Dashboard />} />
                           <Route path="/phase2" element={<Phase2Dashboard />} />
                           <Route path="/phase3" element={<Phase3Dashboard />} />
                        <Route path="/custom-integrations" element={<CustomIntegrations />} />
                        <Route path="/enterprise-api" element={<EnterpriseAPIAccess />} />
            <Route path="/profile-monitoring" element={<ProfileMonitoring />} />
            <Route path="/portfolio-monitoring" element={<PortfolioMonitoring />} />
            <Route path="/trademark-monitoring" element={<TrademarkMonitoring />} />
            <Route path="/markets" element={<CreatorMarkets />} />
            <Route path="/investors" element={<InvestorHub />} />
            <Route path="/partner-pricing" element={<PartnerPricingManager />} />
            <Route path="/partner-success" element={<PartnerSuccessPage />} />
            <Route path="/forgery-detection" element={<ForgeryDetection />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />
            <Route path="/attorney-packet" element={
              <ProtectedRoute requiredRole="admin">
                <AttorneyPacket />
              </ProtectedRoute>
            } />
            <Route path="/email-marketing" element={
              <ProtectedRoute requiredRole="admin">
                <EmailMarketing />
              </ProtectedRoute>
            } />
            <Route path="/tax-management" element={
              <ProtectedRoute requiredRole="admin">
                <TaxManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/get-app" element={<GetApp />} />
            <Route path="/dmca-center" element={<DMCACenter />} />
            <Route path="/patent-generator" element={
              <ProtectedRoute requiredRole="admin">
                <USPTOPatentGenerator />
              </ProtectedRoute>
            } />
            <Route path="/certificate/:certificateId" element={<Certificate />} />
                       {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                       <Route path="*" element={<NotFound />} />
                    </Routes>
                   </div>
                   <CopyrightFooter />
                </main>
              </div>
            </SidebarProvider>
              </BlockchainProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
      </WagmiProvider>
  );
};

export default App;