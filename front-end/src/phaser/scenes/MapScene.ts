import type { MapEventBus } from '../core/mapEvents';
import { BaseScene } from './BaseScene';
import { SceneKeys } from './sceneKeys';

/**
 * The world map scene. Empty for now (#43): it only proves that Phaser runs inside React.
 * Tiles, hero, camera and input follow in #49; it will only render the world state and
 * send intents, the rules stay in `src/game/world/`.
 */
export class MapScene extends BaseScene {
  constructor(bus: MapEventBus) {
    super(SceneKeys.Map, bus);
  }

  create(): void {
    this.emitReady();
  }
}
