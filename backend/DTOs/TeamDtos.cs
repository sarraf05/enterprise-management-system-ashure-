using System.ComponentModel.DataAnnotations;

namespace Ashure.Backend.DTOs;

public class CreateTeamDto
{
    [Required(ErrorMessage = "Ekip adı zorunludur.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Ekip adı 2 ile 200 karakter arasında olmalıdır.")]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string IconColor { get; set; } = "#0078D4";

    public bool IsPilot { get; set; } = false;
}

public class UpdateTeamDto
{
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Ekip adı 2 ile 200 karakter arasında olmalıdır.")]
    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? IconColor { get; set; }

    public bool? IsPilot { get; set; }
}
