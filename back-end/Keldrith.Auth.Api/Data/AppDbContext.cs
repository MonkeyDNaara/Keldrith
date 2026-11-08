using Keldrith.Auth.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<CharacterClass> Classes => Set<CharacterClass>();
    public DbSet<PlayerSkill> PlayerSkills => Set<PlayerSkill>();
    public DbSet<MonsterSkill> MonsterSkills => Set<MonsterSkill>();
    public DbSet<Monster> Monsters => Set<Monster>();
    public DbSet<Character> Characters => Set<Character>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var user = modelBuilder.Entity<User>();
        user.HasKey(x => x.UserId);
        user.Property(x => x.Username).HasMaxLength(20).IsRequired();
        user.Property(x => x.NormalizedUsername).HasMaxLength(20).IsRequired();
        user.Property(x => x.Email).HasMaxLength(254).IsRequired();
        user.Property(x => x.NormalizedEmail).HasMaxLength(254).IsRequired();
        user.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
        user.Property(x => x.Role).HasMaxLength(20).IsRequired();
        user.Property(x => x.CreatedAt).IsRequired();
        user.HasIndex(x => x.NormalizedUsername).IsUnique();
        user.HasIndex(x => x.NormalizedEmail).IsUnique();

        var characterClass = modelBuilder.Entity<CharacterClass>();
        characterClass.HasKey(x => x.ClassId);
        characterClass.Property(x => x.ClassId).HasMaxLength(30);
        characterClass.Property(x => x.Name).HasMaxLength(30).IsRequired();
        characterClass.Property(x => x.Description).HasMaxLength(300).IsRequired();
        characterClass.ComplexProperty(x => x.BaseStats);
        characterClass.ComplexProperty(x => x.StatsPerLevel);

        var playerSkill = modelBuilder.Entity<PlayerSkill>();
        playerSkill.HasKey(x => x.SkillId);
        playerSkill.Property(x => x.SkillId).HasMaxLength(40);
        playerSkill.Property(x => x.Name).HasMaxLength(40).IsRequired();
        playerSkill.Property(x => x.Description).HasMaxLength(300).IsRequired();
        playerSkill.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
        playerSkill.HasOne<CharacterClass>().WithMany()
            .HasForeignKey(x => x.ClassId).OnDelete(DeleteBehavior.Restrict);

        var monsterSkill = modelBuilder.Entity<MonsterSkill>();
        monsterSkill.HasKey(x => x.SkillId);
        monsterSkill.Property(x => x.SkillId).HasMaxLength(40);
        monsterSkill.Property(x => x.Name).HasMaxLength(40).IsRequired();
        monsterSkill.Property(x => x.Description).HasMaxLength(300).IsRequired();
        monsterSkill.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);

        var monster = modelBuilder.Entity<Monster>();
        monster.HasKey(x => x.NpcId);
        monster.Property(x => x.NpcId).HasMaxLength(30);
        monster.Property(x => x.Name).HasMaxLength(30).IsRequired();
        monster.ComplexProperty(x => x.Stats);
        monster.HasMany(x => x.Skills).WithMany();

        var character = modelBuilder.Entity<Character>();
        character.HasKey(x => x.CharacterId);
        character.Property(x => x.Name).HasMaxLength(20).IsRequired();
        // One character per user: the database enforces it, not only the endpoint.
        character.HasIndex(x => x.UserId).IsUnique();
        character.HasOne<User>().WithMany()
            .HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        character.HasOne<CharacterClass>().WithMany()
            .HasForeignKey(x => x.ClassId).OnDelete(DeleteBehavior.Restrict);
        character.HasMany(x => x.LearnedSkills).WithMany();
    }
}
