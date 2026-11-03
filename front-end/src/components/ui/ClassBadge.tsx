import { classColorStyle, getClassVisual } from '../../game/classVisuals';

interface ClassBadgeProps {
  classId: string;
  /** Display name from the server (ClassDto.name). Without it the id is shown. */
  name?: string;
  size?: 'sm' | 'md';
}

// Full class names (no string building), so Tailwind finds them when scanning the code.
const SIZE_CLASSES = {
  sm: { root: 'gap-1.5 text-sm', icon: 'size-4' },
  md: { root: 'gap-2 text-base', icon: 'size-5' },
} as const;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Class icon + name in the class color. Unknown classes get the fallback icon and color. */
export function ClassBadge({ classId, name, size = 'md' }: ClassBadgeProps) {
  const { Icon } = getClassVisual(classId);
  const sizes = SIZE_CLASSES[size];

  return (
    <span
      style={classColorStyle(classId)}
      className={`inline-flex min-w-0 items-center font-semibold text-class ${sizes.root}`}
    >
      <Icon className={`shrink-0 ${sizes.icon}`} />
      <span className="truncate">{name ?? capitalize(classId)}</span>
    </span>
  );
}
