using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Keldrith.Auth.Api.Data;
using Keldrith.Auth.Api.Dtos.Auth;
using Keldrith.Auth.Api.Models;
using Keldrith.Auth.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Authentication");
        group.MapPost("/register", Register).AllowAnonymous().WithName("Register")
            .WithSummary("Create an account and sign in.")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesValidationProblem(StatusCodes.Status409Conflict);
        group.MapPost("/login", Login).AllowAnonymous().WithName("Login")
            .WithSummary("Sign in with email and password.")
            .Produces<AuthResponse>().ProducesProblem(StatusCodes.Status401Unauthorized);
        group.MapGet("/me", GetCurrentUser).RequireAuthorization().WithName("GetCurrentUser")
            .WithSummary("Get the currently authenticated user.")
            .Produces<UserDto>().ProducesProblem(StatusCodes.Status401Unauthorized);
        return app;
    }

    private static async Task<IResult> Register(RegisterRequest request, AppDbContext db,
        IPasswordHasher<User> hasher, TokenService tokens, CancellationToken ct)
    {
        // The browser trims these too. We repeat normalization on the server as the trust boundary.
        var username = request.Username.Trim();
        var email = request.Email.Trim();
        var errors = new Dictionary<string, string[]>();
        if (username.Length is < 3 or > 20) errors["username"] = ["Username must be between 3 and 20 characters."];
        if (string.IsNullOrWhiteSpace(username)) errors["username"] = ["Username is required."];
        if (email.Length > 254 || !new EmailAddressAttribute().IsValid(email))
            errors["email"] = ["Email must be a valid email address."];
        if (errors.Count > 0) return Results.ValidationProblem(errors, statusCode: 400);

        var normalizedUsername = username.ToUpperInvariant();
        var normalizedEmail = email.ToUpperInvariant();
        var usernameTaken = await db.Users.AnyAsync(x => x.NormalizedUsername == normalizedUsername, ct);
        var emailTaken = await db.Users.AnyAsync(x => x.NormalizedEmail == normalizedEmail, ct);
        if (usernameTaken || emailTaken)
        {
            if (usernameTaken) errors["username"] = ["This username is already taken."];
            if (emailTaken) errors["email"] = ["This email address is already taken."];
            return Results.ValidationProblem(errors, statusCode: 409, title: "Username or email already exists.");
        }

        var user = new User
        {
            Username = username, NormalizedUsername = normalizedUsername,
            Email = email, NormalizedEmail = normalizedEmail,
            PasswordHash = string.Empty, Role = "User", CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = hasher.HashPassword(user, request.Password);
        db.Users.Add(user);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // Unique database indexes also protect concurrent requests.
            db.ChangeTracker.Clear();
            var racedUsername = await db.Users.AnyAsync(x => x.NormalizedUsername == normalizedUsername, ct);
            var racedEmail = await db.Users.AnyAsync(x => x.NormalizedEmail == normalizedEmail, ct);
            var conflict = new Dictionary<string, string[]>();
            if (racedUsername) conflict["username"] = ["This username is already taken."];
            if (racedEmail) conflict["email"] = ["This email address is already taken."];
            if (conflict.Count > 0) return Results.ValidationProblem(conflict, statusCode: 409, title: "Username or email already exists.");
            throw;
        }
        return Results.Created("/api/auth/me", tokens.CreateAuthResponse(user));
    }

    private static async Task<IResult> Login(LoginRequest request, AppDbContext db,
        IPasswordHasher<User> hasher, TokenService tokens, CancellationToken ct)
    {
        var normalizedEmail = request.Email.Trim().ToUpperInvariant();
        var user = await db.Users.SingleOrDefaultAsync(x => x.NormalizedEmail == normalizedEmail, ct);
        if (user is null) return InvalidCredentials();
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed) return InvalidCredentials();
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = hasher.HashPassword(user, request.Password);
            await db.SaveChangesAsync(ct);
        }
        return Results.Ok(tokens.CreateAuthResponse(user));
    }

    private static IResult InvalidCredentials() => Results.Problem(
        title: "Invalid email or password.", statusCode: StatusCodes.Status401Unauthorized);

    private static async Task<IResult> GetCurrentUser(ClaimsPrincipal principal, AppDbContext db, CancellationToken ct)
    {
        var id = principal.FindFirstValue("sub");
        if (!int.TryParse(id, out var userId)) return Results.Unauthorized();
        var user = await db.Users.AsNoTracking()
            .Where(x => x.UserId == userId)
            .Select(x => new UserDto(x.UserId, x.Username, x.Email, x.Role))
            .SingleOrDefaultAsync(ct);
        return user is null ? Results.Unauthorized() : Results.Ok(user);
    }
}
