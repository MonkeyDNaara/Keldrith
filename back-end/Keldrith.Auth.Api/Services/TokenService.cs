using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Keldrith.Auth.Api.Dtos.Auth;
using Keldrith.Auth.Api.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Keldrith.Auth.Api.Services;

public sealed class TokenService(IOptions<JwtOptions> options)
{
    private readonly JwtOptions _options = options.Value;

    public AuthResponse CreateAuthResponse(User user)
    {
        var now = DateTime.UtcNow;
        var expiresAt = now.AddHours(_options.LifetimeHours);
        var claims = new[]
        {
            new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new System.Security.Claims.Claim("name", user.Username),
            new System.Security.Claims.Claim("role", user.Role)
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey)),
            SecurityAlgorithms.HmacSha256);
        var jwt = new JwtSecurityToken(_options.Issuer, _options.Audience, claims,
            now, expiresAt, credentials);
        var token = new JwtSecurityTokenHandler().WriteToken(jwt);
        return new AuthResponse(token, expiresAt, new UserDto(user.UserId, user.Username, user.Email, user.Role));
    }
}
