using Keldrith.Auth.Api.Dtos.Game;
using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Services;

/// <summary>The numbers behind levels and stats. Same formulas as the front-end mock.</summary>
public static class GameRules
{
    public const int MaxLevel = 10;

    /// <summary>XP needed to get from <paramref name="level"/> to the next level.</summary>
    public static int XpToNextLevel(int level) => 50 * (level + 1);

    /// <summary>stats = baseStats + statsPerLevel * (level - 1). Computed, never stored.</summary>
    public static StatsDto StatsAt(CharacterClass characterClass, int level)
    {
        var steps = level - 1;
        var b = characterClass.BaseStats;
        var p = characterClass.StatsPerLevel;
        return new StatsDto(
            b.MaxHp + p.MaxHp * steps,
            b.MaxMana + p.MaxMana * steps,
            b.Attack + p.Attack * steps,
            b.Defense + p.Defense * steps,
            b.Speed + p.Speed * steps);
    }
}
