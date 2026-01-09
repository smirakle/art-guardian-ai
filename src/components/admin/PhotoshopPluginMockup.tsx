import { useState } from "react";
import { 
  Eye, Lock, ChevronDown, ChevronRight, MoreHorizontal,
  Monitor, X, Menu, Plus, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Custom SVG Tool Icons matching real Photoshop
const ToolIcons = {
  move: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 0l2 3H9v4h4V6l3 2-3 2v-1H9v4h1l-2 3-2-3h1V9H3v1L0 8l3-2v1h4V3H6l2-3z"/>
    </svg>
  ),
  artboard: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M2 2h12v12H2V2zm1 1v10h10V3H3z"/>
      <path d="M0 5h2v1H0zM0 10h2v1H0zM14 5h2v1h-2zM14 10h2v1h-2zM5 0v2h1V0zM10 0v2h1V0zM5 14v2h1v-2zM10 14v2h1v-2z"/>
    </svg>
  ),
  marquee: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" className="w-4 h-4">
      <rect x="2" y="2" width="12" height="12" rx="0"/>
    </svg>
  ),
  lasso: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 1C4.5 1 2 4 2 7c0 2 1 3.5 2.5 4.5L3 15l3-2c.6.2 1.3.3 2 .3 4 0 7-3 7-6.5S12 1 8 1zm0 11c-.5 0-1-.1-1.5-.2l-1.5 1 1-2c-1.2-.8-2-2.2-2-3.8 0-2.8 2-5 4-5s4 2.2 4 5-2 5-4 5z"/>
    </svg>
  ),
  objectSelect: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M1 1v6h2V3h4V1H1zM15 1h-6v2h4v4h2V1zM1 15h6v-2H3v-4H1v6zM15 15v-6h-2v4h-4v2h6z"/>
      <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  quickSelect: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <circle cx="6" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1"/>
      <path d="M10 2l1 6 4-2-5 8V9l-3 1 3-8z"/>
    </svg>
  ),
  crop: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M0 4h4V0h2v4h8v2h-2v8h-2V6H4v6h6v2H4v4H2v-4H0V4zm12 2v8h2V6h-2z"/>
    </svg>
  ),
  frame: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="2" y="2" width="12" height="12" rx="1"/>
      <line x1="2" y1="5" x2="14" y2="5"/>
    </svg>
  ),
  eyedropper: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M13.5 1c-.8 0-1.6.3-2.1.9L10 3.3 8.7 2 7.3 3.4l1.3 1.3-5.9 5.9c-.5.5-.7 1.1-.7 1.7V15h2.7c.6 0 1.2-.3 1.7-.7l5.9-5.9 1.3 1.3 1.4-1.4-1.3-1.3 1.4-1.4c1.2-1.2 1.2-3.1 0-4.2-.6-.6-1.4-.9-2.1-.9zM4 13l5.5-5.5 1 1L5 14H4v-1z"/>
    </svg>
  ),
  spot: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 0C5.2 0 3 2.2 3 5c0 3 5 11 5 11s5-8 5-11c0-2.8-2.2-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
    </svg>
  ),
  brush: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M14.5.5c-.7-.7-1.9-.6-2.6.1L5.5 7c-.4-.2-.9-.2-1.4 0l-.9.4c-.4.2-.6.5-.7.9l-.4 2.1c0 .3-.2.6-.4.8L0 13l1 2 2 1 1.8-1.7c.2-.2.5-.4.8-.4l2.1-.4c.4-.1.7-.3.9-.7l.4-.9c.2-.5.2-1 0-1.4l6.4-6.4c.8-.7.9-1.9.1-2.6zM4.1 13.9L3 14l-.5-.5.1-1.1.6-.6.5.5-.6.6 1 1-.6.6-.4-.6z"/>
    </svg>
  ),
  stamp: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <ellipse cx="8" cy="4" rx="4" ry="3"/>
      <path d="M5 7v3H3v4h10v-4h-2V7H5zm1 5h4v1H6v-1z"/>
    </svg>
  ),
  historyBrush: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 1C4.7 1 2 3.7 2 7c0 1.5.6 2.9 1.5 4L2 12.5V15h2.5L6 13.5c1 .6 2.2 1 3.5 1 3.3 0 6-2.7 6-6s-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"/>
      <path d="M8 4v3l2 2"/>
    </svg>
  ),
  eraser: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M14.7 5.3l-4-4c-.4-.4-1-.4-1.4 0l-8 8c-.4.4-.4 1 0 1.4l3 3H1v2h14v-2h-5.6l5.3-5.3c.4-.4.4-1 0-1.4v.3zM5.4 14H3.6l-2-2L7 6.6 9.4 9 5.4 14z"/>
    </svg>
  ),
  gradient: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <rect x="1" y="4" width="14" height="8" rx="1" fill="url(#grad)"/>
    </svg>
  ),
  blur: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 1C6 1 4.5 3 4.5 5.5 4.5 8.5 8 15 8 15s3.5-6.5 3.5-9.5C11.5 3 10 1 8 1z"/>
    </svg>
  ),
  dodge: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <ellipse cx="8" cy="12" rx="6" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1v8M5 4h6"/>
    </svg>
  ),
  pen: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M10.5 1L4 12l-2 3 3-2L16 6.5 10.5 1zM5.5 11.5l-.7.7.7-.7zm7-7l-6 6-.7-.7 6-6 .7.7z"/>
    </svg>
  ),
  type: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M2 2v3h1V3h4v10H5v1h6v-1H9V3h4v2h1V2H2z"/>
    </svg>
  ),
  pathSelect: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M1 1l6 14 2-5 5-2L1 1z"/>
    </svg>
  ),
  directSelect: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M1 1l6 14 2-5 5-2L1 1z"/>
    </svg>
  ),
  rectangle: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <rect x="2" y="2" width="12" height="12" rx="1"/>
    </svg>
  ),
  hand: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M14 7V4c0-.6-.4-1-1-1s-1 .4-1 1v3h-1V2c0-.6-.4-1-1-1s-1 .4-1 1v5H8V1c0-.6-.4-1-1-1S6 .4 6 1v6H5V3c0-.6-.4-1-1-1s-1 .4-1 1v7c0 3.3 2.7 6 6 6h1c2.8 0 5-2.2 5-5V7c0-.6-.4-1-1-1s-1 .4-1 1z"/>
    </svg>
  ),
  rotate: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 1C4.7 1 2 3.7 2 7h2c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4v2c3.3 0 6-2.7 6-6s-2.7-6-6-6z"/>
      <path d="M2 4l-2 3h4zM8 11l-3 2 3 2v-4z"/>
    </svg>
  ),
  zoom: (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 10l5 5M4 6h4M6 4v4"/>
    </svg>
  ),
};

// Tool has nested menu indicator
const hasNested = [1, 2, 3, 5, 7, 8, 9, 10, 12, 13, 14, 15];

// Protection steps for animated sequence
const PROTECTION_STEPS = [
  { id: 'metadata', label: 'Metadata Embed', icon: '📋' },
  { id: 'watermark', label: 'Invisible Watermark', icon: '💧' },
  { id: 'stylecloak', label: 'Style Cloak', icon: '🎭' },
  { id: 'aiblock', label: 'AI Training Block', icon: '🛡️' },
];

const PhotoshopPluginMockup = () => {
  const { toast } = useToast();
  const [protectionLevel, setProtectionLevel] = useState("basic");
  const [copyrightOwner, setCopyrightOwner] = useState("Artist Name");
  const [copyrightYear, setCopyrightYear] = useState("2026");
  const [autoProtect, setAutoProtect] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [isProtecting, setIsProtecting] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState(0);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  
  // New states for "aha" moment
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Login panel states
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  // Screenshot mode - hides demo controls for clean marketing captures
  const [screenshotMode, setScreenshotMode] = useState(false);

  // Handle mock login
  const handleLogin = () => {
    if (!loginEmail || !loginPassword) {
      setLoginError("Please enter email and password");
      return;
    }
    // Simulate successful login
    setIsLoggedIn(true);
    setIsFirstRun(false);
    setShowLoginPanel(false);
    setLoginError("");
    toast({
      title: "Signed in successfully",
      description: `Welcome back, ${loginEmail}`,
    });
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsFirstRun(true);
    setLoginEmail("");
    setLoginPassword("");
  };

  // Animated protection sequence for instant "aha" moment
  const handleProtect = () => {
    setIsProtecting(true);
    setProtectionStatus(null);
    setCurrentStep(0);
    setCompletedSteps([]);
    
    // Animate through each step
    PROTECTION_STEPS.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, step.id]);
        }, 250);
      }, index * 400);
    });
    
    // Complete protection
    setTimeout(() => {
      setIsProtecting(false);
      setCurrentStep(-1);
      setProtectionStatus("success");
      setIsFirstRun(false);
    }, PROTECTION_STEPS.length * 400 + 300);
  };

  // Instant demo for first-run experience
  const handleInstantDemo = () => {
    handleProtect();
  };

  const toolsColumn1 = [
    { icon: ToolIcons.move, name: "Move Tool (V)" },
    { icon: ToolIcons.marquee, name: "Rectangular Marquee Tool (M)" },
    { icon: ToolIcons.lasso, name: "Lasso Tool (L)" },
    { icon: ToolIcons.objectSelect, name: "Object Selection Tool (W)" },
    { icon: ToolIcons.crop, name: "Crop Tool (C)" },
    { icon: ToolIcons.frame, name: "Frame Tool (K)" },
    { icon: ToolIcons.eyedropper, name: "Eyedropper Tool (I)" },
    { icon: ToolIcons.spot, name: "Spot Healing Brush Tool (J)" },
    { icon: ToolIcons.brush, name: "Brush Tool (B)" },
    { icon: ToolIcons.stamp, name: "Clone Stamp Tool (S)" },
    { icon: ToolIcons.historyBrush, name: "History Brush Tool (Y)" },
    { icon: ToolIcons.eraser, name: "Eraser Tool (E)" },
    { icon: ToolIcons.gradient, name: "Gradient Tool (G)" },
    { icon: ToolIcons.blur, name: "Blur Tool" },
    { icon: ToolIcons.dodge, name: "Dodge Tool (O)" },
  ];

  const toolsColumn2 = [
    { icon: ToolIcons.artboard, name: "Artboard Tool (V)" },
    { icon: ToolIcons.quickSelect, name: "Quick Selection Tool (W)" },
    { icon: ToolIcons.pen, name: "Pen Tool (P)" },
    { icon: ToolIcons.type, name: "Horizontal Type Tool (T)" },
    { icon: ToolIcons.pathSelect, name: "Path Selection Tool (A)" },
    { icon: ToolIcons.rectangle, name: "Rectangle Tool (U)" },
    { icon: ToolIcons.hand, name: "Hand Tool (H)" },
    { icon: ToolIcons.rotate, name: "Rotate View Tool (R)" },
    { icon: ToolIcons.zoom, name: "Zoom Tool (Z)" },
  ];

  const layers = [
    { name: "TSMO Protection", visible: true, locked: false, type: "effect", opacity: 100 },
    { name: "Title Text", visible: true, locked: false, type: "text", opacity: 100 },
    { name: "Main Subject", visible: true, locked: false, type: "smart", opacity: 100 },
    { name: "Gradient Fill", visible: true, locked: false, type: "fill", opacity: 80 },
    { name: "Background", visible: true, locked: true, type: "bg", opacity: 100 },
  ];

  return (
    <div className="space-y-4 relative">
      {/* Screenshot Mode Exit Button - Floating */}
      {screenshotMode && (
        <div className="absolute -top-2 right-0 z-50">
          <Button 
            size="sm" 
            variant="secondary"
            className="gap-2 shadow-lg"
            onClick={() => setScreenshotMode(false)}
          >
            <X className="h-4 w-4" />
            Exit Screenshot Mode
          </Button>
        </div>
      )}

      {/* Header - Hidden in Screenshot Mode */}
      {!screenshotMode && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Photoshop Plugin Preview</h2>
            <p className="text-muted-foreground">How TSMO appears when docked in Adobe Photoshop 2024</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setScreenshotMode(true)}
          >
            <Monitor className="h-4 w-4" />
            Screenshot Mode
          </Button>
        </div>
      )}

      {/* Photoshop Window */}
      <div className="rounded-lg overflow-hidden border border-[#1a1a1a] shadow-2xl">
        {/* Title Bar - macOS style */}
        <div className="bg-[#3a3a3a] px-3 py-2 flex items-center border-b border-[#1a1a1a]">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 cursor-pointer" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[#e8e8e8] text-[13px]">Artwork_Final.psd @ 100% (RGB/8#) *</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Menu Bar */}
        <div className="bg-[#323232] px-2 py-0.5 flex items-center border-b border-[#1a1a1a]">
          <div className="flex items-center">
            <div className="px-2 py-1">
              <span className="text-[#2997ff] text-[13px] font-medium">Ps</span>
            </div>
            {["File", "Edit", "Image", "Layer", "Type", "Select", "Filter", "3D", "View", "Plugins", "Window", "Help"].map((menu) => (
              <span 
                key={menu} 
                className="text-[#e8e8e8] text-[13px] px-2.5 py-1 hover:bg-[#454545] cursor-pointer rounded"
              >
                {menu}
              </span>
            ))}
          </div>
        </div>

        {/* Options Bar */}
        <div className="bg-[#323232] px-3 py-1.5 flex items-center gap-3 border-b border-[#1a1a1a]">
          {/* Tool Preset */}
          <div className="flex items-center gap-1 px-2 py-1 hover:bg-[#454545] rounded cursor-pointer">
            <div className="w-5 h-5 bg-[#1e1e1e] border border-[#545454] rounded flex items-center justify-center">
              {ToolIcons.move}
            </div>
            <ChevronDown className="h-3 w-3 text-[#888]" />
          </div>
          <div className="w-px h-5 bg-[#545454]" />
          
          {/* Auto-Select */}
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-3 h-3 accent-[#2997ff]" defaultChecked />
            <span className="text-[#e8e8e8] text-[12px]">Auto-Select:</span>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1e1e1e] border border-[#545454] rounded text-[#e8e8e8] text-[12px] cursor-pointer">
              Layer
              <ChevronDown className="h-3 w-3 text-[#888]" />
            </div>
          </div>
          
          <div className="w-px h-5 bg-[#545454]" />
          
          {/* Show Transform Controls */}
          <div className="flex items-center gap-2">
            <input type="checkbox" className="w-3 h-3 accent-[#2997ff]" />
            <span className="text-[#e8e8e8] text-[12px]">Show Transform Controls</span>
          </div>

          <div className="flex-1" />

          {/* Search and workspace */}
          <div className="flex items-center gap-2">
            <div className="w-40 h-6 bg-[#1e1e1e] border border-[#545454] rounded flex items-center px-2">
              <span className="text-[#666] text-[11px]">Search</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 hover:bg-[#454545] rounded cursor-pointer">
              <span className="text-[#e8e8e8] text-[12px]">Essentials</span>
              <ChevronDown className="h-3 w-3 text-[#888]" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex bg-[#1e1e1e]" style={{ height: "650px" }}>
          {/* Tools Panel - Left - Two Column */}
          <div className="w-[58px] bg-[#323232] border-r border-[#1a1a1a] flex flex-col">
            {/* Tools Grid */}
            <div className="flex-1 py-1">
              <div className="flex">
                {/* Column 1 */}
                <div className="flex flex-col items-center">
                  {toolsColumn1.map((tool, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTool(i)}
                      className={`w-[26px] h-[26px] flex items-center justify-center cursor-pointer relative group ${
                        selectedTool === i ? 'bg-[#545454]' : 'hover:bg-[#454545]'
                      }`}
                      title={tool.name}
                    >
                      <span className={selectedTool === i ? 'text-white' : 'text-[#c8c8c8]'}>
                        {tool.icon}
                      </span>
                      {hasNested.includes(i) && (
                        <div className="absolute bottom-0.5 right-0.5 w-0 h-0 border-l-[3px] border-l-transparent border-b-[3px] border-b-[#c8c8c8]" />
                      )}
                    </div>
                  ))}
                </div>
                {/* Column 2 */}
                <div className="flex flex-col items-center">
                  {toolsColumn2.map((tool, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedTool(i + 100)}
                      className={`w-[26px] h-[26px] flex items-center justify-center cursor-pointer relative group ${
                        selectedTool === i + 100 ? 'bg-[#545454]' : 'hover:bg-[#454545]'
                      }`}
                      title={tool.name}
                    >
                      <span className={selectedTool === i + 100 ? 'text-white' : 'text-[#c8c8c8]'}>
                        {tool.icon}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Foreground/Background Colors */}
            <div className="p-2 border-t border-[#1a1a1a]">
              <div className="relative w-[34px] h-[34px] mx-auto">
                {/* Background color */}
                <div className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-white border border-[#1a1a1a] cursor-pointer" />
                {/* Foreground color */}
                <div className="absolute top-0 left-0 w-[22px] h-[22px] bg-black border border-[#545454] cursor-pointer" />
                {/* Swap icon */}
                <div className="absolute top-0 right-0 text-[8px] text-[#888] cursor-pointer">⇄</div>
                {/* Reset icon */}
                <div className="absolute bottom-0 left-0 w-[10px] h-[10px] border border-[#888] cursor-pointer">
                  <div className="w-[6px] h-[6px] bg-white absolute bottom-0 right-0" />
                  <div className="w-[6px] h-[6px] bg-black absolute top-0 left-0" />
                </div>
              </div>
            </div>

            {/* Quick Mask Mode */}
            <div className="p-2 border-t border-[#1a1a1a] flex justify-center gap-1">
              <div className="w-[22px] h-[22px] border border-[#545454] rounded flex items-center justify-center cursor-pointer hover:bg-[#454545]">
                <div className="w-3 h-3 border border-dashed border-[#888]" />
              </div>
              <div className="w-[22px] h-[22px] border border-[#545454] rounded flex items-center justify-center cursor-pointer hover:bg-[#454545]">
                <div className="w-3 h-3 rounded-full bg-[#ff6b6b]/50" />
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Document Tabs */}
            <div className="bg-[#252525] h-[29px] flex items-end border-b border-[#1a1a1a]">
              {/* Active Tab */}
              <div className="h-[26px] bg-[#323232] px-3 flex items-center gap-2 border-t-2 border-t-[#2997ff] border-r border-[#1a1a1a] rounded-t-sm">
                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-orange-400 rounded-sm" />
                <span className="text-[#e8e8e8] text-[11px]">Artwork_Final.psd *</span>
                <X className="h-3 w-3 text-[#666] hover:text-white cursor-pointer" />
              </div>
              {/* Inactive Tab */}
              <div className="h-[24px] bg-[#252525] px-3 flex items-center gap-2 border-r border-[#1a1a1a] opacity-70 hover:opacity-100 cursor-pointer">
                <span className="text-[#888] text-[11px]">Logo_v2.ai</span>
                <X className="h-3 w-3 text-[#666] hover:text-white cursor-pointer" />
              </div>
              <div className="flex-1" />
              {/* Tab overflow */}
              <div className="px-2 text-[#666] text-sm cursor-pointer">›</div>
            </div>

            {/* Rulers + Canvas */}
            <div className="flex-1 flex">
              {/* Left Ruler */}
              <div className="w-[18px] bg-[#404040] border-r border-[#1a1a1a] relative">
                {[0, 100, 200, 300, 400, 500].map((n) => (
                  <div key={n} className="absolute left-0 w-full" style={{ top: `${n / 6}%` }}>
                    <div className="text-[7px] text-[#888] transform -rotate-90 origin-left translate-y-2">{n}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex-1 flex flex-col">
                {/* Top Ruler */}
                <div className="h-[18px] bg-[#404040] border-b border-[#1a1a1a] relative flex items-end">
                  {[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800].map((n) => (
                    <div key={n} className="absolute bottom-0" style={{ left: `${n / 20}%` }}>
                      <div className="text-[7px] text-[#888] ml-0.5">{n}</div>
                    </div>
                  ))}
                </div>

                {/* Canvas with Transparency Grid */}
                <div className="flex-1 overflow-hidden relative" style={{ 
                  backgroundImage: 'linear-gradient(45deg, #404040 25%, transparent 25%), linear-gradient(-45deg, #404040 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #404040 75%), linear-gradient(-45deg, transparent 75%, #404040 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: '#505050'
                }}>
                  {/* Canvas Content */}
                  <div className="absolute inset-8 flex items-center justify-center">
                    <div 
                      className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded shadow-2xl" 
                      style={{ width: "480px", height: "320px" }}
                    >
                      {/* Sample Artwork */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-5xl font-bold tracking-tight mb-1">ARTWORK</div>
                          <div className="text-lg opacity-90">Protected by TSMO</div>
                          {protectionStatus === "success" && (
                            <div className="mt-3 flex items-center justify-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-xs opacity-80">AI Training Protection Active</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection handles */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-black cursor-nw-resize" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-black cursor-ne-resize" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-black cursor-sw-resize" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-black cursor-se-resize" />
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-black cursor-n-resize" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border border-black cursor-s-resize" />
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white border border-black cursor-w-resize" />
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white border border-black cursor-e-resize" />

                      {/* Enhanced Protection Badge with animation */}
                      {protectionStatus === "success" && (
                        <div className="absolute top-3 right-3 animate-scale-in">
                          <div className="bg-gradient-to-r from-[#2e7d32] to-[#4caf50] text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-xl border border-white/20">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <span className="text-sm">🛡️</span>
                            </div>
                            <div>
                              <div className="font-semibold">Protected</div>
                              <div className="text-[10px] opacity-80">AI-Safe</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Animated protection overlay during protection */}
                      {isProtecting && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-fade-in">
                          <div className="bg-[#1e1e1e]/95 rounded-lg p-4 shadow-2xl border border-[#2997ff]/50">
                            <div className="text-center mb-3">
                              <div className="text-2xl mb-1">🛡️</div>
                              <div className="text-white text-sm font-medium">Protecting...</div>
                            </div>
                            <div className="space-y-2 min-w-[180px]">
                              {PROTECTION_STEPS.map((step, index) => (
                                <div 
                                  key={step.id}
                                  className={`flex items-center gap-2 text-xs transition-all duration-300 ${
                                    completedSteps.includes(step.id) 
                                      ? 'text-[#4ade80]' 
                                      : currentStep === index 
                                        ? 'text-[#2997ff]' 
                                        : 'text-[#666]'
                                  }`}
                                >
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    {completedSteps.includes(step.id) ? (
                                      <span className="text-[#4ade80]">✓</span>
                                    ) : currentStep === index ? (
                                      <div className="w-3 h-3 border-2 border-[#2997ff] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <span className="text-[#666]">○</span>
                                    )}
                                  </div>
                                  <span>{step.icon}</span>
                                  <span>{step.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PS 2024 Contextual Task Bar */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#323232] rounded-full px-2 py-1.5 flex items-center gap-1 shadow-xl border border-[#454545]">
                    <button className="px-3 py-1 text-[11px] text-[#e8e8e8] hover:bg-[#454545] rounded-full transition-colors">
                      Select Subject
                    </button>
                    <div className="w-px h-4 bg-[#545454]" />
                    <button className="px-3 py-1 text-[11px] text-[#e8e8e8] hover:bg-[#454545] rounded-full transition-colors">
                      Remove Background
                    </button>
                    <div className="w-px h-4 bg-[#545454]" />
                    <button className="px-3 py-1 text-[11px] text-[#2997ff] hover:bg-[#454545] rounded-full transition-colors flex items-center gap-1">
                      <span>✨</span> Generative Fill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel Group */}
          <div className="w-[300px] bg-[#323232] border-l border-[#1a1a1a] flex flex-col">
            {/* Panel Tabs Row */}
            <div className="flex border-b border-[#1a1a1a]">
              <div className="flex-1 flex">
                <div className="px-3 py-1.5 text-[11px] text-[#2997ff] border-b-2 border-[#2997ff] bg-[#3a3a3a]">Color</div>
                <div className="px-3 py-1.5 text-[11px] text-[#888] hover:text-[#ccc] cursor-pointer">Swatches</div>
                <div className="px-3 py-1.5 text-[11px] text-[#888] hover:text-[#ccc] cursor-pointer">Gradients</div>
              </div>
              <div className="px-2 py-1.5 text-[#666] hover:text-[#ccc] cursor-pointer">
                <Menu className="h-3 w-3" />
              </div>
            </div>

            {/* Color Panel */}
            <div className="p-3 border-b border-[#1a1a1a]">
              <div className="h-[80px] rounded overflow-hidden relative mb-2" style={{
                background: 'linear-gradient(to bottom, transparent, black), linear-gradient(to right, white, hsl(0, 100%, 50%))'
              }}>
                <div className="absolute w-3 h-3 border-2 border-white rounded-full shadow-md" style={{ top: '20%', left: '70%', transform: 'translate(-50%, -50%)' }} />
              </div>
              <div className="h-3 rounded" style={{
                background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)'
              }} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-[#888] w-3">H:</span>
                  <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px]" defaultValue="0" />
                  <span className="text-[#666]">°</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#888] w-3">R:</span>
                  <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px]" defaultValue="255" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#888] w-3">S:</span>
                  <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px]" defaultValue="100" />
                  <span className="text-[#666]">%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#888] w-3">G:</span>
                  <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px]" defaultValue="0" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#888] w-3">B:</span>
                  <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px]" defaultValue="100" />
                  <span className="text-[#666]">%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#888] w-3">B:</span>
                  <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px]" defaultValue="0" />
                </div>
              </div>
            </div>

            {/* Layers Panel */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Layers Header */}
              <div className="flex border-b border-[#1a1a1a]">
                <div className="flex-1 flex">
                  <div 
                    className="px-3 py-1.5 text-[11px] text-[#2997ff] border-b-2 border-[#2997ff] bg-[#3a3a3a] flex items-center gap-1 cursor-pointer"
                    onClick={() => setLayersPanelOpen(!layersPanelOpen)}
                  >
                    {layersPanelOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    Layers
                  </div>
                  <div className="px-3 py-1.5 text-[11px] text-[#888] hover:text-[#ccc] cursor-pointer">Channels</div>
                  <div className="px-3 py-1.5 text-[11px] text-[#888] hover:text-[#ccc] cursor-pointer">Paths</div>
                </div>
                <div className="px-2 py-1.5 text-[#666] hover:text-[#ccc] cursor-pointer">
                  <Menu className="h-3 w-3" />
                </div>
              </div>

              {layersPanelOpen && (
                <>
                  {/* Blend Mode & Opacity */}
                  <div className="px-2 py-1.5 flex items-center gap-2 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1e1e1e] border border-[#545454] rounded text-[#e8e8e8] text-[10px] cursor-pointer flex-1">
                      Normal
                      <ChevronDown className="h-3 w-3 text-[#888] ml-auto" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-[#888]">Opacity:</span>
                      <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px] text-right" defaultValue="100" />
                      <span className="text-[#888]">%</span>
                    </div>
                  </div>

                  {/* Lock icons row */}
                  <div className="px-2 py-1 flex items-center gap-1 border-b border-[#1a1a1a]">
                    <span className="text-[10px] text-[#888]">Lock:</span>
                    <div className="flex gap-0.5">
                      {['□', '🖌', '↔', '🔒'].map((icon, i) => (
                        <div key={i} className="w-5 h-5 flex items-center justify-center text-[10px] text-[#888] hover:bg-[#454545] rounded cursor-pointer">
                          {icon}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-[#888]">Fill:</span>
                      <input className="w-10 bg-[#1e1e1e] border border-[#545454] rounded px-1 text-[#e8e8e8] text-[10px] text-right" defaultValue="100" />
                      <span className="text-[#888]">%</span>
                    </div>
                  </div>

                  {/* Layers List */}
                  <div className="flex-1 overflow-y-auto">
                    {layers.map((layer, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 px-2 py-1 text-[11px] border-b border-[#2a2a2a] ${
                          i === 2 ? "bg-[#2997ff]/20" : "hover:bg-[#3a3a3a]"
                        }`}
                      >
                        <Eye className="h-3.5 w-3.5 text-[#888] cursor-pointer hover:text-[#ccc]" />
                        {layer.locked && <Lock className="h-3 w-3 text-[#666]" />}
                        {/* Layer thumbnail */}
                        <div className="w-8 h-8 bg-[#1e1e1e] border border-[#545454] rounded flex items-center justify-center text-[8px] text-[#666]">
                          {layer.type === 'text' && 'T'}
                          {layer.type === 'smart' && '◈'}
                          {layer.type === 'effect' && 'fx'}
                          {layer.type === 'fill' && '◐'}
                          {layer.type === 'bg' && '🔒'}
                        </div>
                        <span className={`flex-1 ${i === 2 ? 'text-white' : 'text-[#ccc]'}`}>{layer.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Layer Actions */}
                  <div className="flex items-center justify-center gap-1 py-1.5 border-t border-[#1a1a1a]">
                    {['fx', '⬛', '📁', '⊕', '🗑'].map((icon, i) => (
                      <div key={i} className="w-6 h-6 flex items-center justify-center text-[12px] text-[#888] hover:bg-[#454545] rounded cursor-pointer">
                        {icon}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* TSMO Plugin Panel */}
            <div className="border-t border-[#1a1a1a]">
              {/* TSMO Header */}
              <div className="flex items-center justify-between px-2 py-1.5 bg-[#3a3a3a] border-b border-[#1a1a1a]">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🛡️</span>
                  <span className="text-[#e8e8e8] text-[11px] font-medium">TSMO Protection</span>
                </div>
                <div className="flex items-center gap-1">
                  <Menu className="h-3 w-3 text-[#666] hover:text-[#ccc] cursor-pointer" />
                  <X className="h-3 w-3 text-[#666] hover:text-[#ccc] cursor-pointer" />
                </div>
              </div>

              {/* TSMO Content - Redesigned for "Aha" Moment */}
              <div className="p-2 space-y-2 max-h-[220px] overflow-y-auto">
                {/* Login Panel */}
                {showLoginPanel ? (
                  <div className="space-y-3">
                    <div className="text-center mb-2">
                      <div className="text-xl mb-1">🛡️</div>
                      <div className="text-sm font-medium text-[#eee]">Sign In to TSMO</div>
                    </div>
                    
                    {loginError && (
                      <div className="bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] px-2 py-1.5 rounded">
                        {loginError}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-[#888] uppercase tracking-wide">Email</label>
                        <input 
                          type="email" 
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-[#1e1e1e] border border-[#454545] focus:border-[#2997ff] rounded px-2 py-1.5 text-[10px] text-[#eee] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[#888] uppercase tracking-wide">Password</label>
                        <input 
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#1e1e1e] border border-[#454545] focus:border-[#2997ff] rounded px-2 py-1.5 text-[10px] text-[#eee] outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleLogin}
                      className="w-full bg-[#2997ff] hover:bg-[#2080e0] text-white py-2 rounded text-[10px] font-medium transition-colors"
                    >
                      Sign In
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowLoginPanel(false);
                        setLoginError("");
                      }}
                      className="w-full bg-[#454545] hover:bg-[#545454] text-[#ccc] py-1.5 rounded text-[10px] transition-colors"
                    >
                      ← Back
                    </button>
                    
                    <p className="text-[9px] text-[#666] text-center">
                      Don't have an account?{" "}
                      <a href="/auth" target="_blank" className="text-[#2997ff] hover:underline">
                        Sign up
                      </a>
                    </p>
                  </div>
                ) : isFirstRun && !isProtecting && !protectionStatus ? (
                  <div className="space-y-3">
                    {/* Big Instant Demo Button */}
                    <button
                      onClick={handleInstantDemo}
                      className="w-full bg-gradient-to-r from-[#2997ff] to-[#0077ed] hover:from-[#1a7fd4] hover:to-[#0066cc] text-white py-3 rounded-lg text-[12px] font-semibold flex flex-col items-center justify-center gap-1 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-lg">🛡️</span>
                      <span>Try Protection Instantly</span>
                      <span className="text-[9px] opacity-80 font-normal">See how it works in 2 seconds</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-[10px] text-[#666]">
                      <div className="flex-1 h-px bg-[#454545]" />
                      <span>or sign in for full features</span>
                      <div className="flex-1 h-px bg-[#454545]" />
                    </div>
                    
                    <button 
                      onClick={() => setShowLoginPanel(true)}
                      className="w-full bg-[#454545] hover:bg-[#545454] text-[#ccc] py-2 rounded text-[10px] transition-colors"
                    >
                      Sign in with TSMO account
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Protection Level - Now collapsible as "advanced" */}
                    <div>
                      <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1 text-[#888] text-[9px] uppercase tracking-wide mb-1 hover:text-[#ccc] transition-colors"
                      >
                        {showAdvanced ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        Protection Level: <span className="text-[#2997ff] capitalize">{protectionLevel}</span>
                      </button>
                      
                      {showAdvanced && (
                        <>
                          <div className="flex gap-1">
                            {[
                              { value: "basic", label: "Basic (Free)", sublabel: "50 pieces" },
                              { value: "pro", label: "Pro ($29/mo)", sublabel: "Unlimited" },
                            ].map((level) => (
                              <button
                                key={level.value}
                                onClick={() => setProtectionLevel(level.value)}
                                className={`flex-1 py-1.5 px-1.5 text-[10px] rounded transition-colors flex flex-col items-center ${
                                  protectionLevel === level.value
                                    ? "bg-[#2997ff] text-white"
                                    : "bg-[#1e1e1e] text-[#888] hover:bg-[#454545]"
                                }`}
                              >
                                <span className="font-medium">{level.label}</span>
                                <span className="text-[8px] opacity-70">{level.sublabel}</span>
                              </button>
                            ))}
                          </div>
                          
                          {/* Features List - 2 Tier System */}
                          <div className="mt-2 bg-[#1e1e1e] rounded p-1.5 text-[9px]">
                            {protectionLevel === "basic" && (
                              <div className="space-y-0.5">
                                <div className="text-[#888] flex items-center gap-1"><span className="text-[#4ade80]">✓</span> Metadata Embed</div>
                                <div className="text-[#888] flex items-center gap-1"><span className="text-[#4ade80]">✓</span> File Fingerprint</div>
                                <div className="text-[#888] flex items-center gap-1"><span className="text-[#4ade80]">✓</span> EXIF Protection</div>
                                <div className="text-[#888] flex items-center gap-1"><span className="text-[#4ade80]">✓</span> Hash Generation</div>
                                <div className="text-[#666] text-[8px] mt-1 pt-1 border-t border-[#333]">Limited to 50 protected pieces</div>
                              </div>
                            )}
                            {protectionLevel === "pro" && (
                              <div className="space-y-0.5">
                                <div className="text-[#888] flex items-center gap-1"><span className="text-[#4ade80]">✓</span> All Basic features</div>
                                <div className="text-[#a78bfa] flex items-center gap-1"><span className="text-[#a78bfa]">★</span> Style Cloaking</div>
                                <div className="text-[#a78bfa] flex items-center gap-1"><span className="text-[#a78bfa]">★</span> Invisible Watermark</div>
                                <div className="text-[#a78bfa] flex items-center gap-1"><span className="text-[#a78bfa]">★</span> AI Training Block</div>
                                <div className="text-[#a78bfa] flex items-center gap-1"><span className="text-[#a78bfa]">★</span> Color Jitter Defense</div>
                                <div className="text-[#a78bfa] flex items-center gap-1"><span className="text-[#a78bfa]">★</span> C2PA Signing (when available)</div>
                                <div className="text-[#a78bfa] flex items-center gap-1"><span className="text-[#a78bfa]">★</span> Legal Evidence Package</div>
                                <div className="text-[#4ade80] text-[8px] mt-1 pt-1 border-t border-[#333]">Unlimited protected pieces</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Copyright Info Row - Now in advanced */}
                          <div className="flex gap-2 mt-2">
                            <div className="flex-1">
                              <label className="text-[#888] text-[9px] block mb-0.5">Owner</label>
                              <input
                                type="text"
                                value={copyrightOwner}
                                onChange={(e) => setCopyrightOwner(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-[#545454] rounded px-1.5 py-1 text-[#e8e8e8] text-[10px] focus:border-[#2997ff] focus:outline-none"
                              />
                            </div>
                            <div className="w-16">
                              <label className="text-[#888] text-[9px] block mb-0.5">Year</label>
                              <input
                                type="number"
                                value={copyrightYear}
                                onChange={(e) => setCopyrightYear(e.target.value)}
                                className="w-full bg-[#1e1e1e] border border-[#545454] rounded px-1.5 py-1 text-[#e8e8e8] text-[10px] focus:border-[#2997ff] focus:outline-none"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Main Action Button - Always visible */}
                    <button
                      onClick={handleProtect}
                      disabled={isProtecting}
                      className="w-full bg-[#2997ff] hover:bg-[#1a7fd4] disabled:opacity-50 text-white py-2.5 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all shadow-md"
                    >
                      {isProtecting ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Protecting...
                        </>
                      ) : protectionStatus === "success" ? (
                        <>
                          <span>✓</span>
                          Re-Protect Document
                        </>
                      ) : (
                        <>
                          <span>🛡️</span>
                          Protect Document
                        </>
                      )}
                    </button>

                    {/* Success State with Save CTA */}
                    {protectionStatus === "success" && (
                      <div className="bg-gradient-to-r from-[#2e7d32]/30 to-[#4caf50]/20 border border-[#2e7d32]/50 rounded-lg p-2 animate-scale-in">
                        <div className="text-[#66bb6a] text-[11px] font-medium flex items-center gap-2 mb-1.5">
                          <span className="text-base">✓</span>
                          <span>Protected successfully!</span>
                        </div>
                        <div className="text-[#888] text-[9px] mb-2">
                          Your art is now protected from AI training.
                        </div>
                        <button 
                          className="w-full bg-[#2e7d32] hover:bg-[#388e3c] text-white py-1.5 rounded text-[10px] font-medium transition-colors"
                          onClick={() => {
                            toast({
                              title: "Saved to Portfolio",
                              description: "Your protected artwork is now available in your TSMO dashboard.",
                            });
                            setProtectionStatus(null);
                          }}
                        >
                          Save to TSMO Account →
                        </button>
                      </div>
                    )}

                    {/* Secondary Actions */}
                    {!protectionStatus && (
                      <div className="flex gap-1">
                        <button className="flex-1 bg-[#454545] hover:bg-[#545454] text-[#ccc] py-1.5 rounded text-[10px] flex items-center justify-center gap-1 transition-colors">
                          📚 Batch
                        </button>
                        <button className="flex-1 bg-[#454545] hover:bg-[#545454] text-[#ccc] py-1.5 rounded text-[10px] flex items-center justify-center gap-1 transition-colors">
                          ✓ Verify
                        </button>
                      </div>
                    )}

                    {/* Settings Toggles */}
                    <div className="space-y-1 pt-1 border-t border-[#454545]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div 
                          onClick={() => setAutoProtect(!autoProtect)}
                          className={`w-6 h-3 rounded-full transition-colors cursor-pointer ${autoProtect ? "bg-[#2997ff]" : "bg-[#545454]"}`}
                        >
                          <div className={`w-2.5 h-2.5 bg-white rounded-full mt-[1px] transition-transform ${autoProtect ? "translate-x-3" : "translate-x-0.5"}`} />
                        </div>
                        <span className="text-[#ccc] text-[10px]">Auto-protect on export</span>
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#323232] px-3 py-1 flex items-center justify-between border-t border-[#1a1a1a]">
          <div className="flex items-center gap-3 text-[10px] text-[#888]">
            <div className="flex items-center gap-1 hover:bg-[#454545] px-1.5 py-0.5 rounded cursor-pointer">
              <span>100%</span>
              <ChevronDown className="h-2.5 w-2.5" />
            </div>
            <span>Doc: 4.2M/32.1M</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#888]">
            <span>1920 × 1080 px</span>
            <span>RGB/8</span>
            <span>sRGB IEC61966-2.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoshopPluginMockup;
