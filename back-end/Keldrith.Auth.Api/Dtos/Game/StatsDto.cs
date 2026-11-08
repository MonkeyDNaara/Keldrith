using Keldrith.Auth.Api.Models;

namespace Keldrith.Auth.Api.Dtos.Game;

public sealed record StatsDto(int MaxHp, int MaxMana, int Attack, int Defense, int Speed)
{
    public static StatsDto From(StatBlock stats) =>
        new(stats.MaxHp, stats.MaxMana, stats.Attack, stats.Defense, stats.Speed);
}
