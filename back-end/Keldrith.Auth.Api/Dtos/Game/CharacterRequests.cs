namespace Keldrith.Auth.Api.Dtos.Game;

// Nullable on purpose: a client may send null or omit a field. The endpoint turns that into a 400.
public sealed record CreateCharacterRequest(string? Name, string? ClassId);

public sealed record UpdateCharacterRequest(string? Name);
