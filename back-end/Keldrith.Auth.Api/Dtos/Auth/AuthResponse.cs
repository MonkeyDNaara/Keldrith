namespace Keldrith.Auth.Api.Dtos.Auth;
public sealed record AuthResponse(string Token, DateTime ExpiresAt, UserDto User);
