using Keldrith.Auth.Api.Data;
using Keldrith.Auth.Api.Dtos.Game;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Endpoints;

/// <summary>Read-only game data the front-end needs to show classes and pick opponents.</summary>
public static class GameDataEndpoints
{
    // Order of the class picker. The database has no sort column (yet), so it is defined here.
    private static readonly string[] ClassOrder = ["warrior", "ranger", "monk", "priest"];

    public static IEndpointRouteBuilder MapGameDataEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/classes", GetClasses).AllowAnonymous().WithTags("Game data")
            .WithName("GetClasses").WithSummary("List all playable classes.")
            .Produces<List<ClassDto>>();
        app.MapGet("/api/monsters", GetMonsters).RequireAuthorization().WithTags("Game data")
            .WithName("GetMonsters").WithSummary("List all monsters a character can fight.")
            .Produces<List<MonsterDto>>().ProducesProblem(StatusCodes.Status401Unauthorized);
        return app;
    }

    private static async Task<IResult> GetClasses(AppDbContext db, CancellationToken ct)
    {
        var classes = await db.Classes.AsNoTracking().ToListAsync(ct);
        var ordered = classes.OrderBy(c => Array.IndexOf(ClassOrder, c.ClassId));
        return Results.Ok(ordered.Select(ClassDto.From).ToList());
    }

    private static async Task<IResult> GetMonsters(AppDbContext db, CancellationToken ct)
    {
        var monsters = await db.Monsters.AsNoTracking()
            .Include(m => m.Skills)
            .OrderBy(m => m.Level)
            .ToListAsync(ct);
        return Results.Ok(monsters.Select(MonsterDto.From).ToList());
    }
}
