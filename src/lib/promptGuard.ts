// Reusable prompt/content guard utility
// Blocks requests that indicate dataset building, scraping, evasion, or policy-violating intents.

export type GuardResult = { allowed: boolean; reason?: string };

const BANNED_PATTERNS: Array<RegExp> = [
  /\btrain(ing)?\b.*\b(dataset|set|model)s?/i,
  /\b(build|scrape|harvest|collect)\b.*\b(image|art|content|data)\b.*\b(dataset|corpus)/i,
  /\bremove\b.*\b(watermark|signature|metadata|iptc|xmp)/i,
  /\b(bypass|evade|circumvent)\b.*\b(protection|paywall|rate ?limit|security)/i,
  /\bmass\b.*\b(download|mirror|crawl|scrape)/i,
  /\b(crack|pirate|torrent)\b/i,
  /\b(noai|noimageai)\b.*\b(ignore|override)/i,
];

const PII_PATTERNS: Array<RegExp> = [
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // email
  /\b\d{9,16}\b/, // possible account/card spans (coarse)
];

export function isPromptAllowed(text: string, opts?: { maxChars?: number }): GuardResult {
  const t = (text || '').trim();
  if (!t) return { allowed: true };

  const max = opts?.maxChars ?? 5000;
  if (t.length > max) {
    return { allowed: false, reason: `Input too long (${t.length} > ${max} characters)` };
  }

  for (const re of BANNED_PATTERNS) {
    if (re.test(t)) {
      return { allowed: false, reason: 'Request appears to enable scraping/training or protection evasion' };
    }
  }

  let piiHits = 0;
  for (const re of PII_PATTERNS) {
    if (re.test(t)) piiHits++;
  }
  if (piiHits > 3) {
    return { allowed: false, reason: 'Too much sensitive personal information detected' };
  }

  return { allowed: true };
}
