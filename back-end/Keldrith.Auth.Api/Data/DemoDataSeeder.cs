using Keldrith.Auth.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Data;

/// <summary>
/// Creates the demo account of the front-end ("Use demo account" button) with one character.
/// DEVELOPMENT ONLY: the password is public, so this must never run in production.
/// Same data as the front-end mock, so the demo looks the same with either API.
/// </summary>
public static class DemoDataSeeder
{
    private const string Username = "demo";
    private const string Email = "demo@keldrith.dev";
    private const string Password = "demo-password";

    public static async Task SeedAsync(AppDbContext db, IPasswordHasher<User> hasher, CancellationToken ct = default)
    {
        var normalizedUsername = Username.ToUpperInvariant();
        var normalizedEmail = Email.ToUpperInvariant();
        if (await db.Users.AnyAsync(u => u.NormalizedUsername == normalizedUsername
                                         || u.NormalizedEmail == normalizedEmail, ct))
            return;

        var user = new User
        {
            Username = Username, NormalizedUsername = normalizedUsername,
            Email = Email, NormalizedEmail = normalizedEmail,
            PasswordHash = string.Empty, Role = "User", CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = hasher.HashPassword(user, Password);
        db.Users.Add(user);
        await db.SaveChangesAsync(ct); // the database assigns UserId here

        // Level 3 = 3 skill points (1 at the start + 1 per level-up); Shield Bash cost 1.
        var shieldBash = await db.PlayerSkills.SingleAsync(s => s.SkillId == "shield-bash", ct);
        db.Characters.Add(new Character
        {
            UserId = user.UserId, Name = "Aldric", ClassId = "warrior",
            Level = 3, Xp = 40, SkillPoints = 2, LearnedSkills = [shieldBash]
        });
        await db.SaveChangesAsync(ct);
    }
}
