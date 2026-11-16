namespace Ashure.Backend.Models;

/// <summary>
/// Şirket bünyesindeki ekipleri temsil eden ana Entity.
/// </summary>
public class Team
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IconColor { get; set; } = "#0078D4";

    public bool IsPilot { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();

    public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
}
