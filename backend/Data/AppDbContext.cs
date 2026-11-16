using Microsoft.EntityFrameworkCore;
using Ashure.Backend.Models;

namespace Ashure.Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Team> Teams => Set<Team>();
    public DbSet<Sprint> Sprints => Set<Sprint>();
    public DbSet<WorkItem> WorkItems => Set<WorkItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Team Konfigürasyonu
        modelBuilder.Entity<Team>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Description).HasMaxLength(1000);
            entity.Property(t => t.IconColor).HasMaxLength(20).HasDefaultValue("#0078D4");
            entity.Property(t => t.IsPilot).HasDefaultValue(false);
            entity.Property(t => t.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // 2. Sprint Konfigürasyonu
        modelBuilder.Entity<Sprint>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.Name).IsRequired().HasMaxLength(100);
            entity.Property(s => s.IsActive).HasDefaultValue(true);

            entity.HasOne(s => s.Team)
                  .WithMany(t => t.Sprints)
                  .HasForeignKey(s => s.TeamId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // 3. WorkItem Konfigürasyonu (Self-Referencing Hiyerarşik Yapı)
        modelBuilder.Entity<WorkItem>(entity =>
        {
            entity.HasKey(w => w.Id);
            entity.Property(w => w.Title).IsRequired().HasMaxLength(300);
            entity.Property(w => w.Type).IsRequired().HasMaxLength(50);
            entity.Property(w => w.Status).IsRequired().HasMaxLength(50).HasDefaultValue("New");
            entity.Property(w => w.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");

            // Team İlişkisi
            entity.HasOne(w => w.Team)
                  .WithMany(t => t.WorkItems)
                  .HasForeignKey(w => w.TeamId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Sprint İlişkisi (Null olabilir -> Backlog)
            entity.HasOne(w => w.Sprint)
                  .WithMany(s => s.WorkItems)
                  .HasForeignKey(w => w.SprintId)
                  .OnDelete(DeleteBehavior.SetNull);

            // Self-Referencing Parent-Child Hiyerarşisi (Epic -> Feature -> UserStory -> Task)
            entity.HasOne(w => w.Parent)
                  .WithMany(w => w.Children)
                  .HasForeignKey(w => w.ParentId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
