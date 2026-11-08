namespace Keldrith.Auth.Api.Models;

/// <summary>A player's character. Each user can have exactly one.</summary>
public sealed class Character
{
    public int CharacterId { get; set; }
    public int UserId { get; set; }
    public required string Name { get; set; }
    public required string ClassId { get; set; }

    public int Level { get; set; } = 1;

    /// <summary>XP collected towards the next level (resets on level-up).</summary>
    public int Xp { get; set; }

    /// <summary>Every new character starts with one skill point.</summary>
    public int SkillPoints { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Many-to-many: removed together with the character.</summary>
    public List<PlayerSkill> LearnedSkills { get; set; } = [];
}
