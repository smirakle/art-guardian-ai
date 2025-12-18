import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/blockchain/config'
import { useRealUserMonitoring } from "@/hooks/useRealUserMonitoring";
import { GuestUploadConverter } from "@/components/GuestUploadConverter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import MaintenanceMode from "@/components/MaintenanceMode";
import { useMaintenanceMode } from "@/lib/maintenance";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
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
import B2BLogin from "./pages/B2BLogin";
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
import ProtectionHub from "./pages/ProtectionHub";
import MonitoringHub from "./pages/MonitoringHub";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import Status from "./pages/Status";
import AdminMonitoring from "./pages/AdminMonitoring";
import IncidentManagement from "./pages/IncidentManagement";
import RealTimeMonitoringDashboard from "./pages/RealTimeMonitoringDashboard";
import MonitoringTest from "./pages/MonitoringTest";
import ExternalServicesConfig from "./pages/ExternalServicesConfig";
import TestRealtimeMonitoring from "./pages/TestRealtimeMonitoring";

import CustomIntegrationsComingSoon from "./pages/CustomIntegrationsComingSoon";
import { EnterpriseAPIAccess } from "./components/EnterpriseAPIAccess";
import Wallet from "./pages/Wallet";
// Legacy routes maintained for backward compatibility
import InvestorHub from "./pages/InvestorHub";
import Roadmap from "./pages/Roadmap";
import CreatorMarkets from "./pages/CreatorMarkets";
import ForgeryDetection from "./pages/ForgeryDetection";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import AttorneyPacket from "./pages/AttorneyPacket";
import ProductionDashboard from "./components/production/ProductionDashboard";
import { PartnerPricingManager } from "./components/partner/PartnerPricingManager";
import { PartnerSuccessPage } from "./components/partner/PartnerSuccessPage";
import EmailMarketing from "./pages/EmailMarketing";
import TaxManagement from "./pages/TaxManagement";
import GetApp from "./pages/GetApp";
import DMCACenter from "./pages/DMCACenter";

import { CopyrightFooter } from "./components/CopyrightFooter";
import SmartOnboarding from "./components/smart-onboarding/SmartOnboarding";
import { HelpWidget } from "./components/customer-success/HelpWidget";
import { RealTimeNotifications } from "./components/customer-success/RealTimeNotifications";
import MobileIntegration from "./pages/MobileIntegration";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import MarketingFlyer from "./pages/MarketingFlyer";
import DocumentProtection from "./pages/DocumentProtection";
import PortfolioMonitoringAdvanced from "./pages/PortfolioMonitoringAdvanced";
import PromoMaterials from "./pages/PromoMaterials";
import ThreatAlerts from "./pages/ThreatAlerts";
import DMCAAutomation from "./pages/DMCAAutomation";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AITPAAnalysis from "./pages/AITPAAnalysis";
import { AIProtectionVisualDemo } from "./components/demo/AIProtectionVisualDemo";
import ProtectionGuide from "./pages/ProtectionGuide";
import PressKit from "./pages/PressKit";
import Findings from "./pages/Findings";

const queryClient = new QueryClient();

const App = () => {
  // Use shared maintenance mode state
  const { isMaintenanceMode } = useMaintenanceMode();
  
  // Activate Real User Monitoring for all pages
  const { trackUserAction } = useRealUserMonitoring();

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
          <UserPreferencesProvider>
            <BlockchainProvider>
              <SecurityHeaders />
              <GuestUploadConverter />
            <Toaster />
            <Sonner />
            <SmartOnboarding />
            <HelpWidget />
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <main className="flex-1 flex flex-col">
                  <header className="h-12 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4">
                    <SidebarTrigger />
                    <RealTimeNotifications />
                  </header>
                   <div className="p-4 flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/about-tsmo" element={<AboutTsmo />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/b2b-login" element={<B2BLogin />} />
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
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="/community" element={<Community />} />
                     <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
                     <Route path="/deepfake-match/:matchId" element={<DeepfakeMatchDetails />} />
                      <Route path="/lawyers" element={<Lawyers />} />
                      <Route path="/legal-templates" element={<LegalTemplatesPage />} />
                       <Route path="/pricing" element={<Pricing />} />
                       <Route path="/sla-status" element={<SLAStatus />} />
                            <Route path="/protection-hub" element={<ProtectionHub />} />
                            <Route path="/monitoring-hub" element={<MonitoringHub />} />
                            <Route path="/findings" element={<Findings />} />
                            
                            {/* Legacy redirects */}
                            <Route path="/ai-protection" element={<ProtectionHub />} />
                            <Route path="/ai-protection-settings" element={<ProtectionHub />} />
                            <Route path="/ai-training-protection" element={<ProtectionHub />} />
                            <Route path="/phase1" element={<UnifiedDashboard />} />
                            <Route path="/phase2" element={<UnifiedDashboard />} />
                            <Route path="/phase3" element={<UnifiedDashboard />} />
                         <Route path="/custom-integrations" element={<CustomIntegrationsComingSoon />} />
                        
                        <Route path="/enterprise-api" element={<EnterpriseAPIAccess />} />
            {/* Legacy monitoring routes redirect to unified hub */}
            <Route path="/profile-monitoring" element={<MonitoringHub />} />
            <Route path="/portfolio-monitoring" element={<MonitoringHub />} />
            <Route path="/trademark-monitoring" element={<MonitoringHub />} />
            <Route path="/markets" element={<CreatorMarkets />} />
            <Route path="/investors" element={<InvestorHub />} />
            <Route path="/partner-pricing" element={<PartnerPricingManager />} />
            <Route path="/production" element={
              <ProtectedRoute requiredRole="admin">
                <ProductionDashboard />
              </ProtectedRoute>
            } />
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
            <Route path="/certificate/:certificateId" element={<Certificate />} />
            <Route path="/mobile" element={<MobileIntegration />} />
            <Route path="/analytics" element={<AdvancedAnalytics />} />
            <Route path="/marketing-flyer" element={
              <ProtectedRoute requiredRole="admin">
                <MarketingFlyer />
              </ProtectedRoute>
            } />
            
            {/* Phase 3-6 Advanced Monitoring Features */}
            <Route path="/document-protection" element={<DocumentProtection />} />
            <Route path="/portfolio-monitoring-advanced" element={<PortfolioMonitoringAdvanced />} />
            <Route path="/threat-alerts" element={<ThreatAlerts />} />
            <Route path="/dmca-automation" element={<DMCAAutomation />} />
            <Route path="/aitpa-analysis" element={<AITPAAnalysis />} />
            <Route path="/status" element={<Status />} />
            <Route path="/admin/monitoring" element={
              <ProtectedRoute requiredRole="admin">
                <AdminMonitoring />
              </ProtectedRoute>
            } />
            <Route path="/admin/incidents" element={
              <ProtectedRoute requiredRole="admin">
                <IncidentManagement />
              </ProtectedRoute>
            } />
            <Route path="/monitoring/realtime" element={
              <ProtectedRoute requiredRole="admin">
                <RealTimeMonitoringDashboard />
              </ProtectedRoute>
            } />
            <Route path="/monitoring/test" element={
              <ProtectedRoute requiredRole="admin">
                <MonitoringTest />
              </ProtectedRoute>
            } />
            <Route path="/monitoring/external-services" element={
              <ProtectedRoute requiredRole="admin">
                <ExternalServicesConfig />
              </ProtectedRoute>
            } />
            <Route path="/test-realtime" element={<TestRealtimeMonitoring />} />
            <Route path="/promo-materials" element={<PromoMaterials />} />
            <Route path="/demo/visual" element={<AIProtectionVisualDemo />} />
            <Route path="/protection-guide" element={<ProtectionGuide />} />
            <Route path="/press-kit" element={<PressKit />} />
            
                       {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                       <Route path="*" element={<NotFound />} />
                    </Routes>
                   </div>
                   <CopyrightFooter />
                </main>
               </div>
            </SidebarProvider>
            </BlockchainProvider>
          </UserPreferencesProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;