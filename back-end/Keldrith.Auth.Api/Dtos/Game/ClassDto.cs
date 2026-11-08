using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Dtos.Game;

public sealed record ClassDto(
    string ClassId,
    string Name,
    string Description,
    IReadOnlyList<string> Roles,
    StatsDto BaseStats,
    StatsDto StatsPerLevel)
{
    public static ClassDto From(CharacterClass c) => new(
        c.ClassId, c.Name, c.Description, c.Roles,
        StatsDto.From(c.BaseStats), StatsDto.From(c.StatsPerLevel));
}
