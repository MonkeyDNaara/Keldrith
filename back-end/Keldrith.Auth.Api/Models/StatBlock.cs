namespace Keldrith.Auth.Api.Models;

/// <summary>
/// The five stats every fighter has. Used for class base stats, per-level growth and monsters.
/// Stored as columns of the owning table (EF Core "complex type"), not as its own table.
/// </summary>
public sealed class StatBlock
{
    public int MaxHp { get; set; }
    public int MaxMana { get; set; }
    public int Attack { get; set; }
    public int Defense { get; set; }
    public int Speed { get; set; }
}
