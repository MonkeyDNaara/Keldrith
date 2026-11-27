import type { SceneKey } from '../scenes/sceneKeys';
import { TypedEventBus } from './TypedEventBus';

/**
 * All events between the map game (Phaser) and the React page, with their payloads.
 * New events (e.g. `encounter` in #50) are added here, so this type is the full contract
 * between both sides.
 */
export type MapEvents = {
  /** A scene finished `create()` and can receive events. */
  'scene-ready': { sceneKey: SceneKey };
};

/** The bus one map game and its React page share. */
export class MapEventBus extends TypedEventBus<MapEvents> {}
