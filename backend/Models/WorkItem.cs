namespace Ashure.Backend.Models;

/// <summary>
/// Kendi kendine bağlanan (Self-Referencing) hiyerarşik iş takip öğesi.
/// Hiyerarşi Akışı: Epic -> Feature -> UserStory -> Task
/// </summary>
public class WorkItem
{
    public int Id { get; set; }

    public int TeamId { get; set; }

    /// <summary>
    /// Null ise Backlog'da kalır; dolu ise ilgili Sprint'e atanmıştır.
    /// </summary>
    public int? SprintId { get; set; }

    /// <summary>
    /// Üst öğe referansı. Epic için null, Feature için Epic Id, UserStory için Feature Id, Task için UserStory Id.
    /// </summary>
    public int? ParentId { get; set; }

    /// <summary>
    /// "Epic" | "Feature" | "UserStory" | "Task"
    /// </summary>
    public string Type { get; set; } = "Task";

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Özellikle UserStory seviyesinde dışa bağımlılıkları belirtmek için.
    /// </summary>
    public string? ExternalDependency { get; set; }

    /// <summary>
    /// Özellikle Task seviyesinde kabul kriterlerini belirtmek için.
    /// </summary>
    public string? AcceptanceCriteria { get; set; }

    /// <summary>
    /// "New" | "Undone" | "Testing" | "Blocked" | "Closed"
    /// </summary>
    public string Status { get; set; } = "New";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Team? Team { get; set; }

    public Sprint? Sprint { get; set; }

    public WorkItem? Parent { get; set; }

    public ICollection<WorkItem> Children { get; set; } = new List<WorkItem>();
}
