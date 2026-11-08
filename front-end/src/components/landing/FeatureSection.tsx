import { Shield, Swords, TrendingUp, type LucideIcon } from 'lucide-react';
import { classColorStyle, getClassVisual } from '../../game/classVisuals';
import { t } from '../../i18n';

type FeatureId = (typeof t.pages.landing.features)[number]['id'];

// Record over the id union: adding a feature text without an icon is a compile error.
const FEATURE_ICONS: Record<FeatureId, LucideIcon> = {
  choose: Shield,
  fight: Swords,
  level: TrendingUp,
};

/** "How it works" cards, then one tile per playable class. */
export function FeatureSection() {
  const { featuresTitle, features, classesTitle, classes } = t.pages.landing;

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-col gap-6">
        <h2 className="text-center text-3xl font-bold">{featuresTitle}</h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {features.map(({ id, title, text }) => {
            const Icon = FEATURE_ICONS[id];
            return (
              <li key={id} className="card border border-frame bg-base-200">
                <div className="card-body items-center gap-2 text-center">
                  <Icon className="size-8 text-accent" aria-hidden="true" />
                  <h3 className="card-title">{title}</h3>
                  <p className="text-muted">{text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-center text-3xl font-bold">{classesTitle}</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {classes.map(({ classId, name, text }) => {
            const { Icon } = getClassVisual(classId);
            return (
              <li
                key={classId}
                style={classColorStyle(classId)}
                className="flex flex-col items-center gap-1 rounded-box border border-line bg-base-200 p-4 text-center"
              >
                <Icon className="size-8 text-class" aria-hidden="true" />
                <span className="font-semibold text-class">{name}</span>
                <span className="text-sm text-muted">{text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
