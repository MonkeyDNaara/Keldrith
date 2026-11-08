interface StatBonusProps {
  /** Sum of all bonuses and maluses on a stat, e.g. from buffs during a fight. */
  bonus: number;
}

/** "+3" in green, "−2" in red, "+0" in the normal text color. Placed right next to the stat value. */
export function StatBonus({ bonus }: StatBonusProps) {
  const sign = bonus < 0 ? '−' : '+';
  const color = bonus > 0 ? 'text-success' : bonus < 0 ? 'text-danger' : '';

  return (
    <span className={`ml-1 text-xs ${color}`}>
      {sign}
      {Math.abs(bonus)}
    </span>
  );
}
