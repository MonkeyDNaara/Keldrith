import { useEffect, useEffectEvent, useRef } from 'react';
import type { MapEvents } from './core/mapEvents';
import { MapGame } from './MapGame';

type PhaserGameProps = {
  /** Called when a scene finished `create()`. */
  onSceneReady?: (event: MapEvents['scene-ready']) => void;
  /** Size and look of the container; the canvas fills it completely. */
  className?: string;
};

/**
 * The bridge between React and Phaser: React only renders an empty container `div`,
 * Phaser draws its canvas into it and runs its own game loop. React never re-renders the game.
 *
 * One effect owns one `MapGame`: created on mount, destroyed on unmount. In development
 * React StrictMode mounts twice on purpose; the cleanup destroys the first game, so only one
 * canvas stays.
 */
export function PhaserGame({ onSceneReady, className }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Always calls the latest `onSceneReady` without restarting the game when the prop changes.
  const handleSceneReady = useEffectEvent((event: MapEvents['scene-ready']) => {
    onSceneReady?.(event);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const game = new MapGame(container);
    game.bus.on('scene-ready', (event) => handleSceneReady(event));

    // `destroy()` also clears the bus, so the listener above is removed with it.
    return () => game.destroy();
  }, []);

  return <div ref={containerRef} className={className} />;
}
