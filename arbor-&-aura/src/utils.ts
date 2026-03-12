export function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  }
  return function() {
    hash = Math.imul(hash ^ (hash >>> 15), 1597334677);
    hash = Math.imul(hash ^ (hash >>> 15), 3812015801);
    return ((hash ^ (hash >>> 15)) >>> 0) / 4294967296;
  }
}
