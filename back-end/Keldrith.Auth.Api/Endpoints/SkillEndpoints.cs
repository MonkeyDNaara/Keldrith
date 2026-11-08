using Keldrith.Auth.Api.Data;
using Keldrith.Auth.Api.Dtos.Game;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Endpoints;

/// <summary>The skills of a class and learning them with skill points (server-authoritative).</summary>
public static class SkillEndpoints
{
    public static IEndpointRouteBuilder MapSkillEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/classes/{classId}/skills", GetClassSkills).AllowAnonymous().WithTags("Skills")
            .WithName("GetClassSkills").WithSummary("List the skills of one class, lowest required level first.")
            .Produces<List<PlayerSkillDto>>().ProducesProblem(StatusCodes.Status404NotFound);
        return app;
    }

    private static async Task<IResult> GetClassSkills(string classId, AppDbContext db, CancellationToken ct)
    {
        if (!await db.Classes.AnyAsync(c => c.ClassId == classId, ct)) return CharacterEndpoints.NotFound();

        // The database has no defined row order, so the order is stated here: level first, then name.
        var skills = await db.PlayerSkills.AsNoTracking()
            .Where(s => s.ClassId == classId)
            .OrderBy(s => s.RequiredLevel).ThenBy(s => s.Name)
            .ToListAsync(ct);
        return Results.Ok(skills.Select(PlayerSkillDto.From).ToList());
    }
}
