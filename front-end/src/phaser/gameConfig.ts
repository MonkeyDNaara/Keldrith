import { AUTO, Scale, type Scene, type Types } from 'phaser';

/**
 * Phaser settings of the map game. Kept apart from `MapGame` so the settings can be read and
 * changed in one place.
 */
export function createGameConfig(parent: HTMLElement, scenes: Scene[]): Types.Core.GameConfig {
  return {
    // WebGL when the browser supports it, Canvas 2D as fallback.
    type: AUTO,
    parent,
    // Nearest-neighbour scaling: 16 px tiles stay sharp at zoom 2–4 instead of getting blurry.
    pixelArt: true,
    // The canvas has no own colour: the container's theme token shows through (light / dark).
    transparent: true,
    // The map has no sound yet: without this Phaser creates a Web Audio context on boot, and the
    // browser warns because no user gesture happened. Remove it once sound is added.
    audio: { noAudio: true },
    // No Phaser version banner in the browser console.
    banner: false,
    scale: {
      // The canvas always fills its container 1:1 (no letterbox bars); the camera zoom (#49)
      // decides how many tiles are visible, at 1440 px and at 390 px.
      mode: Scale.RESIZE,
      width: '100%',
      height: '100%',
      // Phaser must not change the container's CSS; its size comes from the React layout.
      expandParent: false,
    },
    scene: scenes,
  };
}
