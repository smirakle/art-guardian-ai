import type { CapacitorConfig } from '@capacitor/cli';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'app.lovable.cb68a1a443e7440d92e13e847b6930e8',
  appName: 'TSMO - AI Art Protection',
  webDir: 'dist',
  server: isDevelopment ? {
    url: 'https://cb68a1a4-43e7-440d-92e1-3e847b6930e8.lovableproject.com?forceHideBadge=true',
    cleartext: true
  } : undefined,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#3b82f6",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    }
  }
};

export default config;