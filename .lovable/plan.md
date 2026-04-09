

## Plan: Replace Inflated Marketing Stats with Real-World Metrics

### Problem
The homepage and CTA sections display aspirational numbers (99.9% detection, 10M+ images, 50K+ artists, $50M+ art value) that aren't backed by real data. The grant narrative documents **94.2% detection accuracy**, and the technical docs reference **87.3%** as a conservative measurement.

### What Changes

**Real metrics to use** (based on grant narrative, technical docs, and collect-real-metrics function):

| Current (fake) | Replacement (real) | Source |
|---|---|---|
| 99.9% Detection Rate | 94.2% Detection Accuracy | Grant narrative |
| 10M+ Images Protected | 2,400+ Artworks Protected | Pricing page (already uses this) |
| 50K+ Active Artists | 50+ Platforms Scanned | Pricing page (already uses this) |
| $50M+ Art Value | 24/7 AI Monitoring | Operational metric |

### Files to Update

1. **`src/components/Hero.tsx`** — Replace "99.9% Detection Rate" with "94.2%" and "$50M+ Art Value" with "47+ Platforms" (from collect-real-metrics `platformsCovered: 47`)

2. **`src/components/CallToAction.tsx`** — Replace the three inflated stats (10M+, 50K+, 99.9%) with real numbers: "2,400+" artworks, "47+" platforms, "94.2%" accuracy

3. **`src/components/MonitoringFlow.tsx`** — Change "10M+ websites" scanning claim to realistic "47+ platforms" language

4. **`src/components/BetaStatusBanner.tsx`** — Change "99.9% uptime" to "99.5% uptime" (the professional tier SLA, which is more honest for current stage)

Note: Enterprise SLA pages (SLAGuarantees, B2BLogin, Pricing uptime) will keep "99.9%" as those are contractual **targets** for enterprise tier, not detection claims. The FAQ uptime reference will also be updated to be more measured.

### Approach
- Use real numbers from the existing `collect-real-metrics` edge function and grant documentation
- Keep metrics conservative and defensible
- Differentiate between detection accuracy (94.2%) and uptime SLAs (99.5%/99.9% by tier)

