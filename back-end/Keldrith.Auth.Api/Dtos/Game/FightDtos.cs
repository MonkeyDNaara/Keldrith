namespace Keldrith.Auth.Api.Dtos.Game;

/// <summary>
/// The client only reports what happened. XP is decided by the server from the monster it knows.
/// Outcome is a string so that an invalid value becomes a field error, not a generic 400.
/// </summary>
public sealed record FightResultRequest(string? NpcId, string? Outcome, int Turns);

public sealed record FightRewardDto(
    int XpGained,
    bool LeveledUp,
    int NewLevel,
    int SkillPointsGained,
    PlayerCharacterDto Character);
