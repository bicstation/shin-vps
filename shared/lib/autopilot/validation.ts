export function validateArticle(text: string) {
  if (!text) return { ok: false, reason: 'EMPTY' };
  if (text.length < 1200) return { ok: false, reason: 'TOO_SHORT' };
  if (text.includes('AIとして')) return { ok: false, reason: 'AI_LEAK' };
  if (!text.includes('##')) return { ok: false, reason: 'NO_STRUCTURE' };

  return { ok: true };
}