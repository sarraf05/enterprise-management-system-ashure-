using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ashure.Backend.Data;
using Ashure.Backend.DTOs;
using Ashure.Backend.Models;

namespace Ashure.Backend.Controllers;

[ApiController]
[Route("api")]
public class SprintsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<SprintsController> _logger;

    public SprintsController(AppDbContext context, ILogger<SprintsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/teams/{teamId}/sprints
    /// Belirtilen ekibe ait tüm sprintleri listeler.
    /// </summary>
    [HttpGet("teams/{teamId:int}/sprints")]
    public async Task<ActionResult<IEnumerable<Sprint>>> GetTeamSprints(int teamId)
    {
        try
        {
            var sprints = await _context.Sprints
                .AsNoTracking()
                .Where(s => s.TeamId == teamId)
                .OrderByDescending(s => s.IsActive)
                .ThenByDescending(s => s.StartDate)
                .ToListAsync();

            return Ok(sprints);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ekip sprintleri listelenirken hata oluştu. TeamId: {TeamId}", teamId);
            return StatusCode(500, new { message = "Sprintler getirilirken sunucu hatası oluştu." });
        }
    }

    /// <summary>
    /// POST /api/sprints
    /// Yeni bir sprint oluşturur.
    /// </summary>
    [HttpPost("sprints")]
    public async Task<ActionResult<Sprint>> CreateSprint([FromBody] CreateSprintDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var teamExists = await _context.Teams.AnyAsync(t => t.Id == dto.TeamId);
        if (!teamExists)
        {
            return NotFound(new { message = $"ID'si {dto.TeamId} olan ekip bulunamadı." });
        }

        var startDate = dto.StartDate ?? DateTime.UtcNow;
        var endDate = dto.EndDate ?? startDate.AddDays(14);

        var sprint = new Sprint
        {
            TeamId = dto.TeamId,
            Name = dto.Name.Trim(),
            StartDate = startDate,
            EndDate = endDate,
            IsActive = dto.IsActive
        };

        _context.Sprints.Add(sprint);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Yeni sprint oluşturuldu: {SprintName} (ID: {SprintId}, TeamId: {TeamId})",
            sprint.Name, sprint.Id, sprint.TeamId);

        return StatusCode(201, sprint);
    }
}
