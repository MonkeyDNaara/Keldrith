using System.Security.Claims;

namespace Keldrith.Auth.Api.Services;

public static class ClaimsPrincipalExtensions
{
    /// <summary>The user id from the "sub" claim of the JWT, or null if it is missing or broken.</summary>
    public static int? GetUserId(this ClaimsPrincipal principal) =>
        int.TryParse(principal.FindFirstValue("sub"), out var userId) ? userId : null;
}
