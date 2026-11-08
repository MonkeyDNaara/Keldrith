using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Dtos.Game;

public sealed record PlayerSkillDto(
    string SkillId,
    string Name,
    string Description,
    SkillType Type,
    int Power,
    int ManaCost,
    string ClassId,
    int RequiredLevel,
    int SkillPointCost)
{
    public static PlayerSkillDto From(PlayerSkill s) => new(
        s.SkillId, s.Name, s.Description, s.Type, s.Power, s.ManaCost,
        s.ClassId, s.RequiredLevel, s.SkillPointCost);
}
