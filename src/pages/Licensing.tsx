import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

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
  blockchain_hash: string | null;
  blockchain_certificate_id: string | null;
  created_at: string;
  artwork?: { id: string; title: string };
}

const Licensing: React.FC = () => {
  const { toast } = useToast();

  useEffect(() => {
    const title = "Automated Licensing with Blockchain Proof | TSMO";
    document.title = title;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };
    setMeta(
      "description",
      "Generate licenses for your artwork with automated blockchain proof of ownership and terms."
    );

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/licensing`;
  }, []);

  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    artworkId: "",
    license_type: "standard",
    licensee_name: "",
    licensee_email: "",
    territory: "Worldwide",
    price_cents: 0,
    currency: "usd",
    terms_text:
      "License terms: Non-exclusive, non-transferable, limited to digital display. No AI training. Credit required.",
  });

  const currencySymbol = useMemo(() => (form.currency.toLowerCase() === "usd" ? "$" : form.currency.toUpperCase()), [form.currency]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: art, error: artErr } = await supabase
        .from("artwork")
        .select("id, title")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!artErr && art) setArtworks(art as any);

      const { data: listRes, error: listErr } = await supabase.functions.invoke("automated-licensing", {
        body: { action: "list" },
      });
      if (!listErr && listRes?.success) setLicenses(listRes.licenses as LicenseRow[]);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Load failed", description: e?.message ?? "Could not load data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createDraft = async () => {
    if (!form.artworkId) {
      toast({ title: "Select artwork", description: "Please select an artwork to license." });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("automated-licensing", {
        body: {
          action: "create_draft",
          artworkId: form.artworkId,
          license_type: form.license_type,
          licensee_name: form.licensee_name || undefined,
          licensee_email: form.licensee_email || undefined,
          territory: form.territory,
          price_cents: Number(form.price_cents) || 0,
          currency: form.currency,
          terms_text: form.terms_text,
        },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "Failed");
      toast({ title: "License created", description: "Draft license created successfully." });
      loadData();
    } catch (e: any) {
      toast({ title: "Create failed", description: e?.message ?? "Unable to create license" });
    } finally {
      setLoading(false);
    }
  };

  const activate = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("automated-licensing", {
        body: { action: "activate", licenseId: id },
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || "Failed");
      toast({ title: "Activated", description: "License activated with blockchain proof." });
      loadData();
    } catch (e: any) {
      toast({ title: "Activate failed", description: e?.message ?? "Unable to activate" });
    } finally {
      setLoading(false);
    }
  };

  const collectPayment = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-license-payment", {
        body: { licenseId: id },
      });
      if (error || !data?.url) throw new Error(data?.error || error?.message || "Failed to create checkout");
      window.open(data.url as string, "_blank");
    } catch (e: any) {
      toast({ title: "Payment error", description: e?.message ?? "Unable to start checkout" });
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = (l: LicenseRow) => {
    const doc = new jsPDF();
    const title = (l.artwork?.title || l.artwork_id);
    doc.setFontSize(16);
    doc.text("License Certificate", 20, 20);
    doc.setFontSize(12);
    doc.text(`License ID: ${l.id}`, 20, 32);
    doc.text(`Artwork: ${title}`, 20, 40);
    doc.text(`Type: ${l.license_type}`, 20, 48);
    doc.text(`Status: ${l.status}`, 20, 56);
    if (l.blockchain_certificate_id) doc.text(`Certificate: ${l.blockchain_certificate_id}`, 20, 64);
    if (l.blockchain_hash) doc.text(`Blockchain Hash: ${l.blockchain_hash.slice(0, 32)}...`, 20, 72);
    doc.text(`Created: ${new Date(l.created_at).toLocaleString()}`, 20, 80);
    doc.save(`license-${l.id}.pdf`);
  };

  return (
    <main className="min-h-screen bg-background" role="main">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Automated Licensing</h1>
          <p className="text-muted-foreground">
            Create licenses for your artwork and anchor proof to blockchain upon activation.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>New License</CardTitle>
              <CardDescription>Generate a draft license. Activating will add blockchain proof.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Artwork</Label>
                <Select
                  value={form.artworkId}
                  onValueChange={(v) => setForm((s) => ({ ...s, artworkId: v }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select artwork" />
                  </SelectTrigger>
                  <SelectContent>
                    {artworks.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title || a.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>License type</Label>
                  <Select
                    value={form.license_type}
                    onValueChange={(v) => setForm((s) => ({ ...s, license_type: v }))}
                  >
                    <SelectTrigger className="mt-1">
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
                  <Label>Territory</Label>
                  <Input
                    className="mt-1"
                    value={form.territory}
                    onChange={(e) => setForm((s) => ({ ...s, territory: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Licensee name (optional)</Label>
                  <Input
                    className="mt-1"
                    value={form.licensee_name}
                    onChange={(e) => setForm((s) => ({ ...s, licensee_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Licensee email (optional)</Label>
                  <Input
                    className="mt-1"
                    type="email"
                    value={form.licensee_email}
                    onChange={(e) => setForm((s) => ({ ...s, licensee_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Price ({currencySymbol})</Label>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    value={form.price_cents}
                    onChange={(e) => setForm((s) => ({ ...s, price_cents: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={form.currency}
                    onValueChange={(v) => setForm((s) => ({ ...s, currency: v }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Terms</Label>
                <Textarea
                  className="mt-1 min-h-[140px]"
                  value={form.terms_text}
                  onChange={(e) => setForm((s) => ({ ...s, terms_text: e.target.value }))}
                />
              </div>

              <Button onClick={createDraft} disabled={loading} className="w-full">
                {loading ? "Processing..." : "Create Draft"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Licenses</CardTitle>
              <CardDescription>Activate to write blockchain proof and finalize.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {licenses.length === 0 && (
                <p className="text-muted-foreground">No licenses yet.</p>
              )}
              {licenses.map((l) => (
                <div key={l.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-medium">
                        {l.artwork?.title || l.artwork_id} · {l.license_type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Status: {l.status}
                        {l.blockchain_hash && (
                          <>
                            {" · "}Hash: {l.blockchain_hash.slice(0, 10)}…
                          </>
                        )}
                      </div>
                    </div>
                  <div className="flex items-center gap-2">
                      {l.price_cents > 0 && l.status !== "paid" && l.status !== "active" && (
                        <Button size="sm" onClick={() => collectPayment(l.id)} disabled={loading}>
                          Collect Payment
                        </Button>
                      )}
                      {((l.price_cents === 0) || l.status === "paid") && l.status !== "active" && (
                        <Button size="sm" variant="secondary" onClick={() => activate(l.id)} disabled={loading}>
                          Activate + Chain Proof
                        </Button>
                      )}
                      {l.status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => downloadPdf(l)}>
                          Download PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Licensing;
