/**
 * Readable label for a server key we have no text for yet:
 * "critChance" → "Crit Chance", "MeleeDps" → "Melee Dps".
 */
export function humanize(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
