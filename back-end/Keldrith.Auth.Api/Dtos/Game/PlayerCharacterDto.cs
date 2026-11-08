using Keldrith.Auth.Api.Models;
using Keldrith.Auth.Api.Services;

namespace Keldrith.Auth.Api.Dtos.Game;

public sealed record PlayerCharacterDto(
    int CharacterId,
    string Name,
    int Level,
    StatsDto Stats,
    string ClassId,
    int Xp,
    int XpToNextLevel,
    int SkillPoints,
    IReadOnlyList<PlayerSkillDto> LearnedSkills,
    DateTime CreatedAt)
{
    /// <summary>Needs the class (for the stats) and the loaded <c>LearnedSkills</c>.</summary>
    public static PlayerCharacterDto From(Character c, CharacterClass characterClass) => new(
        c.CharacterId, c.Name, c.Level, GameRules.StatsAt(characterClass, c.Level),
        c.ClassId, c.Xp, GameRules.XpToNextLevel(c.Level), c.SkillPoints,
        c.LearnedSkills.Select(PlayerSkillDto.From).ToList(), c.CreatedAt);
}
