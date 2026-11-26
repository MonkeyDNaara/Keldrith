import { Scene } from 'phaser';
import type { MapEventBus } from '../core/mapEvents';
import type { SceneKey } from './sceneKeys';

/**
 * Base class of all Keldrith scenes. It holds what every scene needs:
 * its key and the event bus of the game it belongs to.
 *
 * The bus comes in through the constructor (dependency injection) instead of a global import,
 * so every game instance has its own bus and nothing survives a destroyed game.
 * `abstract`: only concrete scenes (e.g. `MapScene`) can be created.
 */
export abstract class BaseScene extends Scene {
  readonly sceneKey: SceneKey;
  protected readonly bus: MapEventBus;

  protected constructor(sceneKey: SceneKey, bus: MapEventBus) {
    super({ key: sceneKey });
    this.sceneKey = sceneKey;
    this.bus = bus;
  }

  /** Tells the React side that this scene can receive events. Call it at the end of `create()`. */
  protected emitReady(): void {
    this.bus.emit('scene-ready', { sceneKey: this.sceneKey });
  }
}
