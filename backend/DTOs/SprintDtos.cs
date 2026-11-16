using System.ComponentModel.DataAnnotations;

namespace Ashure.Backend.DTOs;

public class CreateSprintDto
{
    [Required(ErrorMessage = "Takım kimliği (TeamId) zorunludur.")]
    public int TeamId { get; set; }

    [Required(ErrorMessage = "Sprint adı zorunludur.")]
    [StringLength(100, ErrorMessage = "Sprint adı en fazla 100 karakter olabilir.")]
    public string Name { get; set; } = string.Empty;

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdateSprintDto
{
    public string? Name { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool? IsActive { get; set; }
}
