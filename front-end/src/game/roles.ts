import { t } from '../i18n';
import { humanize } from '../lib/humanize';

// Widened to an open lookup: a role id is a string from the server, not a known key.
const ROLE_LABELS: Partial<Record<string, string>> = t.roles;

/** "MeleeDps" → "Melee DPS". A new role from the server still gets a readable label. */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] ?? humanize(role);
}
