using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Dtos.Game;

public sealed record MonsterDto(
    string NpcId,
    string Kind,
    string Name,
    int Level,
    StatsDto Stats,
    int XpReward,
    IReadOnlyList<MonsterSkillDto> Skills)
{
    /// <summary>The contract has a "kind" discriminator for NPCs; only monsters exist so far.</summary>
    public static MonsterDto From(Monster m) => new(
        m.NpcId, "Monster", m.Name, m.Level, StatsDto.From(m.Stats), m.XpReward,
        m.Skills.Select(MonsterSkillDto.From).ToList());
}
