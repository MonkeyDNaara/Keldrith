using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Services;

/// <summary>What one XP award did to a character.</summary>
public sealed record ProgressionResult(int XpGained, int LevelsGained);

/// <summary>The XP and level-up rules. Pure logic: no database, no HTTP.</summary>
public static class ProgressionService
{
    /// <summary>
    /// Adds XP and applies every level-up that follows (several at once are possible).
    /// Each level-up gives one skill point. At the max level no XP is gained.
    /// Changes the given <paramref name="character"/>; saving is up to the caller.
    /// </summary>
    public static ProgressionResult AwardXp(Character character, int xp)
    {
        if (character.Level >= GameRules.MaxLevel) return new ProgressionResult(0, 0);

        var startLevel = character.Level;
        character.Xp += xp;
        while (character.Level < GameRules.MaxLevel
               && character.Xp >= GameRules.XpToNextLevel(character.Level))
        {
            character.Xp -= GameRules.XpToNextLevel(character.Level);
            character.Level++;
            character.SkillPoints++;
        }
        if (character.Level == GameRules.MaxLevel) character.Xp = 0;

        return new ProgressionResult(xp, character.Level - startLevel);
    }
}
