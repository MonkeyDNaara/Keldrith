/**
 * URL params are strings: "7" → 7. Anything else ("abc", "-1", "1.5") → null.
 * Shared by every page under /characters/:characterId.
 */
export function parseCharacterId(param: string | undefined): number | null {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}
