/**
 * Unique keys of all Phaser scenes. Phaser finds scenes by key, so they live in one place
 * instead of as loose strings. `as const` instead of an `enum` (the tsconfig uses
 * `erasableSyntaxOnly`, which does not allow enums).
 */
export const SceneKeys = {
  Map: 'map',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];
