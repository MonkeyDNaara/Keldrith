using System.Security.Claims;
using Keldrith.Auth.Api.Data;
using Keldrith.Auth.Api.Dtos.Game;
using Keldrith.Auth.Api.Models;
using Keldrith.Auth.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Endpoints;

/// <summary>Takes the result of a fight and decides the reward (server-authoritative).</summary>
public static class FightEndpoints
{
    public static IEndpointRouteBuilder MapFightEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/characters/{characterId:int}/fight-results", SubmitFightResult)
            .RequireAuthorization().WithTags("Fight").WithName("SubmitFightResult")
            .WithSummary("Report a finished fight. The server decides XP and level-ups.")
            .Produces<FightRewardDto>().ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);
        return app;
    }

    private static async Task<IResult> SubmitFightResult(int characterId, FightResultRequest request,
        ClaimsPrincipal principal, AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();
        var character = await db.Characters.Include(c => c.LearnedSkills)
            .SingleOrDefaultAsync(c => c.CharacterId == characterId && c.UserId == userId, ct);
        if (character is null) return CharacterEndpoints.NotFound();

        var errors = new Dictionary<string, string[]>();
        var npcId = request.NpcId ?? string.Empty;
        var monster = await db.Monsters.AsNoTracking().SingleOrDefaultAsync(m => m.NpcId == npcId, ct);
        if (monster is null) errors["npcId"] = ["Monster does not exist."];
        if (!Enum.TryParse<FightOutcome>(request.Outcome, out var outcome) || !Enum.IsDefined(outcome))
            errors["outcome"] = ["Outcome must be Won, Lost or Fled."];
        if (request.Turns < 1) errors["turns"] = ["Turns must be at least 1."];
        if (errors.Count > 0 || monster is null) return Results.ValidationProblem(errors);

        // XP only from the monster the server knows, never from the client. Only a win pays.
        var progression = outcome == FightOutcome.Won
            ? ProgressionService.AwardXp(character, monster.XpReward)
            : new ProgressionResult(0, 0);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new FightRewardDto(
            progression.XpGained,
            progression.LevelsGained > 0,
            character.Level,
            progression.LevelsGained,
            await CharacterEndpoints.ToDtoAsync(db, character, ct)));
    }
}
