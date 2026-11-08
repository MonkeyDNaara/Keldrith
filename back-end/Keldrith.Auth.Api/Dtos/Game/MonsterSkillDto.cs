using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Dtos.Game;

public sealed record MonsterSkillDto(
    string SkillId,
    string Name,
    string Description,
    SkillType Type,
    int Power,
    int ManaCost)
{
    public static MonsterSkillDto From(MonsterSkill s) =>
        new(s.SkillId, s.Name, s.Description, s.Type, s.Power, s.ManaCost);
}
