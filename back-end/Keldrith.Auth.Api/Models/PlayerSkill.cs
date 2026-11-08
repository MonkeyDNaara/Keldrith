namespace Keldrith.Auth.Api.Models;

/// <summary>A skill a character of one class can learn with skill points.</summary>
public sealed class PlayerSkill : Skill
{
    public required string ClassId { get; set; }
    public int RequiredLevel { get; set; }
    public int SkillPointCost { get; set; }
}
