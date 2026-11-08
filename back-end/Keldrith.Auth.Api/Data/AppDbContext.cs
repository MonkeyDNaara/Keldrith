using Keldrith.Auth.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Keldrith.Auth.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

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
    }
}
