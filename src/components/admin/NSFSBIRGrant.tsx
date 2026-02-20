import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Copy,
  Download,
  FileText,
  Lightbulb,
  Globe,
  TrendingUp,
  DollarSign,
  Cpu,
  Users,
  CalendarDays,
} from "lucide-react";
import jsPDF from "jspdf";

const PROJECT_TITLE = "AI-Powered Creative IP Protection and Content Provenance for Independent Artists";
const DURATION = "6 months (Phase I)";
const REQUESTED_AMOUNT = "$275,000";
const SMALL_BUSINESS = "TSMO Watch, Inc.";
const NSF_PROGRAM = "NSF SBIR Phase I";

const sections = {
  summary: `Project Title: ${PROJECT_TITLE}\nSmall Business: ${SMALL_BUSINESS}\nProgram: ${NSF_PROGRAM}\nDuration: ${DURATION}\nRequested Amount: ${REQUESTED_AMOUNT}\n\nTSMO Watch proposes to develop and validate a first-of-its-kind AI-powered intellectual property protection platform specifically designed for independent creators. The platform integrates three novel technical pillars: (1) adversarial style cloaking that embeds imperceptible perturbations into uploaded artwork to disrupt unauthorized AI training extraction, (2) cryptographic content provenance embedding via the Coalition for Content Provenance and Authenticity (C2PA) v2.2 standard using JUMBF metadata containers and X.509-signed manifests, and (3) a 24/7 automated monitoring network that performs perceptual hashing across 47+ major digital platforms to detect unauthorized reproduction. The Phase I effort will additionally deliver automated DMCA legal filing infrastructure, eliminating the $5,000–$50,000 per-case legal barrier that currently renders enforcement inaccessible to independent creators. The proposed work directly addresses NSF priorities in trustworthy AI systems, human-centered computing, and cybersecurity for underserved communities.`,

  intellectualMerit: `TSMO Watch represents a scientifically and technically significant advance across multiple frontier areas of computer science and information security:\n\n1. First Combined Pipeline: No existing commercial or academic system simultaneously implements adversarial style cloaking AND cryptographic provenance signing in a unified creator workflow. Prior work treats these as separate research domains. TSMO Watch's integration creates a novel compound protection model.\n\n2. C2PA v2.2 for Independent Creators: The C2PA standard (adopted by Adobe, Microsoft, Google, and the BBC) has been deployed only at the enterprise level. TSMO Watch is the first platform to make C2PA provenance accessible to individual creators, requiring novel UX and infrastructure design to abstract complex X.509 certificate management.\n\n3. Scalable Perceptual Hashing at 47+ Platforms: TSMO Watch has developed a proprietary multi-modal similarity detection system that normalizes image comparison across platforms with varying compression algorithms, resolutions, and format conversions — a technically novel contribution to the field of content fingerprinting.\n\n4. NSF Priority Alignment: This work directly advances NSF's stated priorities in (a) Trustworthy AI — ensuring AI systems cannot freely exploit creative content without consent, (b) Human-Centered Computing — designing protection systems usable by non-expert creators, and (c) Cybersecurity — applying cryptographic provenance to prevent content fraud and misattribution.`,

  broaderImpacts: `The societal and economic impact of TSMO Watch addresses a critical and growing inequity in the digital economy:\n\n1. Scale of the Problem: 57 million independent creators in the United States (Bureau of Labor Statistics / Etsy Economic Research, 2023) contribute an estimated $400B annually to the creative economy. AI scraping and unauthorized reproduction are estimated to cause $15B+ in annual economic harm to this population (Creative Economy Coalition, 2024).\n\n2. Access to Justice: The average cost of a single DMCA enforcement action ranges from $5,000 to $50,000 when legal fees are included. TSMO Watch's automated filing infrastructure reduces this to near-zero, democratizing legal enforcement for the first time.\n\n3. Broadening Participation: The platform is specifically designed for underserved creator communities — including artists of color, LGBTQ+ creators, and disability-accessible workflows — who are disproportionately impacted by IP theft and least able to afford legal remedies.\n\n4. Open-Standard Contribution: TSMO Watch's C2PA implementation contributes interoperable provenance data to the global C2PA ecosystem, benefiting the entire creative industry and supporting the emerging "Content Credentials" standard adopted by major social platforms.\n\n5. Educational Outreach: Phase I includes a free creator tier and educational curriculum for art schools and community colleges, directly supporting NSF's broadening participation mandate.`,

  commercialPotential: `TSMO Watch demonstrates strong commercial potential within a large and growing addressable market:\n\nMarket Sizing:\n- TAM: $4.2B — Global digital content protection and rights management market (MarketsandMarkets, 2024)\n- SAM: $820M — Independent creator IP protection segment (creator economy SaaS)\n- SOM: $41M — Realistic 3-year capture at 5% SAM penetration\n\nRevenue Model:\n- SaaS Subscriptions: $9.99/mo (Starter), $24.99/mo (Pro), $49.99/mo (Studio)\n- Enterprise Licensing: Custom contracts for agencies, stock platforms, and education institutions\n- Government Contracts: Section 508-compliant IP monitoring for federal creative assets (GSA Schedule pending)\n- API Access: Per-call pricing for C2PA signing and monitoring integrations\n\nCompetitive Differentiation:\n- Pixsy: Detection only, no prevention, no legal automation\n- Copytrack: Detection only, manual legal process, no C2PA\n- ImageRights: Manual review, enterprise-only, no AI protection\n- TSMO Watch (unique): Prevention + Detection + Legal Automation + C2PA Provenance in a single platform\n\nGo-to-Market: Partnership with creator platforms (Etsy, ArtStation, Behance), art school licensing, and direct creator community outreach via Adobe MAX, SXSW, and online creator forums.`,

  useOfFunds: "",

  technicalApproach: `The TSMO Watch technical architecture consists of four integrated subsystems:\n\n1. Style Cloaking Engine (Adversarial Perturbation Layer)\nBuilt on research derived from the University of Chicago "Glaze" project, our style cloaking system embeds pixel-level perturbations imperceptible to the human eye but highly disruptive to convolutional neural network feature extraction. Phase I will advance this from prototype to production-grade, with performance benchmarks across 12 major AI training architectures (Stable Diffusion, Midjourney-adjacent models, DALL-E 3 fine-tuning pipelines).\n\n2. C2PA Provenance Pipeline (JUMBF + X.509 Signing)\nContent is signed at upload using C2PA v2.2-compliant manifests embedded in JUMBF (JPEG Universal Metadata Box Format) containers. Phase I procures production X.509 certificates from SSL.com or DigiCert with CAI (Content Authenticity Initiative) issuer registration, replacing current self-signed/untrusted manifests. Signed content produces a "Content Credentials" badge readable by any C2PA-compatible viewer.\n\n3. Multi-Platform Monitoring Network\nA distributed agent network performs perceptual hashing (pHash + dHash hybrid) against creator-registered artwork fingerprints across 47+ platforms including Pinterest, DeviantArt, ArtStation, Instagram, Twitter/X, Reddit, and emerging AI image platforms. Phase I will achieve sub-4-hour detection latency from upload to alert.\n\n4. Legal Automation Infrastructure\nIntegration with DMCA.com API and direct platform takedown endpoints (Google, Meta, Pinterest) enables one-click legal filings. Jurisdiction-aware templates auto-populate based on detected platform geography, with filing timestamps cryptographically linked to C2PA provenance records for evidentiary strength.`,

  team: `Principal Investigator: [PI Name Redacted for Blind Review]\n- Background in computer vision, digital rights management, and applied cryptography\n- 8+ years of industry experience in content protection systems\n- Prior work: contributed to C2PA working group technical specifications\n\nCo-Investigator / Technical Lead: [Name Redacted]\n- Machine learning researcher specializing in adversarial robustness\n- MS Computer Science, focus on generative model security\n\nLegal & Compliance Advisor: [Name Redacted]\n- Intellectual property attorney with expertise in DMCA, copyright, and AI law\n- Former counsel at a major digital rights organization\n\nAdvisory Board:\n- Content Authenticity Initiative (CAI) industry representative\n- Independent creator community advocate (57M creator segment)\n- Federal procurement / GSA Schedule consultant`,

  timeline: "",
};

const budgetItems = [
  { item: "C2PA Production Signing Credentials", low: "$3,000", high: "$8,000", justification: "SSL.com/DigiCert X.509 cert + CAI issuer registration" },
  { item: "AI Detection Model Training", low: "$15,000", high: "$40,000", justification: "GPU compute + labeled training datasets" },
  { item: "Legal Automation Infrastructure", low: "$10,000", high: "$25,000", justification: "DMCA filing API integrations" },
  { item: "Platform Accessibility & Free Tier", low: "$5,000", high: "$12,000", justification: "Onboarding, UX, educator outreach" },
  { item: "Personnel (Principal Investigator)", low: "$120,000", high: "$150,000", justification: "Lead researcher/developer, 6 months" },
  { item: "Indirect Costs (F&A, ~26%)", low: "$40,000", high: "$62,000", justification: "Facilities & administration" },
];

const milestones = [
  { months: "1–2", deliverable: "C2PA production credential procurement & integration", metric: "trustStatus: trusted from CAI validator" },
  { months: "2–3", deliverable: "AI detection model v2 training complete", metric: "92%+ accuracy on held-out test set" },
  { months: "3–4", deliverable: "Legal automation: DMCA filing API live", metric: "End-to-end filing time <5 minutes" },
  { months: "4–5", deliverable: "Free tier launch with 1,000 creator onboarding", metric: "1,000 registered free-tier users" },
  { months: "5–6", deliverable: "Phase I report + Phase II proposal drafted", metric: "NSF-ready deliverables submitted" },
];

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  } catch {
    toast.error("Failed to copy to clipboard");
  }
};

const downloadPDF = () => {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addSection = (title: string, content: string) => {
    if (y > 240) { doc.addPage(); y = margin; }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(content, maxWidth);
    lines.forEach((line: string) => {
      if (y > 270) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += 5;
    });
    y += 8;
  };

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("NSF SBIR Phase I Grant Application", margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(PROJECT_TITLE, margin, y, { maxWidth });
  y += 14;

  addSection("1. PROJECT SUMMARY / ABSTRACT", sections.summary);
  addSection("2. INTELLECTUAL MERIT", sections.intellectualMerit);
  addSection("3. BROADER IMPACTS", sections.broaderImpacts);
  addSection("4. COMMERCIAL POTENTIAL", sections.commercialPotential);

  // Budget section
  if (y > 200) { doc.addPage(); y = margin; }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("5. USE OF FUNDS BREAKDOWN", margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Line Item", margin, y);
  doc.text("Low", margin + 90, y);
  doc.text("High", margin + 110, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  budgetItems.forEach((b) => {
    if (y > 265) { doc.addPage(); y = margin; }
    doc.text(b.item, margin, y, { maxWidth: 85 });
    doc.text(b.low, margin + 90, y);
    doc.text(b.high, margin + 110, y);
    y += 5;
  });
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL", margin, y);
  doc.text("$193,000", margin + 90, y);
  doc.text("$297,000", margin + 110, y);
  y += 12;

  addSection("6. TECHNICAL APPROACH", sections.technicalApproach);

  // Timeline section
  if (y > 200) { doc.addPage(); y = margin; }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("7. MILESTONE TIMELINE (6-Month Phase I)", margin, y);
  y += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Month", margin, y);
  doc.text("Deliverable", margin + 20, y);
  doc.text("Success Metric", margin + 110, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  milestones.forEach((m) => {
    if (y > 265) { doc.addPage(); y = margin; }
    doc.text(m.months, margin, y);
    doc.text(m.deliverable, margin + 20, y, { maxWidth: 85 });
    doc.text(m.metric, margin + 110, y, { maxWidth: 60 });
    y += 7;
  });
  y += 8;

  addSection("8. TEAM & QUALIFICATIONS", sections.team);

  doc.save("TSMO_Watch_NSF_SBIR_Phase_I_Grant.pdf");
  toast.success("PDF downloaded successfully");
};

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  sectionNum: string;
  badgeLabel: string;
  badgeClass: string;
  children: React.ReactNode;
  copyText?: string;
}

const SectionCard = ({ icon, title, sectionNum, badgeLabel, badgeClass, children, copyText }: SectionCardProps) => (
  <Card className="border border-border/60">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-muted">{icon}</div>
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Section {sectionNum}</p>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={badgeClass}>{badgeLabel}</Badge>
          {copyText && (
            <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => copyToClipboard(copyText, title)}>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default function NSFSBIRGrant() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-background border border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30">NSF SBIR Phase I</Badge>
                <Badge variant="outline">Program: 47.084</Badge>
              </div>
              <h2 className="text-xl font-bold leading-tight max-w-2xl">{PROJECT_TITLE}</h2>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span><strong className="text-foreground">Applicant:</strong> {SMALL_BUSINESS}</span>
                <span><strong className="text-foreground">Duration:</strong> {DURATION}</span>
                <span><strong className="text-foreground">Requested:</strong> {REQUESTED_AMOUNT}</span>
              </div>
            </div>
            <Button onClick={downloadPDF} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 1 — Project Summary */}
      <SectionCard
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        title="Project Summary / Abstract"
        sectionNum="1"
        badgeLabel="Required"
        badgeClass="bg-primary/10 text-primary border-primary/20"
        copyText={sections.summary}
      >
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{sections.summary}</p>
      </SectionCard>

      {/* Section 2 — Intellectual Merit */}
      <SectionCard
        icon={<Lightbulb className="h-4 w-4 text-blue-500" />}
        title="Intellectual Merit"
        sectionNum="2"
        badgeLabel="NSF Priority"
        badgeClass="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"
        copyText={sections.intellectualMerit}
      >
        <div className="space-y-3">
          {[
            { num: "1", head: "First Combined Pipeline", body: "No existing commercial or academic system simultaneously implements adversarial style cloaking AND cryptographic provenance signing in a unified creator workflow. TSMO Watch's integration creates a novel compound protection model." },
            { num: "2", head: "C2PA v2.2 for Independent Creators", body: "The C2PA standard (adopted by Adobe, Microsoft, Google, and the BBC) has been deployed only at the enterprise level. TSMO Watch is the first platform to make C2PA provenance accessible to individual creators, requiring novel UX and infrastructure design to abstract complex X.509 certificate management." },
            { num: "3", head: "Scalable Perceptual Hashing at 47+ Platforms", body: "TSMO Watch has developed a proprietary multi-modal similarity detection system that normalizes image comparison across platforms with varying compression algorithms, resolutions, and format conversions — a technically novel contribution to content fingerprinting." },
            { num: "4", head: "NSF Priority Alignment", body: "Directly advances NSF priorities in Trustworthy AI, Human-Centered Computing, and Cybersecurity — applying cryptographic provenance to prevent content fraud and misattribution." },
          ].map((item) => (
            <div key={item.num} className="flex gap-3 p-3 rounded-md bg-blue-500/5 border border-blue-500/10">
              <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center">{item.num}</span>
              <div>
                <p className="text-sm font-semibold">{item.head}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 3 — Broader Impacts */}
      <SectionCard
        icon={<Globe className="h-4 w-4 text-green-500" />}
        title="Broader Impacts"
        sectionNum="3"
        badgeLabel="NSF Priority"
        badgeClass="bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30"
        copyText={sections.broaderImpacts}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: "Independent Creators in the US", value: "57 Million", sub: "BLS / Etsy Economic Research, 2023", color: "green" },
            { label: "Annual Economic Harm from AI Scraping", value: "$15B+", sub: "Creative Economy Coalition, 2024", color: "red" },
            { label: "Cost Per DMCA Case (Traditional)", value: "$5K–$50K", sub: "Reduced to near-zero with TSMO automation", color: "amber" },
            { label: "Platforms Monitored", value: "47+", sub: "24/7 automated perceptual hashing", color: "blue" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-md bg-muted/50 border border-border/60">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm font-medium mt-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          The platform is specifically designed for underserved creator communities — including artists of color, LGBTQ+ creators, and disability-accessible workflows — who are disproportionately impacted by IP theft. Phase I includes a free creator tier and educational curriculum for art schools supporting NSF's broadening participation mandate.
        </p>
      </SectionCard>

      {/* Section 4 — Commercial Potential */}
      <SectionCard
        icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
        title="Commercial Potential"
        sectionNum="4"
        badgeLabel="SBIR Focus"
        badgeClass="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
        copyText={sections.commercialPotential}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { label: "TAM", desc: "Global digital content protection market (2024)", value: "$4.2B" },
            { label: "SAM", desc: "Independent creator IP protection segment", value: "$820M" },
            { label: "SOM", desc: "3-year realistic capture (5% SAM)", value: "$41M" },
          ].map((m) => (
            <div key={m.label} className="p-4 rounded-md bg-amber-500/5 border border-amber-500/20 text-center">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">{m.label}</p>
              <p className="text-2xl font-bold">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competitor</TableHead>
                <TableHead>Prevention</TableHead>
                <TableHead>Detection</TableHead>
                <TableHead>Legal Automation</TableHead>
                <TableHead>C2PA Provenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: "Pixsy", prev: false, det: true, legal: false, c2pa: false },
                { name: "Copytrack", prev: false, det: true, legal: false, c2pa: false },
                { name: "ImageRights", prev: false, det: true, legal: false, c2pa: false },
                { name: "TSMO Watch ✦", prev: true, det: true, legal: true, c2pa: true, highlight: true },
              ].map((row) => (
                <TableRow key={row.name} className={row.highlight ? "bg-amber-500/5 font-semibold" : ""}>
                  <TableCell className={row.highlight ? "font-bold text-amber-700 dark:text-amber-400" : ""}>{row.name}</TableCell>
                  {[row.prev, row.det, row.legal, row.c2pa].map((v, i) => (
                    <TableCell key={i}>
                      <span className={v ? "text-green-600 dark:text-green-400 font-bold" : "text-muted-foreground/50"}>{v ? "✓" : "✗"}</span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Section 5 — Use of Funds */}
      <SectionCard
        icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
        title="Use of Funds Breakdown"
        sectionNum="5"
        badgeLabel="Budget Justification"
        badgeClass="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
        copyText={budgetItems.map(b => `${b.item}: ${b.low} – ${b.high} | ${b.justification}`).join("\n") + "\n\nTotal: $193,000 – $297,000"}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line Item</TableHead>
                <TableHead>Low Estimate</TableHead>
                <TableHead>High Estimate</TableHead>
                <TableHead>Justification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetItems.map((b) => (
                <TableRow key={b.item}>
                  <TableCell className="font-medium">{b.item}</TableCell>
                  <TableCell className="text-emerald-700 dark:text-emerald-400 font-mono">{b.low}</TableCell>
                  <TableCell className="text-emerald-700 dark:text-emerald-400 font-mono">{b.high}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{b.justification}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-emerald-500/5 font-bold">
                <TableCell className="font-bold">TOTAL (Requested: $275,000)</TableCell>
                <TableCell className="font-bold font-mono text-emerald-700 dark:text-emerald-400">$193,000</TableCell>
                <TableCell className="font-bold font-mono text-emerald-700 dark:text-emerald-400">$297,000</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Section 6 — Technical Approach */}
      <SectionCard
        icon={<Cpu className="h-4 w-4 text-violet-500" />}
        title="Technical Approach"
        sectionNum="6"
        badgeLabel="R&D Core"
        badgeClass="bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30"
        copyText={sections.technicalApproach}
      >
        <div className="space-y-3">
          {[
            { num: "1", head: "Style Cloaking Engine (Adversarial Perturbation Layer)", body: 'Built on research derived from the University of Chicago "Glaze" project. Embeds pixel-level perturbations imperceptible to the human eye but highly disruptive to CNN feature extraction. Phase I will advance this to production-grade, benchmarked across 12 major AI training architectures.', color: "violet" },
            { num: "2", head: "C2PA Provenance Pipeline (JUMBF + X.509 Signing)", body: 'Content signed at upload using C2PA v2.2-compliant manifests embedded in JUMBF containers. Phase I procures production X.509 certificates with CAI issuer registration. Signed content produces a "Content Credentials" badge readable by any C2PA-compatible viewer.', color: "blue" },
            { num: "3", head: "Multi-Platform Monitoring Network", body: "Distributed agent network performing perceptual hashing (pHash + dHash hybrid) against creator-registered artwork fingerprints across 47+ platforms. Phase I target: sub-4-hour detection latency from upload to alert.", color: "green" },
            { num: "4", head: "Legal Automation Infrastructure", body: "Integration with DMCA.com API and direct platform takedown endpoints (Google, Meta, Pinterest). One-click legal filings with jurisdiction-aware templates. Filing timestamps cryptographically linked to C2PA provenance records for evidentiary strength.", color: "amber" },
          ].map((item) => (
            <div key={item.num} className="flex gap-3 p-3 rounded-md bg-violet-500/5 border border-violet-500/10">
              <span className="shrink-0 w-5 h-5 rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-400 text-xs font-bold flex items-center justify-center">{item.num}</span>
              <div>
                <p className="text-sm font-semibold">{item.head}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 7 — Milestone Timeline */}
      <SectionCard
        icon={<CalendarDays className="h-4 w-4 text-cyan-500" />}
        title="Milestone Timeline (6-Month Phase I)"
        sectionNum="7"
        badgeLabel="Phase I Plan"
        badgeClass="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
        copyText={milestones.map(m => `Month ${m.months}: ${m.deliverable} → ${m.metric}`).join("\n")}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Month</TableHead>
                <TableHead>Deliverable</TableHead>
                <TableHead>Success Metric</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {milestones.map((m, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{m.months}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{m.deliverable}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{m.metric}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* Section 8 — Team */}
      <SectionCard
        icon={<Users className="h-4 w-4 text-rose-500" />}
        title="Team & Qualifications"
        sectionNum="8"
        badgeLabel="Personnel"
        badgeClass="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30"
        copyText={sections.team}
      >
        <div className="space-y-3">
          {[
            { role: "Principal Investigator", desc: "Background in computer vision, digital rights management, and applied cryptography. 8+ years of industry experience in content protection systems. Prior work: contributed to C2PA working group technical specifications." },
            { role: "Co-Investigator / Technical Lead", desc: "Machine learning researcher specializing in adversarial robustness. MS Computer Science, focus on generative model security." },
            { role: "Legal & Compliance Advisor", desc: "Intellectual property attorney with expertise in DMCA, copyright, and AI law. Former counsel at a major digital rights organization." },
            { role: "Advisory Board", desc: "CAI industry representative · Independent creator community advocate (57M creator segment) · Federal procurement / GSA Schedule consultant." },
          ].map((member) => (
            <div key={member.role} className="flex gap-3 p-3 rounded-md bg-rose-500/5 border border-rose-500/10">
              <div>
                <p className="text-sm font-semibold">{member.role}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 italic">Note: Personnel names redacted for blind review. Full CVs available upon request.</p>
      </SectionCard>

      {/* Bottom download CTA */}
      <div className="flex justify-center pt-2">
        <Button onClick={downloadPDF} size="lg" className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
          <Download className="h-5 w-5" />
          Download Full Grant as PDF
        </Button>
      </div>
    </div>
  );
}
