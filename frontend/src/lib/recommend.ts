import type { Database } from "@/integrations/supabase/types";
type EventRow = Database["public"]["Tables"]["events"]["Row"];

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "in", "at", "of", "and", "or", "to", "for",
  "with", "on", "by", "from", "as", "be", "this", "that", "it", "its",
  "are", "was", "were", "been", "being", "have", "has", "had", "do",
  "does", "did", "will", "would", "could", "should", "may", "might",
  "shall", "can", "need", "dare", "ought", "used", "about", "into",
  "over", "after", "before", "between", "under", "above", "below",
  "up", "down", "out", "off", "all", "each", "every", "both", "few",
  "more", "most", "other", "some", "such", "no", "nor", "not", "only",
  "own", "same", "so", "than", "too", "very", "just", "because",
  "but", "if", "though", "while", "how", "what", "when", "where",
  "which", "who", "whom", "why", "any", "your", "our", "their", "his",
  "her", "my", "me", "we", "us", "they", "them", "he", "she", "featuring",
]);

const MIN_SCORE = 0.05;

function stem(w: string): string {
  if (w.length <= 3) return w;
  if (w.endsWith("sses") || w.endsWith("xes") || w.endsWith("shes") || w.endsWith("ches")) return w.slice(0, -2);
  if (w.endsWith("ization")) return w.slice(0, -5) + "e";
  if (w.endsWith("tions")) return w.slice(0, -2);
  if (w.endsWith("tion")) return w.slice(0, -3) + "t";
  if (w.endsWith("ments")) return w.slice(0, -1);
  if (w.endsWith("ment")) return w.slice(0, -4);
  if (w.endsWith("ings")) return w.slice(0, -3);
  if (w.endsWith("ning")) return w.slice(0, -3);
  if (w.endsWith("ing")) { const b = w.slice(0, -3); if (b.length > 2) return b; }
  if (w.endsWith("ized") || w.endsWith("ises")) return w.slice(0, -3) + "e";
  if (w.endsWith("ised")) return w.slice(0, -3) + "e";
  if (w.endsWith("ied")) return w.slice(0, -3) + "y";
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.endsWith("edly")) return w.slice(0, -4);
  if (w.endsWith("ingly")) return w.slice(0, -5);
  if (w.endsWith("edly")) return w.slice(0, -4);
  if (w.endsWith("ing")) return w.slice(0, -3);
  if (w.endsWith("ed")) { const b = w.slice(0, -2); if (b.length > 2) return b; }
  if (w.endsWith("ly")) return w.slice(0, -2);
  if (w.endsWith("ness")) return w.slice(0, -4);
  if (w.endsWith("ful")) return w.slice(0, -3);
  if (w.endsWith("es")) { const b = w.slice(0, -2); if (b.length > 2) return b; }
  if (w.endsWith("e")) { const b = w.slice(0, -1); if (b.length > 2) return b; }
  if (w.endsWith("s") && !w.endsWith("ss")) { const b = w.slice(0, -1); if (b.length > 2) return b; }
  return w;
}

function tokenize(text: string): string[] {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
      .map((t) => stem(t))
  )];
}

function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) {
    tf.set(t, (tf.get(t) ?? 0) + 1);
  }
  const len = tokens.length || 1;
  for (const [k, v] of tf) {
    tf.set(k, v / len);
  }
  return tf;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  const allKeys = new Set([...a.keys(), ...b.keys()]);
  let dot = 0, normA = 0, normB = 0;
  for (const k of allKeys) {
    const va = a.get(k) ?? 0;
    const vb = b.get(k) ?? 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function recommendEventsLocally(
  interests: string[],
  events: EventRow[],
  topN = 9,
): (EventRow & { score: number })[] {
  if (!interests.length || !events.length) return [];

  const userText = interests.join(" ");
  const userTokens = tokenize(userText);
  const userTf = termFrequency(userTokens);

  const scored = events
    .map((event) => {
      const eventText = [
        event.title,
        event.description,
        event.category,
        ...(Array.isArray(event.tags) ? event.tags : []),
        event.venue,
        event.eligibility,
      ]
        .filter(Boolean)
        .join(" ");
      const eventTokens = tokenize(eventText);
      const eventTf = termFrequency(eventTokens);
      const score = cosineSimilarity(userTf, eventTf);
      return { ...event, score };
    })
    .filter((e) => e.score >= MIN_SCORE && hasKeywordMatch(interests, e))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored;
}

export function extractInterestKeywords(interests: string[]): string[] {
  return tokenize(interests.join(" "));
}

export function hasKeywordMatch(interests: string[], event: EventRow): boolean {
  if (!interests.length) return false;
  const interestTokens = tokenize(interests.join(" "));
  if (!interestTokens.length) return false;
  const eventText = [
    event.title,
    event.description,
    event.category,
    ...(Array.isArray(event.tags) ? event.tags : []),
    event.venue,
    event.eligibility,
  ]
    .filter(Boolean)
    .join(" ");
  const eventTokens = tokenize(eventText);
  return interestTokens.some((t) => eventTokens.includes(t));
}

export function filterRecommendations(
  recs: (EventRow & { score: number })[],
  interests: string[],
  topN = 9,
): (EventRow & { score: number })[] {
  if (!interests.length) return [];
  return recs
    .filter((r) => r.score >= MIN_SCORE && hasKeywordMatch(interests, r))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
