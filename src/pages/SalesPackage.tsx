import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import B2BSalesPackageDownload from "@/components/B2BSalesPackageDownload";
import MeetingScheduler from "@/components/MeetingScheduler";

const SalesPackage: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [useCase, setUseCase] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const utms = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
    };
  }, []);

  useEffect(() => {
    const title = "TSMO Creator Sales Package | PDF";
    document.title = title;

    const ensureMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    ensureMeta(
      "description",
      "Download the TSMO Creator Sales Package: protect your art, stop AI scraping, automate takedowns, and monetize safely."
    );

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}/sales-package`;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email to receive the package." });
      return;
    }
    try {
      setSubmitting(true);
      const { error: insertError } = await supabase.from("leads").insert({
        source: "sales-package",
        name,
        company,
        email,
        use_case: useCase,
        consent: true,
        ...utms,
      });
      if (insertError) throw insertError;

      await supabase.functions.invoke("send-sales-package", {
        body: {
          name,
          email,
          source: "sales-package",
          link: `${window.location.origin}/sales-package?download=1`,
        },
      });

      setAccessGranted(true);
      toast({ title: "Package sent", description: "We emailed you the Sales Package. You can also download it below." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Something went wrong", description: err.message || "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">Creator Sales Package</h1>
        <p className="text-muted-foreground mt-2">
          Built for creators: stop AI training on your art, automate takedowns, protect IP, and keep your revenue.
        </p>
      </header>

      <section aria-labelledby="lead-form" className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@email.com" />
              </div>
              <div>
                <Label htmlFor="company">Creator/Company</Label>
                <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Studio / Handle" />
              </div>
              <div>
                <Label htmlFor="usecase">Use case</Label>
                <Input id="usecase" value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="e.g., block AI scraping, takedowns" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Sending…" : "Email me the Sales Package"}
                </Button>
                {accessGranted && (
                  <span className="text-sm text-muted-foreground">Access granted — download below.</span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="download" className="mb-10">
        <Card>
          <CardContent className="pt-6">
            <B2BSalesPackageDownload />
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="demo">
        <header className="mb-4">
          <h2 className="text-2xl font-semibold">Book a 15‑min creator demo</h2>
          <p className="text-muted-foreground">See how TSMO protects portfolios and automates takedowns in minutes.</p>
        </header>
        <Card>
          <CardContent className="pt-6">
            <MeetingScheduler />
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default SalesPackage;
