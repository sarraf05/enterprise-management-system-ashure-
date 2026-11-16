using System.ComponentModel.DataAnnotations;

namespace Ashure.Backend.DTOs;

public class CreateWorkItemDto
{
    [Required(ErrorMessage = "Takım kimliği (TeamId) zorunludur.")]
    public int TeamId { get; set; }

    public int? SprintId { get; set; }

    public int? ParentId { get; set; }

    [Required(ErrorMessage = "İş öğesi türü (Type) zorunludur.")]
    [RegularExpression("^(Epic|Feature|UserStory|Task)$", ErrorMessage = "Tür sadece Epic, Feature, UserStory veya Task olabilir.")]
    public string Type { get; set; } = "Task";

    [Required(ErrorMessage = "Başlık zorunludur.")]
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Başlık 2 ile 300 karakter arasında olmalıdır.")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? ExternalDependency { get; set; }

    public string? AcceptanceCriteria { get; set; }

    [RegularExpression("^(New|Undone|Testing|Blocked|Closed)$", ErrorMessage = "Durum sadece New, Undone, Testing, Blocked veya Closed olabilir.")]
    public string Status { get; set; } = "New";
}

public class UpdateWorkItemDto
{
    [StringLength(300, MinimumLength = 2, ErrorMessage = "Başlık 2 ile 300 karakter arasında olmalıdır.")]
    public string? Title { get; set; }

    public string? Description { get; set; }

    public int? SprintId { get; set; }

    public int? ParentId { get; set; }

    public string? ExternalDependency { get; set; }

    public string? AcceptanceCriteria { get; set; }

    [RegularExpression("^(New|Undone|Testing|Blocked|Closed)$", ErrorMessage = "Durum sadece New, Undone, Testing, Blocked veya Closed olabilir.")]
    public string? Status { get; set; }
}
