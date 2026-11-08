namespace Keldrith.Auth.Api.Models;

/// <summary>
/// Fields shared by player and monster skills. Not a table of its own:
/// EF Core copies these properties into the tables of the two subclasses.
/// </summary>
public abstract class Skill
{
    /// <summary>Slug used in URLs and JSON, e.g. "shield-bash".</summary>
    public required string SkillId { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public SkillType Type { get; set; }
    public int Power { get; set; }
    public int ManaCost { get; set; }
}
