import { useState } from 'react';
import { Link } from 'react-router';
import type { PlayerCharacterDto } from '../api/types';
import { OwnHeroGate } from '../components/character/OwnHeroGate';
import { t } from '../i18n';
import { PhaserGame } from '../phaser/PhaserGame';

const texts = t.pages.map;

/**
 * /characters/:characterId/map — the world map. Lazy-loaded in `App.tsx`, so Phaser is only
 * downloaded when a player opens this page.
 */
export function MapPage() {
  return <OwnHeroGate texts={texts}>{(hero) => <MapContent hero={hero} />}</OwnHeroGate>;
}

/** The map page once the hero is known: header + the Phaser canvas. */
function MapContent({ hero }: { hero: PlayerCharacterDto }) {
  // False until the map scene reports `scene-ready`; shows a loading hint above the canvas.
  const [isReady, setIsReady] = useState(false);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">{texts.title}</h1>
        <Link to={`/characters/${hero.characterId}`} className="btn btn-ghost btn-sm">
          {texts.backToHero}
        </Link>
      </div>

      <div className="relative h-[60dvh] min-h-80 overflow-hidden rounded-box border border-line bg-base-200">
        <PhaserGame className="size-full" onSceneReady={() => setIsReady(true)} />
        {!isReady && (
          <p role="status" className="absolute inset-0 grid place-items-center text-sm text-muted">
            {texts.loading}
          </p>
        )}
      </div>
    </section>
  );
}
