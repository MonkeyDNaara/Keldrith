using System.Security.Claims;
using Keldrith.Auth.Api.Data;
using Keldrith.Auth.Api.Dtos.Game;
using Keldrith.Auth.Api.Models;
using Keldrith.Auth.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Endpoints;

/// <summary>Create, read, rename and delete the signed-in user's own character.</summary>
public static class CharacterEndpoints
{
    private const int NameMinLength = 2;
    private const int NameMaxLength = 20;

    public static IEndpointRouteBuilder MapCharacterEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/characters").WithTags("Characters").RequireAuthorization();
        group.MapGet("/", ListCharacters).WithName("ListCharacters")
            .WithSummary("List the own characters (zero or one).")
            .Produces<List<PlayerCharacterDto>>();
        group.MapGet("/{characterId:int}", GetCharacter).WithName("GetCharacter")
            .WithSummary("Get one own character.")
            .Produces<PlayerCharacterDto>().ProducesProblem(StatusCodes.Status404NotFound);
        group.MapPost("/", CreateCharacter).WithName("CreateCharacter")
            .WithSummary("Create the character. One per user.")
            .Produces<PlayerCharacterDto>(StatusCodes.Status201Created)
            .ProducesValidationProblem().ProducesProblem(StatusCodes.Status409Conflict);
        group.MapPut("/{characterId:int}", UpdateCharacter).WithName("UpdateCharacter")
            .WithSummary("Rename the character.")
            .Produces<PlayerCharacterDto>().ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);
        group.MapDelete("/{characterId:int}", DeleteCharacter).WithName("DeleteCharacter")
            .WithSummary("Delete the character.")
            .Produces(StatusCodes.Status204NoContent).ProducesProblem(StatusCodes.Status404NotFound);
        return app;
    }

    private static async Task<IResult> ListCharacters(ClaimsPrincipal principal, AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();
        var characters = await db.Characters.AsNoTracking().Include(c => c.LearnedSkills)
            .Where(c => c.UserId == userId).ToListAsync(ct);
        var result = new List<PlayerCharacterDto>();
        foreach (var character in characters) result.Add(await ToDtoAsync(db, character, ct));
        return Results.Ok(result);
    }

    private static async Task<IResult> GetCharacter(int characterId, ClaimsPrincipal principal, AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();
        var character = await db.Characters.AsNoTracking().Include(c => c.LearnedSkills)
            .SingleOrDefaultAsync(c => c.CharacterId == characterId && c.UserId == userId, ct);
        return character is null ? NotFound() : Results.Ok(await ToDtoAsync(db, character, ct));
    }

    private static async Task<IResult> CreateCharacter(CreateCharacterRequest request, ClaimsPrincipal principal,
        AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();

        var name = (request.Name ?? string.Empty).Trim();
        var classId = (request.ClassId ?? string.Empty).Trim();
        var errors = ValidateName(name);
        if (!await db.Classes.AnyAsync(c => c.ClassId == classId, ct))
            errors["classId"] = ["Class does not exist."];
        if (errors.Count > 0) return Results.ValidationProblem(errors);

        if (await db.Characters.AnyAsync(c => c.UserId == userId, ct)) return AlreadyHasCharacter();

        var character = new Character { UserId = userId, Name = name, ClassId = classId };
        db.Characters.Add(character);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // The unique index on UserId also stops two requests arriving at the same time.
            return AlreadyHasCharacter();
        }
        return Results.Created($"/api/characters/{character.CharacterId}", await ToDtoAsync(db, character, ct));
    }

    private static async Task<IResult> UpdateCharacter(int characterId, UpdateCharacterRequest request,
        ClaimsPrincipal principal, AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();
        var character = await db.Characters.Include(c => c.LearnedSkills)
            .SingleOrDefaultAsync(c => c.CharacterId == characterId && c.UserId == userId, ct);
        if (character is null) return NotFound();

        var name = (request.Name ?? string.Empty).Trim();
        var errors = ValidateName(name);
        if (errors.Count > 0) return Results.ValidationProblem(errors);

        character.Name = name;
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToDtoAsync(db, character, ct));
    }

    private static async Task<IResult> DeleteCharacter(int characterId, ClaimsPrincipal principal,
        AppDbContext db, CancellationToken ct)
    {
        if (principal.GetUserId() is not { } userId) return Results.Unauthorized();
        var character = await db.Characters
            .SingleOrDefaultAsync(c => c.CharacterId == characterId && c.UserId == userId, ct);
        if (character is null) return NotFound();

        db.Characters.Remove(character);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    /// <summary>Entity to DTO. Needs the class for the stats; also used by the fight endpoint.</summary>
    internal static async Task<PlayerCharacterDto> ToDtoAsync(AppDbContext db, Character character, CancellationToken ct)
    {
        var characterClass = await db.Classes.AsNoTracking().SingleAsync(c => c.ClassId == character.ClassId, ct);
        return PlayerCharacterDto.From(character, characterClass);
    }

    private static Dictionary<string, string[]> ValidateName(string name)
    {
        var errors = new Dictionary<string, string[]>();
        if (name.Length is < NameMinLength or > NameMaxLength)
            errors["name"] = [$"Name must be {NameMinLength}–{NameMaxLength} characters."];
        return errors;
    }

    // A foreign id and a missing id give the same answer: no hint that the character exists.
    internal static IResult NotFound() => Results.Problem(title: "Not Found", statusCode: StatusCodes.Status404NotFound);

    private static IResult AlreadyHasCharacter() => Results.Problem(
        title: "Conflict", detail: "You already have a character.", statusCode: StatusCodes.Status409Conflict);
}
