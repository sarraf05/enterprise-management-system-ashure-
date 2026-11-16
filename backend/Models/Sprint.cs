namespace Ashure.Backend.Models;

/// <summary>
/// Bir ekibe ait zaman dilimli çalışma periyodu (Sprint).
/// </summary>
public class Sprint
{
    public int Id { get; set; }

    public int TeamId { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;

    public DateTime EndDate { get; set; } = DateTime.UtcNow.AddDays(14);

    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Team? Team { get; set; }

    public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
}
