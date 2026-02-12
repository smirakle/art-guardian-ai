import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield, FileCheck, Eye, AlertTriangle, BookOpen, Users,
  Server, Lock, Globe, CheckCircle2, Clock, XCircle
} from "lucide-react";

type Status = "done" | "partial" | "not_started";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  status: Status;
  tsmoEvidence?: string;
}

interface ChecklistCategory {
  title: string;
  icon: React.ReactNode;
  description: string;
  items: ChecklistItem[];
}

const initialCategories: ChecklistCategory[] = [
  {
    title: "Transparency Obligations (Art. 50)",
    icon: <Eye className="h-5 w-5" />,
    description: "AI-generated and AI-manipulated content must be disclosed to users.",
    items: [
      {
        id: "t1",
        label: "Content credential labeling on AI-generated outputs",
        description: "All AI-processed content must carry machine-readable provenance.",
        status: "done",
        tsmoEvidence: "C2PA ES256 manifest signing + JUMBF embedding in JPEG/PNG via edge functions.",
      },
      {
        id: "t2",
        label: "Human-readable disclosure of AI involvement",
        description: "Users must be informed when content has been generated or manipulated by AI.",
        status: "done",
        tsmoEvidence: "Content Credentials badge shown in upload UI; expandable technical details section.",
      },
      {
        id: "t3",
        label: "Machine-readable metadata for downstream systems",
        description: "Provenance data must be parseable by other platforms in the content supply chain.",
        status: "done",
        tsmoEvidence: "JUMBF-embedded C2PA manifests in ISO 19566-5 format, readable by any C2PA validator.",
      },
      {
        id: "t4",
        label: "Deep fake / synthetic media detection labeling",
        description: "Systems that generate or manipulate images/video resembling real people must label outputs.",
        status: "partial",
        tsmoEvidence: "AI detection scanning exists but explicit synthetic media labels not yet surfaced to end users.",
      },
    ],
  },
  {
    title: "Risk Classification & Registration (Art. 6, 49)",
    icon: <AlertTriangle className="h-5 w-5" />,
    description: "AI systems must be classified by risk tier and registered in the EU database.",
    items: [
      {
        id: "r1",
        label: "Formal risk tier self-assessment completed",
        description: "Document whether TSMO is minimal, limited, or high-risk under Annex III.",
        status: "not_started",
      },
      {
        id: "r2",
        label: "Registration in EU AI database (if required)",
        description: "High-risk systems must be registered before market placement in the EU.",
        status: "not_started",
      },
      {
        id: "r3",
        label: "Conformity assessment procedure documented",
        description: "Document the assessment procedure appropriate to the risk classification.",
        status: "partial",
        tsmoEvidence: "C2PA Conformance evidence tooling built at /admin/c2pa-conformance; full EU-specific assessment pending.",
      },
    ],
  },
  {
    title: "Technical Documentation (Art. 11)",
    icon: <FileCheck className="h-5 w-5" />,
    description: "Comprehensive technical documentation must be maintained and kept up to date.",
    items: [
      {
        id: "d1",
        label: "System architecture & design specification",
        description: "Document the overall system architecture, data flows, and AI components.",
        status: "done",
        tsmoEvidence: "Security Architecture export in C2PA Conformance page; system design documented.",
      },
      {
        id: "d2",
        label: "Training data provenance & governance records",
        description: "If using AI models, document training data sources and data governance practices.",
        status: "partial",
        tsmoEvidence: "AI Training Protection module tracks datasets; formal governance records not yet compiled.",
      },
      {
        id: "d3",
        label: "Algorithm description & decision-making logic",
        description: "Document how AI components make decisions (detection, matching, threat scoring).",
        status: "not_started",
      },
      {
        id: "d4",
        label: "Performance metrics & validation results",
        description: "Document accuracy, precision, recall, and other validation metrics for AI components.",
        status: "not_started",
      },
    ],
  },
  {
    title: "Data Governance (Art. 10)",
    icon: <Server className="h-5 w-5" />,
    description: "Data used in AI systems must be governed with clear policies and safeguards.",
    items: [
      {
        id: "g1",
        label: "Data collection and processing policies documented",
        description: "Clear policies on what data is collected, how it's processed, and retention periods.",
        status: "done",
        tsmoEvidence: "Privacy Policy at /privacy-policy; Terms of Service at /terms-of-service.",
      },
      {
        id: "g2",
        label: "Bias monitoring & mitigation procedures",
        description: "Processes to detect and mitigate bias in AI-driven decisions.",
        status: "not_started",
      },
      {
        id: "g3",
        label: "Data quality assurance framework",
        description: "Ensure training and operational data meets quality standards.",
        status: "not_started",
      },
    ],
  },
  {
    title: "Human Oversight (Art. 14)",
    icon: <Users className="h-5 w-5" />,
    description: "AI systems must allow meaningful human oversight of automated decisions.",
    items: [
      {
        id: "h1",
        label: "Human review of AI-flagged copyright matches",
        description: "Users can review, approve, or dismiss AI-detected matches before action is taken.",
        status: "done",
        tsmoEvidence: "All copyright matches require manual review; DMCA notices are user-initiated, not automated.",
      },
      {
        id: "h2",
        label: "Override capability for automated decisions",
        description: "Users must be able to override or correct AI system outputs.",
        status: "done",
        tsmoEvidence: "Mark as authorized, dismiss, or reclassify threat level on any detection result.",
      },
      {
        id: "h3",
        label: "Documented escalation procedures",
        description: "Clear process for escalating AI decisions that require expert human judgment.",
        status: "partial",
        tsmoEvidence: "Live support chat and admin escalation exist; formal documented procedure pending.",
      },
    ],
  },
  {
    title: "Cybersecurity & Robustness (Art. 15)",
    icon: <Lock className="h-5 w-5" />,
    description: "AI systems must be resilient against attacks and maintain accuracy under adversarial conditions.",
    items: [
      {
        id: "s1",
        label: "Cryptographic integrity of AI outputs",
        description: "AI-generated content credentials must be tamper-evident.",
        status: "done",
        tsmoEvidence: "ES256 (ECDSA P-256) COSE Sign1 envelopes; manifest hash stored in c2pa_signing_logs.",
      },
      {
        id: "s2",
        label: "Row-level security on all user data",
        description: "Database access controls must prevent unauthorized data access.",
        status: "partial",
        tsmoEvidence: "RLS enabled on core tables; 284 security warnings remain to be resolved.",
      },
      {
        id: "s3",
        label: "Adversarial robustness testing",
        description: "Test AI components against adversarial inputs and document results.",
        status: "not_started",
      },
      {
        id: "s4",
        label: "Incident response plan for AI failures",
        description: "Documented plan for responding to AI system failures or security incidents.",
        status: "not_started",
      },
    ],
  },
  {
    title: "Record-Keeping & Audit Trail (Art. 12)",
    icon: <BookOpen className="h-5 w-5" />,
    description: "AI system activities must be logged with sufficient detail for post-hoc auditing.",
    items: [
      {
        id: "a1",
        label: "C2PA signing audit trail",
        description: "Every manifest signing event must be logged with user, file, algorithm, and hash.",
        status: "done",
        tsmoEvidence: "c2pa_signing_logs table records all signing events with full metadata.",
      },
      {
        id: "a2",
        label: "AI detection activity logging",
        description: "All AI detection scans and results must be logged for accountability.",
        status: "done",
        tsmoEvidence: "ai_detection_results, ai_threat_detections, and ai_protection_audit_log tables.",
      },
      {
        id: "a3",
        label: "User action audit trail",
        description: "Track user interactions with AI system outputs for compliance auditing.",
        status: "done",
        tsmoEvidence: "ai_protection_audit_log tracks actions, resource types, IPs, and timestamps.",
      },
    ],
  },
  {
    title: "EU Market Placement (Art. 16, 49)",
    icon: <Globe className="h-5 w-5" />,
    description: "Requirements for placing AI systems on the EU market.",
    items: [
      {
        id: "m1",
        label: "Authorized representative appointed in EU",
        description: "Non-EU providers must designate an authorized representative in the EU.",
        status: "not_started",
      },
      {
        id: "m2",
        label: "CE marking (if high-risk)",
        description: "High-risk AI systems must bear CE marking before EU market placement.",
        status: "not_started",
      },
      {
        id: "m3",
        label: "EU Declaration of Conformity drafted",
        description: "Written declaration that the AI system meets EU AI Act requirements.",
        status: "not_started",
      },
    ],
  },
];

const statusConfig: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  done: { label: "Done", color: "bg-green-500/10 text-green-400 border-green-500/30", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  partial: { label: "In Progress", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: <Clock className="h-3.5 w-3.5" /> },
  not_started: { label: "Not Started", color: "bg-red-500/10 text-red-400 border-red-500/30", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const EUAIActCompliance = () => {
  const [categories, setCategories] = useState(initialCategories);

  const allItems = categories.flatMap((c) => c.items);
  const doneCount = allItems.filter((i) => i.status === "done").length;
  const partialCount = allItems.filter((i) => i.status === "partial").length;
  const totalCount = allItems.length;
  const progressPercent = Math.round(((doneCount + partialCount * 0.5) / totalCount) * 100);

  const cycleStatus = (catIndex: number, itemIndex: number) => {
    setCategories((prev) => {
      const next = [...prev];
      const cat = { ...next[catIndex], items: [...next[catIndex].items] };
      const item = { ...cat.items[itemIndex] };
      const order: Status[] = ["not_started", "partial", "done"];
      item.status = order[(order.indexOf(item.status) + 1) % 3];
      cat.items[itemIndex] = item;
      next[catIndex] = cat;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-400" />
            EU AI Act Compliance Tracker
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Track TSMO's readiness for EU AI Act certification. Enforcement begins February 2, 2025 (prohibitions) with full application by August 2, 2026.
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1.5 font-bold border-blue-500/30 text-blue-400">
          {progressPercent}%
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Overall Compliance Readiness</span>
            <span className="font-medium">{doneCount} of {totalCount} requirements met</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span><strong>{doneCount}</strong> Complete</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span><strong>{partialCount}</strong> In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span><strong>{totalCount - doneCount - partialCount}</strong> Not Started</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {categories.map((cat, catIdx) => {
          const catDone = cat.items.filter((i) => i.status === "done").length;
          const catTotal = cat.items.length;
          return (
            <Card key={cat.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {cat.icon}
                    {cat.title}
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {catDone}/{catTotal}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{cat.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {cat.items.map((item, itemIdx) => {
                  const sc = statusConfig[item.status];
                  return (
                    <div
                      key={item.id}
                      className="rounded-md border p-3 space-y-1.5 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => cycleStatus(catIdx, itemIdx)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={item.status === "done"}
                          className="mt-0.5"
                          onCheckedChange={() => cycleStatus(catIdx, itemIdx)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{item.label}</span>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sc.color} flex items-center gap-1`}>
                              {sc.icon}
                              {sc.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          {item.tsmoEvidence && (
                            <p className="text-xs text-blue-400/80 mt-1 italic">
                              ✓ TSMO: {item.tsmoEvidence}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">EU AI Act Enforcement Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            {[
              { date: "Feb 2, 2025", label: "Prohibited AI practices ban", status: "active" as const },
              { date: "Aug 2, 2025", label: "GPAI model rules apply", status: "upcoming" as const },
              { date: "Aug 2, 2026", label: "Full high-risk AI obligations", status: "upcoming" as const },
              { date: "Aug 2, 2027", label: "Annex I product rules", status: "upcoming" as const },
            ].map((milestone) => (
              <div
                key={milestone.date}
                className={`rounded-lg border p-3 text-center ${
                  milestone.status === "active"
                    ? "border-yellow-500/40 bg-yellow-500/5"
                    : "border-border/50"
                }`}
              >
                <p className="font-bold">{milestone.date}</p>
                <p className="text-xs text-muted-foreground mt-1">{milestone.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EUAIActCompliance;
