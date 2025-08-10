import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { AlertCircle, CheckCircle, Clock, Download, CreditCard, Shield } from "lucide-react";

interface ArtworkItem {
  id: string;
  title: string;
}

interface LicenseRow {
  id: string;
  artwork_id: string;
  license_type: string;
  licensee_name: string | null;
  licensee_email: string | null;
  status: string;
  price_cents: number;
  currency: string;
  territory: string;
  blockchain_hash: string | null;
  blockchain_certificate_id: string | null;
  created_at: string;
  terms_text: string;
  artwork?: { id: string; title: string };
}

const Licensing: React.FC = () => {
  const { toast } = useToast();

  // SEO and meta tags
  useEffect(() => {
    document.title = "Automated Licensing with Blockchain Proof | TSMO";
    
    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    
    setMeta("description", "Generate licenses for your artwork with automated blockchain proof of ownership and terms.");
    
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/licensing`;
  }, []);

  // State management
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    artworkId: "",
    license_type: "standard",
    licensee_name: "",
    licensee_email: "",
    territory: "Worldwide",
    price_cents: 0,
    currency: "usd",
    terms_text: "License terms: Non-exclusive, non-transferable, limited to digital display. No AI training. Credit required.",
  });

  const currencySymbol = useMemo(() => {
    const symbols: Record<string, string> = { usd: "$", eur: "€", gbp: "£" };
    return symbols[form.currency.toLowerCase()] || form.currency.toUpperCase();
  }, [form.currency]);

  // Data loading
  const loadData = async () => {
    setLoading(true);
    try {
      // Load artworks
      const { data: artworkData, error: artworkError } = await supabase
        .from("artwork")
        .select("id, title")
        .order("created_at", { ascending: false })
        .limit(100);

      if (artworkError) {
        console.error("Failed to load artworks:", artworkError);
        toast({
          title: "Error loading artworks",
          description: artworkError.message,
          variant: "destructive",
        });
      } else if (artworkData) {
        setArtworks(artworkData);
      }

      // Load licenses
      const { data: licenseResponse, error: licenseError } = await supabase.functions.invoke(
        "automated-licensing",
        { body: { action: "list" } }
      );

      if (licenseError) {
        console.error("Failed to load licenses:", licenseError);
        toast({
          title: "Error loading licenses",
          description: licenseError.message,
          variant: "destructive",
        });
      } else if (licenseResponse?.success) {
        setLicenses(licenseResponse.licenses || []);
      } else {
        console.error("License response error:", licenseResponse);
        toast({
          title: "Failed to load licenses",
          description: licenseResponse?.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Data loading error:", error);
      toast({
        title: "Loading failed",
        description: error?.message || "Could not load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form validation
  const validateForm = () => {
    if (!form.artworkId) {
      toast({
        title: "Validation Error",
        description: "Please select an artwork to license.",
        variant: "destructive",
      });
      return false;
    }
    if (!form.license_type) {
      toast({
        title: "Validation Error",
        description: "Please select a license type.",
        variant: "destructive",
      });
      return false;
    }
    if (!form.terms_text.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter license terms.",
        variant: "destructive",
      });
      return false;
    }
    if (form.licensee_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.licensee_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Create license draft
  const createDraft = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        action: "create_draft" as const,
        artworkId: form.artworkId,
        license_type: form.license_type,
        licensee_name: form.licensee_name.trim() || undefined,
        licensee_email: form.licensee_email.trim() || undefined,
        territory: form.territory,
        price_cents: Number(form.price_cents) || 0,
        currency: form.currency,
        terms_text: form.terms_text.trim(),
      };

      const { data, error } = await supabase.functions.invoke("automated-licensing", {
        body: payload,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || data?.details || "Failed to create license");
      }

      toast({
        title: "Success",
        description: "License draft created successfully!",
      });

      // Reset form
      setForm(prev => ({
        ...prev,
        artworkId: "",
        licensee_name: "",
        licensee_email: "",
        price_cents: 0,
      }));

      await loadData();
    } catch (error: any) {
      console.error("Create license error:", error);
      toast({
        title: "Creation Failed",
        description: error?.message || "Unable to create license draft",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Activate license
  const activateLicense = async (licenseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("automated-licensing", {
        body: { action: "activate", licenseId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error(data?.error || "Failed to activate license");
      }

      toast({
        title: "License Activated",
        description: "License activated with blockchain proof successfully!",
      });

      await loadData();
    } catch (error: any) {
      console.error("Activate license error:", error);
      toast({
        title: "Activation Failed",
        description: error?.message || "Unable to activate license",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Collect payment
  const collectPayment = async (licenseId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-license-payment", {
        body: { licenseId },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.url) {
        throw new Error(data?.error || "No checkout URL received");
      }

      window.open(data.url, "_blank");
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error?.message || "Unable to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Download PDF certificate
  const downloadPDF = (license: LicenseRow) => {
    try {
      const doc = new jsPDF();
      const artworkTitle = license.artwork?.title || license.artwork_id;

      // Header
      doc.setFontSize(20);
      doc.text("License Certificate", 20, 30);

      // License details
      doc.setFontSize(12);
      const details = [
        `License ID: ${license.id}`,
        `Artwork: ${artworkTitle}`,
        `License Type: ${license.license_type}`,
        `Territory: ${license.territory}`,
        `Status: ${license.status}`,
        `Created: ${new Date(license.created_at).toLocaleString()}`,
      ];

      if (license.licensee_name) {
        details.push(`Licensee: ${license.licensee_name}`);
      }

      if (license.price_cents > 0) {
        details.push(`Price: ${currencySymbol}${(license.price_cents / 100).toFixed(2)}`);
      }

      if (license.blockchain_certificate_id) {
        details.push(`Certificate ID: ${license.blockchain_certificate_id}`);
      }

      if (license.blockchain_hash) {
        details.push(`Blockchain Hash: ${license.blockchain_hash.slice(0, 32)}...`);
      }

      details.forEach((detail, index) => {
        doc.text(detail, 20, 50 + (index * 8));
      });

      // Terms section
      doc.text("Terms and Conditions:", 20, 50 + (details.length * 8) + 10);
      const terms = license.terms_text || "No terms specified";
      const splitTerms = doc.splitTextToSize(terms, 170);
      doc.text(splitTerms, 20, 50 + (details.length * 8) + 20);

      doc.save(`tsmo-license-${license.id.slice(0, 8)}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "License certificate downloaded successfully",
      });
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF certificate",
        variant: "destructive",
      });
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      draft: { label: "Draft", variant: "secondary" as const, icon: Clock },
      pending_payment: { label: "Pending Payment", variant: "destructive" as const, icon: CreditCard },
      paid: { label: "Paid", variant: "default" as const, icon: CheckCircle },
      active: { label: "Active", variant: "default" as const, icon: Shield },
      revoked: { label: "Revoked", variant: "destructive" as const, icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <main className="min-h-screen bg-background" role="main">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Automated Licensing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Create legally binding licenses for your artwork with automated blockchain proof of ownership and terms.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create License Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Create New License
              </CardTitle>
              <CardDescription>
                Generate a draft license. Activation will add immutable blockchain proof.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Artwork Selection */}
              <div>
                <Label htmlFor="artwork-select">Artwork</Label>
                <Select
                  value={form.artworkId}
                  onValueChange={(value) => setForm(prev => ({ ...prev, artworkId: value }))}
                >
                  <SelectTrigger id="artwork-select" className="mt-1">
                    <SelectValue placeholder="Select artwork to license" />
                  </SelectTrigger>
                  <SelectContent>
                    {artworks.map((artwork) => (
                      <SelectItem key={artwork.id} value={artwork.id}>
                        {artwork.title || `Artwork ${artwork.id.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* License Type and Territory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="license-type">License Type</Label>
                  <Select
                    value={form.license_type}
                    onValueChange={(value) => setForm(prev => ({ ...prev, license_type: value }))}
                  >
                    <SelectTrigger id="license-type" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="editorial">Editorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="territory">Territory</Label>
                  <Input
                    id="territory"
                    className="mt-1"
                    value={form.territory}
                    onChange={(e) => setForm(prev => ({ ...prev, territory: e.target.value }))}
                    placeholder="e.g., Worldwide, USA, Europe"
                  />
                </div>
              </div>

              {/* Licensee Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licensee-name">Licensee Name (Optional)</Label>
                  <Input
                    id="licensee-name"
                    className="mt-1"
                    value={form.licensee_name}
                    onChange={(e) => setForm(prev => ({ ...prev, licensee_name: e.target.value }))}
                    placeholder="Enter licensee name"
                  />
                </div>
                <div>
                  <Label htmlFor="licensee-email">Licensee Email (Optional)</Label>
                  <Input
                    id="licensee-email"
                    type="email"
                    className="mt-1"
                    value={form.licensee_email}
                    onChange={(e) => setForm(prev => ({ ...prev, licensee_email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ({currencySymbol})</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step={0.01}
                    className="mt-1"
                    value={form.price_cents / 100}
                    onChange={(e) => setForm(prev => ({ 
                      ...prev, 
                      price_cents: Math.round(Number(e.target.value) * 100) 
                    }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(value) => setForm(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger id="currency" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Terms */}
              <div>
                <Label htmlFor="terms">License Terms</Label>
                <Textarea
                  id="terms"
                  className="mt-1 min-h-[120px]"
                  value={form.terms_text}
                  onChange={(e) => setForm(prev => ({ ...prev, terms_text: e.target.value }))}
                  placeholder="Enter detailed license terms and conditions..."
                />
              </div>

              <Button 
                onClick={createDraft} 
                disabled={submitting || loading}
                className="w-full"
                size="lg"
              >
                {submitting ? "Creating..." : "Create License Draft"}
              </Button>
            </CardContent>
          </Card>

          {/* License List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                My Licenses
              </CardTitle>
              <CardDescription>
                Manage your created licenses. Activate to add blockchain proof and finalize.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && licenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading licenses...</p>
                </div>
              ) : licenses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No licenses created yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first license using the form on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {licenses.map((license) => (
                    <div key={license.id} className="border rounded-lg p-4 space-y-3">
                      {/* License Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">
                            {license.artwork?.title || `Artwork ${license.artwork_id.slice(0, 8)}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {license.license_type} • {license.territory}
                            {license.price_cents > 0 && (
                              <> • {currencySymbol}{(license.price_cents / 100).toFixed(2)}</>
                            )}
                          </p>
                        </div>
                        <StatusBadge status={license.status} />
                      </div>

                      {/* Blockchain Info */}
                      {license.blockchain_hash && (
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          <strong>Blockchain Hash:</strong> {license.blockchain_hash.slice(0, 32)}...
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {license.price_cents > 0 && !["paid", "active"].includes(license.status) && (
                          <Button
                            size="sm"
                            onClick={() => collectPayment(license.id)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <CreditCard className="h-3 w-3" />
                            Collect Payment
                          </Button>
                        )}
                        
                        {(license.price_cents === 0 || license.status === "paid") && license.status !== "active" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => activateLicense(license.id)}
                            disabled={loading}
                            className="flex items-center gap-1"
                          >
                            <Shield className="h-3 w-3" />
                            Activate + Blockchain Proof
                          </Button>
                        )}
                        
                        {license.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadPDF(license)}
                            className="flex items-center gap-1"
                          >
                            <Download className="h-3 w-3" />
                            Download Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Licensing;