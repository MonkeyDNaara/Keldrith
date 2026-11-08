using Keldrith.Auth.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Data;

/// <summary>
/// Fills the read-only game data (classes, skills, monsters) on first start.
/// Same values as the front-end mock (seed.ts), so switching to the real API changes nothing.
/// Safe to run on every start: a table that already has rows is left alone.
/// </summary>
public static class GameDataSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (!await db.Classes.AnyAsync(ct)) db.Classes.AddRange(CreateClasses());
        if (!await db.PlayerSkills.AnyAsync(ct)) db.PlayerSkills.AddRange(CreatePlayerSkills());
        if (!await db.Monsters.AnyAsync(ct)) db.Monsters.AddRange(CreateMonsters());
        await db.SaveChangesAsync(ct);
    }

    private static StatBlock Stats(int maxHp, int maxMana, int attack, int defense, int speed) =>
        new() { MaxHp = maxHp, MaxMana = maxMana, Attack = attack, Defense = defense, Speed = speed };

    private static List<CharacterClass> CreateClasses() =>
    [
        new()
        {
            ClassId = "warrior", Name = "Warrior",
            Description = "A sturdy fighter who holds the front line.",
            Roles = ["MeleeDps", "Tank"],
            BaseStats = Stats(120, 30, 14, 10, 8), StatsPerLevel = Stats(12, 3, 2, 2, 1)
        },
        new()
        {
            ClassId = "ranger", Name = "Ranger",
            Description = "A quick hunter who strikes from afar or up close.",
            Roles = ["RangedDps", "MeleeDps"],
            BaseStats = Stats(95, 40, 16, 6, 12), StatsPerLevel = Stats(9, 4, 3, 1, 2)
        },
        new()
        {
            ClassId = "monk", Name = "Monk",
            Description = "A disciplined fighter who strikes fast and mends wounds.",
            Roles = ["MeleeDps", "Healer"],
            BaseStats = Stats(105, 45, 13, 8, 11), StatsPerLevel = Stats(10, 4, 2, 1, 2)
        },
        new()
        {
            ClassId = "priest", Name = "Priest",
            Description = "A devoted caster who smites foes and heals allies.",
            Roles = ["RangedDps", "Healer"],
            BaseStats = Stats(85, 70, 10, 6, 9), StatsPerLevel = Stats(8, 7, 1, 1, 1)
        }
    ];

    /// <summary>All player skills cost 1 skill point.</summary>
    private static PlayerSkill CreatePlayerSkill(string skillId, string classId, string name,
        SkillType type, int power, int manaCost, int requiredLevel) => new()
    {
        SkillId = skillId, ClassId = classId, Name = name,
        Description = $"{name}: a {type.ToString().ToLowerInvariant()} skill.",
        Type = type, Power = power, ManaCost = manaCost,
        RequiredLevel = requiredLevel, SkillPointCost = 1
    };

    private static List<PlayerSkill> CreatePlayerSkills() =>
    [
        CreatePlayerSkill("shield-bash", "warrior", "Shield Bash", SkillType.Damage, 8, 10, 1),
        CreatePlayerSkill("war-cry", "warrior", "War Cry", SkillType.Buff, 5, 15, 3),
        CreatePlayerSkill("whirlwind", "warrior", "Whirlwind", SkillType.Damage, 18, 25, 5),
        CreatePlayerSkill("aimed-shot", "ranger", "Aimed Shot", SkillType.Damage, 10, 10, 1),
        CreatePlayerSkill("poison-arrow", "ranger", "Poison Arrow", SkillType.Damage, 14, 18, 3),
        CreatePlayerSkill("rain-of-arrows", "ranger", "Rain of Arrows", SkillType.Damage, 22, 30, 5),
        CreatePlayerSkill("palm-strike", "monk", "Palm Strike", SkillType.Damage, 8, 8, 1),
        CreatePlayerSkill("inner-calm", "monk", "Inner Calm", SkillType.Heal, 20, 15, 3),
        CreatePlayerSkill("flurry", "monk", "Flurry", SkillType.Damage, 20, 25, 5),
        CreatePlayerSkill("holy-bolt", "priest", "Holy Bolt", SkillType.Damage, 10, 10, 1),
        CreatePlayerSkill("mend", "priest", "Mend", SkillType.Heal, 30, 15, 3),
        CreatePlayerSkill("smite", "priest", "Smite", SkillType.Damage, 24, 30, 5)
    ];

    private static List<Monster> CreateMonsters()
    {
        MonsterSkill dirtyStab = new()
        {
            SkillId = "dirty-stab", Name = "Dirty Stab", Description = "A sneaky stab.",
            Type = SkillType.Damage, Power = 6, ManaCost = 5
        };
        MonsterSkill bite = new()
        {
            SkillId = "bite", Name = "Bite", Description = "Sharp teeth.",
            Type = SkillType.Damage, Power = 6, ManaCost = 5
        };
        MonsterSkill howl = new()
        {
            SkillId = "howl", Name = "Howl", Description = "A howl that raises attack.",
            Type = SkillType.Buff, Power = 3, ManaCost = 10
        };
        MonsterSkill crushingBlow = new()
        {
            SkillId = "crushing-blow", Name = "Crushing Blow", Description = "A heavy hit.",
            Type = SkillType.Damage, Power = 12, ManaCost = 15
        };

        return
        [
            new()
            {
                NpcId = "goblin", Name = "Goblin", Level = 1, XpReward = 25,
                Stats = Stats(60, 10, 9, 5, 7), Skills = [dirtyStab]
            },
            new()
            {
                NpcId = "wolf", Name = "Wolf", Level = 2, XpReward = 40,
                Stats = Stats(80, 15, 12, 6, 13), Skills = [bite, howl]
            },
            new()
            {
                NpcId = "orc", Name = "Orc", Level = 4, XpReward = 90,
                Stats = Stats(150, 30, 18, 12, 6), Skills = [crushingBlow]
            }
        ];
    }
}
