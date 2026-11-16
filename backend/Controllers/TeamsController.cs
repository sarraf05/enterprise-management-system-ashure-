using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ashure.Backend.Data;
using Ashure.Backend.DTOs;
using Ashure.Backend.Models;

namespace Ashure.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TeamsController> _logger;

    public TeamsController(AppDbContext context, ILogger<TeamsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/teams
    /// Tüm şirket ekiplerini listeler. Pilot ekipler en üstte sıralanır.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Team>>> GetTeams()
    {
        try
        {
            var teams = await _context.Teams
                .AsNoTracking()
                .OrderByDescending(t => t.IsPilot)
                .ThenBy(t => t.CreatedAt)
                .ToListAsync();

            return Ok(teams);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ekipler listelenirken hata oluştu.");
            return StatusCode(500, new { message = "Ekipler getirilirken sunucu hatası oluştu." });
        }
    }

    /// <summary>
    /// GET /api/teams/{id}
    /// Tek bir ekibin detay bilgilerini getirir.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Team>> GetTeam(int id)
    {
        var team = await _context.Teams.FindAsync(id);

        if (team == null)
        {
            return NotFound(new { message = $"ID'si {id} olan ekip bulunamadı." });
        }

        return Ok(team);
    }

    /// <summary>
    /// POST /api/teams
    /// Yeni bir ekip oluşturur.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Team>> CreateTeam([FromBody] CreateTeamDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var team = new Team
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            IconColor = string.IsNullOrWhiteSpace(dto.IconColor) ? "#0078D4" : dto.IconColor.Trim(),
            IsPilot = dto.IsPilot,
            CreatedAt = DateTime.UtcNow
        };

        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Yeni ekip eklendi: {TeamName} (ID: {TeamId})", team.Name, team.Id);

        return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
    }

    /// <summary>
    /// PUT /api/teams/{id}
    /// Mevcut bir ekibin bilgilerini günceller.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Team>> UpdateTeam(int id, [FromBody] UpdateTeamDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var team = await _context.Teams.FindAsync(id);
        if (team == null)
        {
            return NotFound(new { message = $"ID'si {id} olan ekip bulunamadı." });
        }

        if (dto.Name != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return BadRequest(new { message = "Ekip adı boş olamaz." });
            }
            team.Name = dto.Name.Trim();
        }

        if (dto.Description != null)
        {
            team.Description = dto.Description.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.IconColor))
        {
            team.IconColor = dto.IconColor.Trim();
        }

        if (dto.IsPilot.HasValue)
        {
            team.IsPilot = dto.IsPilot.Value;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Ekip güncellendi: {TeamName} (ID: {TeamId})", team.Name, team.Id);

        return Ok(team);
    }
}
