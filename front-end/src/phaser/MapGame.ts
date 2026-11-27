import { Game } from 'phaser';
import { MapEventBus } from './core/mapEvents';
import { createGameConfig } from './gameConfig';
import { MapScene } from './scenes/MapScene';

/**
 * One running map game: the Phaser `Game`, its scenes and its own event bus.
 *
 * The class owns the lifetime of all three. React creates it on mount and calls `destroy()`
 * on unmount; afterwards nothing of it is left (no canvas, no listeners). React never talks to
 * Phaser directly, only to this class and its `bus`.
 */
export class MapGame {
  /** Events between this game and the React page. Lives exactly as long as the game. */
  readonly bus: MapEventBus;
  private readonly game: Game;
  private destroyed = false;

  constructor(parent: HTMLElement) {
    this.bus = new MapEventBus();
    // The scenes get the bus through their constructor (dependency injection).
    this.game = new Game(createGameConfig(parent, [new MapScene(this.bus)]));
  }

  /**
   * Stops the game, removes the canvas and all listeners. Safe to call twice.
   * Phaser removes the canvas on its next frame, not right away.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.bus.clear();
    this.game.destroy(true);
  }
}
