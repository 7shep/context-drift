export function nameSimilarity(a: string, b: string): number {
  const left = normalizeName(a);
  const right = normalizeName(b);

  if (left.length === 0 || right.length === 0) {
    return 0;
  }
  if (left === right) {
    return 1;
  }

  const shorter = left.length <= right.length ? left : right;
  const longer = left.length > right.length ? left : right;
  const prefixScore = longer.startsWith(shorter) ? 0.85 + 0.15 * (shorter.length / longer.length) : 0;
  const editScore = 1 - levenshteinDistance(left, right) / Math.max(left.length, right.length);

  return roundSimilarity(Math.max(prefixScore, editScore));
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function levenshteinDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + substitutionCost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[b.length] ?? 0;
}

function roundSimilarity(value: number): number {
  return Math.round(value * 100) / 100;
}
