namespace Keldrith.Auth.Api.Models;

/// <summary>An enemy the player can fight. Read-only game data, seeded at startup.</summary>
public sealed class Monster
{
    /// <summary>Slug used in JSON and in the fight result, e.g. "goblin".</summary>
    public required string NpcId { get; set; }
    public required string Name { get; set; }
    public int Level { get; set; }
    public required StatBlock Stats { get; set; }

    /// <summary>XP the server grants for a win. The client never sends this value.</summary>
    public int XpReward { get; set; }

    /// <summary>Many-to-many: skills can be shared between monsters.</summary>
    public List<MonsterSkill> Skills { get; set; } = [];
}
