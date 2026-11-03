import { BowArrow, Gem, HandFist, Sparkles, Sword, type LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';

/**
 * Visual identity of a class. Name, description and stats come from the server (ClassDto);
 * the front-end only adds what the server does not know: icon and color.
 */
export interface ClassVisual {
  Icon: LucideIcon;
}

/** Inline style that may also set CSS custom properties (e.g. --class-color). */
export type CSSVariables = CSSProperties & Record<`--${string}`, string>;

// Partial: a lookup can miss (new class from the server) – TypeScript forces us to handle it.
const CLASS_VISUALS: Partial<Record<string, ClassVisual>> = {
  warrior: { Icon: Sword },
  ranger: { Icon: BowArrow },
  monk: { Icon: HandFist },
  priest: { Icon: Sparkles },
};

const FALLBACK_VISUAL: ClassVisual = { Icon: Gem };

/** Keeps only characters that are safe in a CSS variable name ("Warrior " → "warrior"). */
function toSlug(classId: string): string {
  return classId.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

/** Icon for a class id; unknown ids get the generic fallback icon. */
export function getClassVisual(classId: string): ClassVisual {
  return CLASS_VISUALS[toSlug(classId)] ?? FALLBACK_VISUAL;
}

/**
 * Sets --class-color for an element and its children (use with bg-class, text-class …).
 * Unknown ids need no special case: the missing --class-<id> token makes CSS use
 * --class-fallback (see app.css).
 */
export function classColorStyle(classId: string): CSSVariables {
  return { '--class-color': `var(--class-${toSlug(classId)})` };
}
