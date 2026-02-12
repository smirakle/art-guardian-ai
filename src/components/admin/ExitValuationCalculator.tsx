import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Target, Shield, Handshake, Award } from "lucide-react";

const MILESTONES = [
  { id: "patent", label: "Patent Granted", multiplier: 1.5, category: "IP" },
  { id: "cai_listed", label: "Adobe CAI Ecosystem Listed", multiplier: 1.3, category: "Distribution" },
  { id: "adobe_exchange", label: "Adobe Exchange Partner", multiplier: 2.0, category: "Distribution" },
  { id: "ps_plugin", label: "Photoshop Plugin Live", multiplier: 1.8, category: "Distribution" },
  { id: "ai_plugin", label: "Illustrator Plugin Live", multiplier: 1.4, category: "Distribution" },
  { id: "eu_ai_act", label: "EU AI Act Compliance Certified", multiplier: 1.6, category: "Regulatory" },
  { id: "c2pa_signing", label: "C2PA Production Signing Active", multiplier: 1.5, category: "Technical" },
  { id: "rls_resolved", label: "RLS Security Warnings Resolved", multiplier: 1.2, category: "Technical" },
  { id: "1k_customers", label: "1,000+ Paying Customers", multiplier: 1.5, category: "Traction" },
  { id: "enterprise", label: "Enterprise Contract Signed", multiplier: 1.8, category: "Traction" },
  { id: "gov_contract", label: "Government Contract", multiplier: 2.0, category: "Traction" },
] as const;

const GROWTH_RATES = [10, 15, 20, 25, 30];
const BASE_MULTIPLE = 7.5;

const COMPARABLE_EXITS = [
  { company: "Figma", value: "$20B", acquirer: "Adobe", multiple: "50x ARR", year: 2022 },
  { company: "Canva", value: "$26B", acquirer: "Private", multiple: "40x ARR", year: 2024 },
  { company: "Shutterstock", value: "$4.3B", acquirer: "Public", multiple: "6x ARR", year: 2023 },
  { company: "Getty Images", value: "$4.8B", acquirer: "Public", multiple: "5x ARR", year: 2022 },
  { company: "Pixsy", value: "$50M", acquirer: "Private", multiple: "12x ARR", year: 2023 },
];

const PARTNERSHIPS = [
  { name: "Adobe", stages: ["Exploring", "CAI Listed", "Exchange Partner", "Embedded"], icon: Award },
  { name: "C2PA", stages: ["Member", "Implementer", "Certified", "Steering"], icon: Shield },
  { name: "Government", stages: ["Prospect", "Pilot", "Contract", "Preferred Vendor"], icon: Handshake },
];

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function logToArr(logVal: number): number {
  // Map 0-100 slider to $0-$100M with logarithmic feel
  if (logVal <= 0) return 0;
  return Math.round(Math.pow(10, (logVal / 100) * 8) / 100) * 100; // 0 to ~100M
}

export default function ExitValuationCalculator() {
  const [arrSlider, setArrSlider] = useState([25]); // log scale position
  const [growthRate, setGrowthRate] = useState(20);
  const [projectionYear, setProjectionYear] = useState(5);
  const [activeMilestones, setActiveMilestones] = useState<Set<string>>(new Set());
  const [partnershipStages, setPartnershipStages] = useState<Record<string, number>>({
    Adobe: 0,
    "C2PA": 1,
    Government: 0,
  });

  const currentARR = logToArr(arrSlider[0]);

  const milestoneMultiplier = useMemo(() => {
    let mult = 1;
    MILESTONES.forEach((m) => {
      if (activeMilestones.has(m.id)) mult *= m.multiplier;
    });
    return mult;
  }, [activeMilestones]);

  const partnershipMultiplier = useMemo(() => {
    let mult = 1;
    Object.entries(partnershipStages).forEach(([, stage]) => {
      mult *= 1 + stage * 0.15; // each stage adds 15%
    });
    return mult;
  }, [partnershipStages]);

  const projectedARR = useMemo(() => {
    return currentARR * Math.pow(1 + growthRate / 100, projectionYear);
  }, [currentARR, growthRate, projectionYear]);

  const effectiveMultiple = BASE_MULTIPLE * milestoneMultiplier * partnershipMultiplier;

  const baseValuation = projectedARR * effectiveMultiple;
  const bearValuation = baseValuation * 0.5;
  const bullValuation = baseValuation * 2.0;

  const chartData = useMemo(() => {
    return Array.from({ length: 11 }, (_, yr) => {
      const arr = currentARR * Math.pow(1 + growthRate / 100, yr);
      const base = arr * effectiveMultiple;
      return {
        year: `Y${yr}`,
        bear: Math.round(base * 0.5),
        base: Math.round(base),
        bull: Math.round(base * 2),
      };
    });
  }, [currentARR, growthRate, effectiveMultiple]);

  const toggleMilestone = (id: string) => {
    setActiveMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cyclePartnership = (name: string, maxStages: number) => {
    setPartnershipStages((prev) => ({
      ...prev,
      [name]: ((prev[name] || 0) + 1) % maxStages,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Headline Valuation */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            TSMO Projected Exit Valuation
          </CardTitle>
          <CardDescription>
            Year {projectionYear} · {growthRate}% annual growth · {activeMilestones.size} milestones achieved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-primary tracking-tight">{formatCurrency(baseValuation)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Base Case · {effectiveMultiple.toFixed(1)}x revenue multiple
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-sm">Bear Case</span>
              <Badge variant="outline" className="text-orange-500 border-orange-500/40 ml-auto text-xs">0.5x</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(bearValuation)}</p>
            <p className="text-xs text-muted-foreground mt-1">ARR: {formatCurrency(projectedARR)} · {(effectiveMultiple * 0.5).toFixed(1)}x</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 ring-1 ring-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Base Case</span>
              <Badge variant="outline" className="text-primary border-primary/40 ml-auto text-xs">1.0x</Badge>
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(baseValuation)}</p>
            <p className="text-xs text-muted-foreground mt-1">ARR: {formatCurrency(projectedARR)} · {effectiveMultiple.toFixed(1)}x</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-sm">Bull Case</span>
              <Badge variant="outline" className="text-green-500 border-green-500/40 ml-auto text-xs">2.0x</Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(bullValuation)}</p>
            <p className="text-xs text-muted-foreground mt-1">ARR: {formatCurrency(projectedARR)} · {(effectiveMultiple * 2).toFixed(1)}x</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ARR Slider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Current ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold mb-3">{formatCurrency(currentARR)}</p>
            <Slider
              value={arrSlider}
              onValueChange={setArrSlider}
              max={100}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>$0</span>
              <span>$100M</span>
            </div>
          </CardContent>
        </Card>

        {/* Growth Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Annual Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GROWTH_RATES.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setGrowthRate(rate)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    growthRate === rate
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projection Year */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Projection Year</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold mb-3">Year {projectionYear}</p>
            <Slider
              value={[projectionYear]}
              onValueChange={(v) => setProjectionYear(v[0])}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1 yr</span>
              <span>10 yr</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">10-Year Valuation Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="year" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v)}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="bull" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} strokeWidth={1.5} name="Bull" />
                <Area type="monotone" dataKey="base" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} name="Base" />
                <Area type="monotone" dataKey="bear" stroke="hsl(25, 95%, 53%)" fill="hsl(25, 95%, 53%)" fillOpacity={0.1} strokeWidth={1.5} name="Bear" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Milestones + Partnerships side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              Milestone Checklist
              <Badge variant="secondary">{milestoneMultiplier.toFixed(1)}x multiplier</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MILESTONES.map((m) => (
              <label key={m.id} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={activeMilestones.has(m.id)}
                  onCheckedChange={() => toggleMilestone(m.id)}
                />
                <span className="text-sm flex-1 group-hover:text-foreground text-muted-foreground transition-colors">
                  {m.label}
                </span>
                <Badge variant="outline" className="text-xs">{m.multiplier}x</Badge>
                <Badge variant="secondary" className="text-xs">{m.category}</Badge>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Partnerships + Comparables */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Partnership Status
                <Badge variant="secondary">{partnershipMultiplier.toFixed(2)}x multiplier</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {PARTNERSHIPS.map((p) => {
                const currentStage = partnershipStages[p.name] || 0;
                const Icon = p.icon;
                return (
                  <div key={p.name} className="space-y-2">
                    <button
                      onClick={() => cyclePartnership(p.name, p.stages.length)}
                      className="flex items-center gap-2 w-full text-left hover:bg-accent/50 rounded-md p-1 -m-1 transition-colors"
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{p.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">{p.stages[currentStage]}</Badge>
                    </button>
                    <Progress value={(currentStage / (p.stages.length - 1)) * 100} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Comparable Exits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {COMPARABLE_EXITS.map((c) => (
                  <div key={c.company} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                    <div>
                      <span className="font-medium">{c.company}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{c.acquirer} · {c.year}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{c.value}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{c.multiple}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
