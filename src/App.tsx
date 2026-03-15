import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useRealUserMonitoring } from "@/hooks/useRealUserMonitoring";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { GuestUploadConverter } from "@/components/GuestUploadConverter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import MaintenanceMode from "@/components/MaintenanceMode";
import { useMaintenanceMode } from "@/lib/maintenance";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { UserPreferencesProvider } from "@/contexts/UserPreferencesContext";
import SecurityHeaders from "@/components/security/SecurityHeaders";

// Core pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import MonitoringHub from "./pages/MonitoringHub";
import SimpleFindings from "./pages/SimpleFindings";
import DMCACenter from "./pages/DMCACenter";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Public pages
import AboutTsmo from "./pages/AboutTsmo";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import TermsAndPrivacy from "./pages/TermsAndPrivacy";
import RefundPolicy from "./pages/RefundPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ProtectPhotos from "./pages/ProtectPhotos";
import StopArtTheft from "./pages/StopArtTheft";
import SuccessStories from "./pages/SuccessStories";
import GetApp from "./pages/GetApp";
import ProtectionGuide from "./pages/ProtectionGuide";
import PressKit from "./pages/PressKit";
import Status from "./pages/Status";
import Support from "./pages/Support";

// Feature pages
import ProtectionHub from "./pages/ProtectionHub";
import DeepfakeDetection from "./pages/DeepfakeDetection";
import DeepfakeMatchDetails from "./pages/DeepfakeMatchDetails";
import ForgeryDetection from "./pages/ForgeryDetection";
import LegalTemplatesPage from "./pages/LegalTemplates";
import LegalResources from "./pages/LegalResources";
import Certificate from "./pages/Certificate";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Community from "./pages/Community";
import ReverseImageSearch from "./pages/ReverseImageSearch";
import DocumentProtection from "./pages/DocumentProtection";
import Findings from "./pages/Findings";
import B2BLogin from "./pages/B2BLogin";
import Lawyers from "./pages/Lawyers";
import AITPAAnalysis from "./pages/AITPAAnalysis";
import ThreatAlerts from "./pages/ThreatAlerts";
import DMCAAutomation from "./pages/DMCAAutomation";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import MobileIntegration from "./pages/MobileIntegration";
import SLAStatus from "./pages/SLAStatus";
import CreatorMarkets from "./pages/CreatorMarkets";
import InvestorHub from "./pages/InvestorHub";
import DeepWebScan from "./components/DeepWebScan";
import { EnterpriseAPIAccess } from "./components/EnterpriseAPIAccess";
import { AIProtectionVisualDemo } from "./components/demo/AIProtectionVisualDemo";

// Admin pages
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminMonitoring from "./pages/AdminMonitoring";
import IncidentManagement from "./pages/IncidentManagement";
import MonitoringTest from "./pages/MonitoringTest";
import ExternalServicesConfig from "./pages/ExternalServicesConfig";
import ProductionDashboard from "./components/production/ProductionDashboard";
import AttorneyPacket from "./pages/AttorneyPacket";
import EmailMarketing from "./pages/EmailMarketing";
import TaxManagement from "./pages/TaxManagement";
import MarketingFlyer from "./pages/MarketingFlyer";
import BlogManagementPage from "./pages/BlogManagementPage";
import PartnershipsOverview from "./pages/PartnershipsOverview";
import C2PAConformance from "./pages/admin/C2PAConformance";

import { CopyrightFooter } from "./components/CopyrightFooter";
import SmartOnboarding from "./components/smart-onboarding/SmartOnboarding";
import { HelpWidget } from "./components/customer-success/HelpWidget";
import { RealTimeNotifications } from "./components/customer-success/RealTimeNotifications";
import PublicNavbar from "./components/PublicNavbar";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    {/* Landing */}
    <Route path="/" element={<Index />} />

    {/* Core app routes */}
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/upload" element={<Upload />} />
    <Route path="/monitoring-hub" element={<MonitoringHub />} />
    <Route path="/simple-findings" element={<SimpleFindings />} />
    <Route path="/findings" element={<Findings />} />
    <Route path="/dmca-center" element={<DMCACenter />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/success" element={<Success />} />

    {/* Feature pages */}
    <Route path="/protection-hub" element={<ProtectionHub />} />
    <Route path="/deepfake-detection" element={<DeepfakeDetection />} />
    <Route path="/deepfake-match/:matchId" element={<DeepfakeMatchDetails />} />
    <Route path="/forgery-detection" element={<ForgeryDetection />} />
    <Route path="/legal-resources" element={<LegalResources />} />
    <Route path="/legal-templates" element={<LegalTemplatesPage />} />
    <Route path="/lawyers" element={<Lawyers />} />
    <Route path="/community" element={<Community />} />
    <Route path="/certificate/:certificateId" element={<Certificate />} />
    <Route path="/document-protection" element={<DocumentProtection />} />
    <Route path="/reverse-image-search" element={<ReverseImageSearch />} />
    <Route path="/aitpa-analysis" element={<AITPAAnalysis />} />
    <Route path="/threat-alerts" element={<ThreatAlerts />} />
    <Route path="/dmca-automation" element={<DMCAAutomation />} />
    <Route path="/analytics" element={<AdvancedAnalytics />} />
    <Route path="/portfolio-monitoring-advanced" element={<Navigate to="/monitoring-hub" replace />} />
    <Route path="/deep-scan" element={<DeepWebScan />} />
    <Route path="/mobile" element={<MobileIntegration />} />
    <Route path="/sla-status" element={<SLAStatus />} />
    <Route path="/markets" element={<CreatorMarkets />} />
    <Route path="/investors" element={<InvestorHub />} />
    <Route path="/enterprise-api" element={<EnterpriseAPIAccess />} />
    <Route path="/b2b-login" element={<B2BLogin />} />

    {/* Public / marketing pages */}
    <Route path="/about-tsmo" element={<AboutTsmo />} />
    <Route path="/faq" element={<FAQ />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/terms-and-privacy" element={<TermsAndPrivacy />} />
    <Route path="/refund-policy" element={<RefundPolicy />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/get-app" element={<GetApp />} />
    <Route path="/status" element={<Status />} />
    <Route path="/support" element={<Support />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/success-stories" element={<SuccessStories />} />
    <Route path="/protect-photos" element={<ProtectPhotos />} />
    <Route path="/stop-art-theft" element={<StopArtTheft />} />
    <Route path="/protection-guide" element={<ProtectionGuide />} />
    <Route path="/press-kit" element={<PressKit />} />
    <Route path="/demo/visual" element={<AIProtectionVisualDemo />} />

    {/* Redirects for consolidated routes */}
    <Route path="/phase1" element={<Navigate to="/dashboard" replace />} />
    <Route path="/phase2" element={<Navigate to="/dashboard" replace />} />
    <Route path="/phase3" element={<Navigate to="/dashboard" replace />} />
    <Route path="/ai-protection" element={<Navigate to="/protection-hub" replace />} />
    <Route path="/ai-protection-settings" element={<Navigate to="/protection-hub" replace />} />
    <Route path="/ai-training-protection" element={<Navigate to="/protection-hub" replace />} />
    <Route path="/profile-monitoring" element={<Navigate to="/monitoring-hub" replace />} />
    <Route path="/portfolio-monitoring" element={<Navigate to="/monitoring-hub" replace />} />
    <Route path="/trademark-monitoring" element={<Navigate to="/monitoring-hub" replace />} />

    {/* Admin routes */}
    <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
    <Route path="/production" element={<ProtectedRoute requiredRole="admin"><ProductionDashboard /></ProtectedRoute>} />
    <Route path="/attorney-packet" element={<ProtectedRoute requiredRole="admin"><AttorneyPacket /></ProtectedRoute>} />
    <Route path="/email-marketing" element={<ProtectedRoute requiredRole="admin"><EmailMarketing /></ProtectedRoute>} />
    <Route path="/tax-management" element={<ProtectedRoute requiredRole="admin"><TaxManagement /></ProtectedRoute>} />
    <Route path="/marketing-flyer" element={<ProtectedRoute requiredRole="admin"><MarketingFlyer /></ProtectedRoute>} />
    <Route path="/blog-management" element={<ProtectedRoute requiredRole="admin"><BlogManagementPage /></ProtectedRoute>} />
    <Route path="/admin/monitoring" element={<ProtectedRoute requiredRole="admin"><AdminMonitoring /></ProtectedRoute>} />
    <Route path="/admin/incidents" element={<ProtectedRoute requiredRole="admin"><IncidentManagement /></ProtectedRoute>} />
    <Route path="/admin/c2pa-conformance" element={<ProtectedRoute requiredRole="admin"><C2PAConformance /></ProtectedRoute>} />
    <Route path="/admin/partnerships" element={<ProtectedRoute requiredRole="admin"><PartnershipsOverview /></ProtectedRoute>} />
    <Route path="/monitoring/realtime" element={<Navigate to="/monitoring-hub" replace />} />
    <Route path="/monitoring/test" element={<ProtectedRoute requiredRole="admin"><MonitoringTest /></ProtectedRoute>} />
    <Route path="/monitoring/external-services" element={<ProtectedRoute requiredRole="admin"><ExternalServicesConfig /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const AuthenticatedLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="h-12 flex items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4">
            <SidebarTrigger />
            <RealTimeNotifications />
          </header>
          <div className="p-4 flex-1">
            <AppRoutes />
          </div>
          <CopyrightFooter />
        </main>
      </div>
    </SidebarProvider>
  );
};

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <PublicNavbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <CopyrightFooter />
    </div>
  );
};

const AppLayout = () => {
  const { user } = useAuth();
  
  if (user) {
    return <AuthenticatedLayout />;
  }
  
  return <PublicLayout />;
};

const App = () => {
  const { isMaintenanceMode } = useMaintenanceMode();
  const { trackUserAction } = useRealUserMonitoring();
  useVisitorTracking();

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

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserPreferencesProvider>
          <SecurityHeaders />
          <GuestUploadConverter />
          <Toaster />
          <Sonner />
          <SmartOnboarding />
          <HelpWidget />
          <AppLayout />
        </UserPreferencesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
