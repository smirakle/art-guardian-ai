import { useState } from "react";
import { 
  Move, Square, Circle, Crop, Brush, Eraser, 
  Type, Hand, ZoomIn, Pipette, PaintBucket,
  Eye, Lock, Layers, ChevronDown, MoreHorizontal,
  Play, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";

const PhotoshopPluginMockup = () => {
  const [protectionLevel, setProtectionLevel] = useState("professional");
  const [copyrightOwner, setCopyrightOwner] = useState("Artist Name");
  const [copyrightYear, setCopyrightYear] = useState("2026");
  const [autoProtect, setAutoProtect] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [isProtecting, setIsProtecting] = useState(false);
  const [protectionStatus, setProtectionStatus] = useState<string | null>(null);

  const handleProtect = () => {
    setIsProtecting(true);
    setProtectionStatus(null);
    setTimeout(() => {
      setIsProtecting(false);
      setProtectionStatus("success");
      setTimeout(() => setProtectionStatus(null), 3000);
    }, 2000);
  };

  const tools = [
    { icon: Move, name: "Move" },
    { icon: Square, name: "Marquee" },
    { icon: Circle, name: "Lasso" },
    { icon: Pipette, name: "Eyedropper" },
    { icon: Crop, name: "Crop" },
    { icon: Brush, name: "Brush" },
    { icon: Eraser, name: "Eraser" },
    { icon: PaintBucket, name: "Fill" },
    { icon: Type, name: "Type" },
    { icon: Hand, name: "Hand" },
    { icon: ZoomIn, name: "Zoom" },
  ];

  const layers = [
    { name: "Effects Layer", visible: true, locked: false },
    { name: "Title Text", visible: true, locked: false },
    { name: "Main Subject", visible: true, locked: false },
    { name: "Background", visible: true, locked: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Photoshop Plugin Preview</h2>
          <p className="text-muted-foreground">How TSMO appears when docked in Adobe Photoshop CC</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Monitor className="h-4 w-4" />
          Screenshot Mode
        </Button>
      </div>

      {/* Photoshop Window */}
      <div className="rounded-lg overflow-hidden border-2 border-[#3d3d3d] shadow-2xl">
        {/* Title Bar */}
        <div className="bg-[#1e1e1e] px-3 py-2 flex items-center justify-between border-b border-[#3d3d3d]">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-[#9d9d9d] text-sm ml-4">Adobe Photoshop 2024</span>
          </div>
          <div className="text-[#6d6d6d] text-xs">Artwork_Final.psd @ 100% (RGB/8)</div>
        </div>

        {/* Menu Bar */}
        <div className="bg-[#2d2d2d] px-4 py-1.5 flex items-center gap-4 border-b border-[#3d3d3d]">
          {["File", "Edit", "Image", "Layer", "Type", "Select", "Filter", "3D", "View", "Window", "Help"].map((menu) => (
            <span key={menu} className="text-[#cccccc] text-sm hover:text-white cursor-pointer">
              {menu}
            </span>
          ))}
        </div>

        {/* Options Bar */}
        <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-4 border-b border-[#3d3d3d]">
          <div className="flex items-center gap-2">
            <Move className="h-4 w-4 text-[#9d9d9d]" />
            <span className="text-[#9d9d9d] text-xs">Auto-Select: Layer</span>
          </div>
          <div className="h-4 w-px bg-[#4d4d4d]" />
          <span className="text-[#9d9d9d] text-xs">Show Transform Controls</span>
        </div>

        {/* Main Content Area */}
        <div className="flex bg-[#1e1e1e]" style={{ height: "600px" }}>
          {/* Tools Panel - Left */}
          <div className="w-12 bg-[#2d2d2d] border-r border-[#3d3d3d] py-2 flex flex-col items-center gap-1">
            {tools.map((tool, i) => (
              <div
                key={i}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#4d4d4d] cursor-pointer group"
                title={tool.name}
              >
                <tool.icon className="h-4 w-4 text-[#9d9d9d] group-hover:text-white" />
              </div>
            ))}
            <div className="flex-1" />
            <div className="w-6 h-6 bg-black border border-[#4d4d4d]" />
            <div className="w-6 h-6 bg-white border border-[#4d4d4d] -mt-2 ml-2" />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            {/* Document Tab */}
            <div className="bg-[#2d2d2d] px-1 py-1 flex items-center border-b border-[#3d3d3d]">
              <div className="bg-[#3d3d3d] px-4 py-1.5 rounded-t text-[#cccccc] text-sm flex items-center gap-2">
                <span>Artwork_Final.psd</span>
                <span className="text-[#6d6d6d]">×</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center bg-[#535353] p-8 overflow-hidden">
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg shadow-2xl" style={{ width: "500px", height: "350px" }}>
                {/* Sample Artwork Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl font-bold mb-2">ARTWORK</div>
                    <div className="text-xl opacity-80">Protected by TSMO</div>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm">AI Training Protection Active</span>
                    </div>
                  </div>
                </div>
                {/* Protection indicator */}
                {protectionStatus === "success" && (
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    Protected
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Panels */}
            <div className="h-40 bg-[#2d2d2d] border-t border-[#3d3d3d] flex">
              {/* Layers Panel */}
              <div className="flex-1 border-r border-[#3d3d3d]">
                <div className="px-3 py-1.5 border-b border-[#3d3d3d] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#9d9d9d]" />
                    <span className="text-[#cccccc] text-sm font-medium">Layers</span>
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-[#6d6d6d]" />
                </div>
                <div className="p-2 space-y-1">
                  {layers.map((layer, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2 py-1 rounded text-sm ${i === 2 ? "bg-[#2680eb]/30" : "hover:bg-[#3d3d3d]"}`}
                    >
                      <Eye className="h-3 w-3 text-[#9d9d9d]" />
                      {layer.locked && <Lock className="h-3 w-3 text-[#6d6d6d]" />}
                      <div className="w-6 h-6 bg-[#4d4d4d] rounded" />
                      <span className="text-[#cccccc]">{layer.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Properties Panel */}
              <div className="w-48 border-r border-[#3d3d3d]">
                <div className="px-3 py-1.5 border-b border-[#3d3d3d]">
                  <span className="text-[#cccccc] text-sm font-medium">Properties</span>
                </div>
                <div className="p-3 space-y-2 text-xs text-[#9d9d9d]">
                  <div className="flex justify-between">
                    <span>Width:</span>
                    <span className="text-[#cccccc]">1920 px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Height:</span>
                    <span className="text-[#cccccc]">1080 px</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolution:</span>
                    <span className="text-[#cccccc]">300 ppi</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Color Mode:</span>
                    <span className="text-[#cccccc]">RGB/8</span>
                  </div>
                </div>
              </div>

              {/* History Panel */}
              <div className="w-40">
                <div className="px-3 py-1.5 border-b border-[#3d3d3d]">
                  <span className="text-[#cccccc] text-sm font-medium">History</span>
                </div>
                <div className="p-2 space-y-1 text-xs">
                  {["Open", "New Layer", "Transform", "Style Applied", "TSMO Protect"].map((item, i) => (
                    <div key={i} className={`px-2 py-1 rounded ${i === 4 ? "bg-[#2680eb]/30 text-[#cccccc]" : "text-[#9d9d9d] hover:bg-[#3d3d3d]"}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TSMO Plugin Panel - Right */}
          <div className="w-64 bg-[#2d2d2d] border-l border-[#3d3d3d] flex flex-col">
            {/* Panel Header */}
            <div className="px-3 py-2 border-b border-[#3d3d3d] flex items-center justify-between bg-[#323232]">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span className="text-[#cccccc] font-medium">TSMO Protection</span>
              </div>
              <ChevronDown className="h-4 w-4 text-[#6d6d6d]" />
            </div>

            {/* Plugin Content */}
            <div className="flex-1 p-3 space-y-4 overflow-y-auto">
              {/* Protection Level */}
              <div>
                <div className="text-[#9d9d9d] text-xs uppercase tracking-wide mb-2">Protection Level</div>
                <div className="space-y-1.5">
                  {[
                    { value: "basic", label: "Basic", desc: "XMP + EXIF" },
                    { value: "professional", label: "Professional", desc: "+ Watermark" },
                    { value: "enterprise", label: "Enterprise", desc: "+ C2PA" },
                  ].map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        protectionLevel === level.value
                          ? "bg-[#2680eb]/20 border border-[#2680eb]/50"
                          : "hover:bg-[#3d3d3d] border border-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        name="level"
                        value={level.value}
                        checked={protectionLevel === level.value}
                        onChange={(e) => setProtectionLevel(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        protectionLevel === level.value
                          ? "border-[#2680eb] bg-[#2680eb]"
                          : "border-[#6d6d6d]"
                      }`} />
                      <div>
                        <div className="text-[#cccccc] text-sm font-medium">{level.label}</div>
                        <div className="text-[#6d6d6d] text-xs">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Copyright Info */}
              <div>
                <div className="text-[#9d9d9d] text-xs uppercase tracking-wide mb-2">Copyright Info</div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[#9d9d9d] text-xs block mb-1">Owner Name</label>
                    <input
                      type="text"
                      value={copyrightOwner}
                      onChange={(e) => setCopyrightOwner(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#4d4d4d] rounded px-2 py-1.5 text-[#cccccc] text-sm focus:border-[#2680eb] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#9d9d9d] text-xs block mb-1">Year</label>
                    <input
                      type="number"
                      value={copyrightYear}
                      onChange={(e) => setCopyrightYear(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#4d4d4d] rounded px-2 py-1.5 text-[#cccccc] text-sm focus:border-[#2680eb] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleProtect}
                  disabled={isProtecting}
                  className="w-full bg-[#2680eb] hover:bg-[#1a6fd4] disabled:opacity-50 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  {isProtecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Protecting...
                    </>
                  ) : (
                    <>
                      <span>🛡️</span>
                      Protect Document
                    </>
                  )}
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#cccccc] py-2 rounded text-sm flex items-center justify-center gap-1.5 transition-colors">
                    <span>📚</span>
                    Batch
                  </button>
                  <button className="flex-1 bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#cccccc] py-2 rounded text-sm flex items-center justify-center gap-1.5 transition-colors">
                    <span>✓</span>
                    Verify
                  </button>
                </div>
              </div>

              {/* Settings */}
              <div>
                <div className="text-[#9d9d9d] text-xs uppercase tracking-wide mb-2">Settings</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoProtect}
                      onChange={(e) => setAutoProtect(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-8 h-4 rounded-full transition-colors ${autoProtect ? "bg-[#2680eb]" : "bg-[#4d4d4d]"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${autoProtect ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-[#cccccc] text-sm">Auto-protect on export</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNotifications}
                      onChange={(e) => setShowNotifications(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-8 h-4 rounded-full transition-colors ${showNotifications ? "bg-[#2680eb]" : "bg-[#4d4d4d]"}`}>
                      <div className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${showNotifications ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-[#cccccc] text-sm">Show notifications</span>
                  </label>
                </div>
              </div>

              {/* Status */}
              {protectionStatus === "success" && (
                <div className="bg-[#2e7d32]/20 border border-[#2e7d32]/50 rounded p-3">
                  <div className="text-[#66bb6a] text-sm font-medium flex items-center gap-2">
                    <span>✓</span>
                    Document protected successfully
                  </div>
                  <div className="text-[#66bb6a]/70 text-xs mt-1">
                    XMP metadata, watermark, and C2PA manifest applied
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-3 py-2 border-t border-[#3d3d3d] bg-[#262626]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6d6d6d]">TSMO v1.0.0</span>
                <span className="text-[#2680eb]">tsmo.io</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-[#2d2d2d] px-4 py-1.5 flex items-center justify-between border-t border-[#3d3d3d]">
          <div className="flex items-center gap-4 text-xs text-[#9d9d9d]">
            <span>Doc: 15.2M/28.4M</span>
            <span>|</span>
            <span>Scratch: 1.2G</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-[#2680eb] flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#2680eb]" />
              TSMO Active
            </span>
            <span className="text-[#9d9d9d]">100%</span>
          </div>
        </div>
      </div>

      {/* Marketing Callouts */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl mb-2">🔒</div>
          <h3 className="font-semibold mb-1">Seamless Integration</h3>
          <p className="text-sm text-muted-foreground">TSMO docks directly in your Photoshop workspace, no context switching needed.</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-semibold mb-1">One-Click Protection</h3>
          <p className="text-sm text-muted-foreground">Protect your artwork instantly while you work, right from the panel.</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl mb-2">🔄</div>
          <h3 className="font-semibold mb-1">Auto-Protect on Export</h3>
          <p className="text-sm text-muted-foreground">Never forget to protect - automatic protection when saving or exporting.</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoshopPluginMockup;
