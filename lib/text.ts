// Small text helpers shared across pages that build sentences around a
// dynamic game name (e.g. "How do I set up a Rust server?" vs "...set up
// an Enshrouded server?").

// Returns "a" or "an" for the indefinite article that should precede
// `word`. A first-letter vowel check -- not a full English phonetic
// analyzer, but correct for every game name on this site today, including
// acronym-led ones like "ARK: Survival Evolved" and "SCP: Secret
// Laboratory" (both read naturally with a leading consonant sound here).
export function article(word: string): "a" | "an" {
  return /^[aeiouAEIOU]/.test(word) ? "an" : "a";
}
