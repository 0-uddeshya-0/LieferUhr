// Deterministic, on-device extraction for PostAmt (order mails) and
// EinsatzAmt (service requests). Rules + lexicons, no network, no model —
// every extracted value is traceable to a span of the source text.

export interface CatalogItem {
  sku: string;
  name: string;
}

export interface ExtractedLine {
  sku?: string;        // set only when the line maps to a catalog item
  name: string;        // product text as written in the mail
  qty: number;
  matched: boolean;    // true when a catalog sku was found
}

export interface OrderExtraction {
  lines: ExtractedLine[];
  unresolved: string[]; // item-looking fragments that failed to parse
  confidence: number;   // matched / total lines (1 when nothing found)
}

const STOP_LINE =
  /^(hallo|guten tag|sehr geehrte|guten morgen|moin|hi\b|bitte|mit freundlichen|mfg|freundliche|grüße|gruss|viele grüße|beste grüße|danke|vielen dank|liebe|anfrag|bestellung an|betreff|re:|aw:|wg:)/i;

const QTY_RE =
  /(\d+[\.,]?\d*)\s*(x|×|stk\.?|stück|pal\.?|paletten?|kisten?|kartons?|säcke|sack|kg|l|liter|rollen?|kanister|eimer|bden\.?|böden|pakete?|posten|einheiten)?/i;

const SKU_RE = /\b([A-ZÄÖÜ]{2,5}-?\d{2,5})\b/;

const UMLAUTS: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => UMLAUTS[c])
    .replace(/\d+[\.,]?\d*\s*(kg|g|l|ml|liter|mm|cm|m)\b/g, ' ') // strip spec sizes like "25kg"
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text: string): Set<string> {
  return new Set(normalize(text).split(' ').filter((w) => w.length > 2));
}

// Score how well a free-text product name maps to a catalog entry:
// fraction of catalog name tokens found in the candidate's tokens.
function catalogScore(candidate: Set<string>, item: CatalogItem): number {
  const itemTokens = tokens(item.name);
  if (itemTokens.size === 0) return 0;
  let hit = 0;
  itemTokens.forEach((t) => {
    if (candidate.has(t)) hit += 1;
  });
  return hit / itemTokens.size;
}

function splitFragments(text: string): string[] {
  return text
    .split(/\r?\n/)
    .flatMap((line) => line.split(/[;•]|\s+–\s+|\s+-\s+/))
    .map((f) => f.trim())
    .filter((f) => f.length > 2 && !STOP_LINE.test(f) && !/^\d{5}/.test(f));
}

export function extractOrderLines(text: string, catalog: CatalogItem[]): OrderExtraction {
  const lines: ExtractedLine[] = [];
  const unresolved: string[] = [];

  for (const frag of splitFragments(text)) {
    // A fragment is a candidate when it carries a quantity or an SKU.
    const qtyMatch = frag.match(QTY_RE);
    const skuMatch = frag.match(SKU_RE);
    if (!qtyMatch && !skuMatch) continue;

    const qty = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : NaN;
    if (qtyMatch && (!Number.isFinite(qty) || qty <= 0 || qty > 100000)) {
      unresolved.push(frag);
      continue;
    }

    // Product text = fragment minus the qty token, SKU token and filler words.
    let name = frag;
    if (qtyMatch) name = name.replace(qtyMatch[0], ' ');
    if (skuMatch) name = name.replace(skuMatch[0], ' ');
    name = name
      .replace(/\b(bitte|pos\.?|position|art\.?-?nr\.?|artikel|bestellung|liefern|senden|benötigen|brauchen|noch|je|á|a)\b/gi, ' ')
      .replace(/[,().:]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!name && !skuMatch) {
      unresolved.push(frag);
      continue;
    }

    // Resolve catalog: explicit SKU wins, else best name-token score ≥ 0.6.
    let sku: string | undefined;
    if (skuMatch) {
      const wanted = skuMatch[1].replace('-', '').toUpperCase();
      const bySku = catalog.find((c) => c.sku.replace('-', '').toUpperCase() === wanted);
      if (bySku) sku = bySku.sku;
    }
    const candidateTokens = tokens(name);
    if (!sku && candidateTokens.size > 0) {
      let best: CatalogItem | undefined;
      let bestScore = 0;
      for (const item of catalog) {
        const score = catalogScore(candidateTokens, item);
        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      }
      if (best && bestScore >= 0.6) sku = best.sku;
    }

    lines.push({
      sku,
      name: name || sku || frag,
      qty: Number.isFinite(qty) ? qty : 1,
      matched: sku !== undefined,
    });
  }

  const total = lines.length + unresolved.length;
  return {
    lines,
    unresolved,
    confidence: total === 0 ? 1 : lines.filter((l) => l.matched).length / total,
  };
}

// ————— Service-request extraction (EinsatzAmt) —————

export type RequestUrgency = 'low' | 'high' | 'crit';

export interface RequestExtraction {
  urgency: RequestUrgency;
  device?: string;
  address?: string;
  window?: string;   // preferred time phrase as written
  summary: string;   // first informative sentence, capped
  confidence: number;
}

const DEVICES: [RegExp, string][] = [
  [/wärmepumpe/i, 'Wärmepumpe'],
  [/brennwert|therme|gasheizung|heizkessel/i, 'Gas-Brennwerttherme'],
  [/heizung|heizkörper|hkls?/i, 'Heizungsanlage'],
  [/klima|klimagerät|split/i, 'Klimaanlage'],
  [/lüftung|lüftungsanlage|rlt|lüftungsgerät/i, 'Lüftungsanlage'],
  [/durchlauferhitzer|boiler|warmwasser|warmwasserspeicher/i, 'Warmwasserbereitung'],
  [/fußbodenheizung|fbh/i, 'Fußbodenheizung'],
  [/sanitär|wc|toilette|wasserhahn|rohr/i, 'Sanitär'],
  [/solar|photovoltaik|pv-anlage/i, 'Solarthermie/PV'],
];

const URGENCY_CRIT =
  /notfall|sofort|dringend|eilig|ausfall|rohrbruch|wasserschaden|steht still|komplett aus|gar keine heizung|kein warmwasser|frieren|rauch|gasgeruch/i;
const URGENCY_HIGH =
  /defekt|fehler|störung|tropft|undicht|laut|funktioniert nicht|klemmt|geht nicht|ausgefallen|piept|riecht/i;

const ADDRESS_RE =
  /\b([A-ZÄÖÜ][\wäöüßÄÖÜ.-]*(?:straße|str\.|weg|gasse|platz|allee|ring|damm|chaussee|ufer)\s*\d{1,4}[a-z]?(?:\s*,?\s*\d{5}\s+[A-ZÄÖÜ][\wäöüß-]+)?)/;
const PLZ_CITY_RE = /\b(\d{5}\s+[A-ZÄÖÜ][\wäöüß-]+)\b/;

const WINDOW_RE =
  /\b(heute(?:\s+(?:noch|abend|vormittag|nachmittag))?|morgen(?:\s+(?:früh|vormittag|nachmittag|abend))?|übermorgen|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|nächste\s+woche|diese\s+woche|vormittags|nachmittags|ab\s+\d{1,2}\s*uhr|vor\s+\d{1,2}\s*uhr|zwischen\s+\d{1,2}[^,.]{0,20}uhr|\d{1,2}[:.]\d{2}\s*uhr|\d{1,2}\s*uhr)/i;

const SENDER_STOP = /^(hallo|guten tag|sehr geehrte|guten morgen|moin|hi\b|liebe|betreff|re:|aw:)/i;

export function extractServiceRequest(text: string): RequestExtraction {
  const urgency: RequestUrgency = URGENCY_CRIT.test(text) ? 'crit' : URGENCY_HIGH.test(text) ? 'high' : 'low';

  const device = DEVICES.find(([re]) => re.test(text))?.[1];

  const addrMatch = text.match(ADDRESS_RE) ?? text.match(PLZ_CITY_RE);
  const address = addrMatch?.[1]?.replace(/\s+/g, ' ').trim();

  const windowMatch = text.match(WINDOW_RE);
  const window = windowMatch?.[1]?.replace(/\s+/g, ' ').trim();

  // First informative sentence (skip greetings/sign-offs), capped at 120 chars.
  const sentences = text
    .split(/(?<=[.!?])\s+|\r?\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12 && !SENDER_STOP.test(s));
  let summary = sentences[0] ?? '';
  if (summary.length > 120) summary = `${summary.slice(0, 117)}…`;

  // Confidence: how many of the four field slots were filled.
  const slots = [device, address, window, summary.length > 0 ? 'x' : undefined];
  const confidence = slots.filter(Boolean).length / 4;

  return { urgency, device, address, window, summary, confidence };
}
