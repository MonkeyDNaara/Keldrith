using System.Security.Claims;
using Keldrith.Auth.Api.Data;
using Keldrith.Auth.Api.Dtos.Game;
using Keldrith.Auth.Api.Services;
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
        app.MapPost("/api/characters/{characterId:int}/skills", LearnSkill)
            .RequireAuthorization().WithTags("Skills").WithName("LearnSkill")
            .WithSummary("Spend skill points to learn a skill of the character's class.")
            .Produces<PlayerCharacterDto>().ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound).ProducesProblem(StatusCodes.Status409Conflict);
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

    private static async Task<IResult> LearnSkill(int characterId, LearnSkillRequest request,
        ClaimsPrincipal principal, AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();
        var character = await db.Characters.Include(c => c.LearnedSkills)
            .SingleOrDefaultAsync(c => c.CharacterId == characterId && c.UserId == userId, ct);
        if (character is null) return CharacterEndpoints.NotFound();

        // Every rule is checked here, in this order. The front-end only mirrors it as a hint.
        // Tracked on purpose (no AsNoTracking): EF must know the skill to add it to the character.
        var skillId = (request.SkillId ?? string.Empty).Trim();
        var skill = await db.PlayerSkills
            .SingleOrDefaultAsync(s => s.SkillId == skillId && s.ClassId == character.ClassId, ct);
        if (skill is null) return SkillRuleBroken("Skill does not exist for this class.");
        if (character.LearnedSkills.Any(s => s.SkillId == skill.SkillId)) return AlreadyLearned();
        if (character.Level < skill.RequiredLevel) return SkillRuleBroken($"Requires level {skill.RequiredLevel}.");
        if (character.SkillPoints < skill.SkillPointCost) return SkillRuleBroken("Not enough skill points.");

        character.SkillPoints -= skill.SkillPointCost;
        character.LearnedSkills.Add(skill);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // The join table's key (character + skill) also stops two requests arriving at the same time.
            return AlreadyLearned();
        }
        return Results.Ok(await CharacterEndpoints.ToDtoAsync(db, character, ct));
    }

    private static IResult SkillRuleBroken(string message) =>
        Results.ValidationProblem(new Dictionary<string, string[]> { ["skillId"] = [message] });

    private static IResult AlreadyLearned() => Results.Problem(
        title: "Conflict", detail: "Skill is already learned.", statusCode: StatusCodes.Status409Conflict);
}
