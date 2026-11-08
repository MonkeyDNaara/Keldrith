using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Keldrith.Auth.Api.Data;

// Used by dotnet-ef without starting the web application.
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite("Data Source=keldrith-auth.db")
            .Options;

        return new AppDbContext(options);
    }
}
