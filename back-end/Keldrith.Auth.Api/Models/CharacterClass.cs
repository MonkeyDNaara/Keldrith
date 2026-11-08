namespace Keldrith.Auth.Api.Models;

/// <summary>A playable class (Warrior, Ranger, ...). Read-only game data, seeded at startup.</summary>
public sealed class CharacterClass
{
    /// <summary>Slug used in URLs and JSON, e.g. "warrior".</summary>
    public required string ClassId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }

    /// <summary>Info text only (e.g. "Tank"); no game rule depends on it.</summary>
    public List<string> Roles { get; set; } = [];

    public required StatBlock BaseStats { get; set; }

    /// <summary>Stats at level n = BaseStats + StatsPerLevel * (n - 1).</summary>
    public required StatBlock StatsPerLevel { get; set; }
}
