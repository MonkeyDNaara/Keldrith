import type { ClassDto } from '../../api/types';
import { classColorStyle, getClassVisual } from '../../game/classVisuals';
import { getRoleLabel } from '../../game/roles';
import { getStatEntries } from '../../game/stats';
import { t } from '../../i18n';

interface ClassCardProps {
  playerClass: ClassDto;
  /** Same `name` for every card of one group: the browser then allows only one checked radio. */
  groupName: string;
  checked: boolean;
  onSelect: (classId: string) => void;
}

/**
 * One selectable class: a real radio input inside a <label>, styled as a card.
 * Keyboard (Tab into the group, arrow keys to switch) and screen readers work like any radio group.
 */
export function ClassCard({ playerClass, groupName, checked, onSelect }: ClassCardProps) {
  const { classId, name, description, roles, baseStats } = playerClass;
  const { Icon } = getClassVisual(classId);

  return (
    <label
      style={classColorStyle(classId)}
      // has-checked / has-focus-visible: style the card from the state of the radio inside it.
      className="flex min-w-0 cursor-pointer flex-col gap-3 rounded-box border-2 border-line bg-base-200 p-4 transition-colors hover:border-class/60 has-checked:border-class has-checked:bg-class/10 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-class"
    >
      <input
        type="radio"
        name={groupName}
        value={classId}
        checked={checked}
        onChange={() => onSelect(classId)}
        className="sr-only"
      />

      <span className="flex items-center gap-2 text-class">
        <Icon className="size-6 shrink-0" aria-hidden="true" />
        <span className="truncate font-display text-xl font-bold">{name}</span>
      </span>

      <span className="text-sm text-muted">{description}</span>

      {/* Roles are info only: nothing is chosen or stored. */}
      <span className="flex flex-wrap gap-1" aria-label={t.pages.createCharacter.roles}>
        {roles.map((role) => (
          <span key={role} className="badge badge-outline badge-sm">
            {getRoleLabel(role)}
          </span>
        ))}
      </span>

      <dl className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-x-3 gap-y-1 text-sm">
        {getStatEntries(baseStats).map((stat) => (
          <div key={stat.key} className="flex justify-between gap-2">
            <dt className="truncate text-faint">{stat.label}</dt>
            <dd className="tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </label>
  );
}
