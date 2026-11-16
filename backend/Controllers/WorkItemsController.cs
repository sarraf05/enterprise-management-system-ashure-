using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ashure.Backend.Data;
using Ashure.Backend.DTOs;
using Ashure.Backend.Models;

namespace Ashure.Backend.Controllers;

[ApiController]
[Route("api")]
public class WorkItemsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<WorkItemsController> _logger;

    public WorkItemsController(AppDbContext context, ILogger<WorkItemsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// GET /api/teams/{teamId}/workitems
    /// Belirtilen ekibe ait tüm iş öğelerini listeler.
    /// </summary>
    [HttpGet("teams/{teamId:int}/workitems")]
    public async Task<ActionResult<IEnumerable<WorkItem>>> GetTeamWorkItems(int teamId)
    {
        try
        {
            var workItems = await _context.WorkItems
                .AsNoTracking()
                .Where(w => w.TeamId == teamId)
                .OrderBy(w => w.CreatedAt)
                .ToListAsync();

            return Ok(workItems);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İş öğeleri listelenirken hata oluştu. TeamId: {TeamId}", teamId);
            return StatusCode(500, new { message = "İş öğeleri getirilirken sunucu hatası oluştu." });
        }
    }

    /// <summary>
    /// GET /api/workitems/{id}
    /// Tek bir iş öğesinin detaylarını getirir.
    /// </summary>
    [HttpGet("workitems/{id:int}")]
    public async Task<ActionResult<WorkItem>> GetWorkItem(int id)
    {
        var item = await _context.WorkItems
            .Include(w => w.Children)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (item == null)
        {
            return NotFound(new { message = $"ID'si {id} olan iş öğesi bulunamadı." });
        }

        return Ok(item);
    }

    /// <summary>
    /// POST /api/workitems
    /// Yeni bir Epic, Feature, UserStory veya Task ekler.
    /// </summary>
    [HttpPost("workitems")]
    public async Task<ActionResult<WorkItem>> CreateWorkItem([FromBody] CreateWorkItemDto dto)
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

        if (dto.ParentId.HasValue)
        {
            var parentExists = await _context.WorkItems.AnyAsync(w => w.Id == dto.ParentId.Value);
            if (!parentExists)
            {
                return BadRequest(new { message = $"Belirtilen üst öğe (ParentId: {dto.ParentId}) bulunamadı." });
            }
        }

        if (dto.SprintId.HasValue)
        {
            var sprintExists = await _context.Sprints.AnyAsync(s => s.Id == dto.SprintId.Value);
            if (!sprintExists)
            {
                return BadRequest(new { message = $"Belirtilen Sprint (SprintId: {dto.SprintId}) bulunamadı." });
            }
        }

        var workItem = new WorkItem
        {
            TeamId = dto.TeamId,
            SprintId = dto.SprintId,
            ParentId = dto.ParentId,
            Type = dto.Type,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim() ?? string.Empty,
            ExternalDependency = dto.ExternalDependency?.Trim(),
            AcceptanceCriteria = dto.AcceptanceCriteria?.Trim(),
            Status = string.IsNullOrWhiteSpace(dto.Status) ? "New" : dto.Status,
            CreatedAt = DateTime.UtcNow
        };

        _context.WorkItems.Add(workItem);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Yeni iş öğesi eklendi: [{Type}] {Title} (ID: {Id})",
            workItem.Type, workItem.Title, workItem.Id);

        return StatusCode(201, workItem);
    }

    /// <summary>
    /// PUT /api/workitems/{id}
    /// Mevcut bir iş öğesini günceller (Status, SprintId, Title, Description, AcceptanceCriteria, ExternalDependency).
    /// </summary>
    [HttpPut("workitems/{id:int}")]
    public async Task<ActionResult<WorkItem>> UpdateWorkItem(int id, [FromBody] UpdateWorkItemDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var item = await _context.WorkItems.FindAsync(id);
        if (item == null)
        {
            return NotFound(new { message = $"ID'si {id} olan iş öğesi bulunamadı." });
        }

        if (dto.Title != null)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
            {
                return BadRequest(new { message = "Başlık boş olamaz." });
            }
            item.Title = dto.Title.Trim();
        }

        if (dto.Description != null)
        {
            item.Description = dto.Description.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.Status))
        {
            item.Status = dto.Status;
        }

        // SprintId güncellemesi (null atanabilir -> Backlog'a taşıma)
        if (dto.SprintId != null || dto.SprintId == null)
        {
            if (dto.SprintId.HasValue && dto.SprintId > 0)
            {
                var sprintExists = await _context.Sprints.AnyAsync(s => s.Id == dto.SprintId.Value);
                if (!sprintExists)
                {
                    return BadRequest(new { message = $"Belirtilen Sprint (ID: {dto.SprintId}) bulunamadı." });
                }
                item.SprintId = dto.SprintId.Value;
            }
            else
            {
                item.SprintId = null; // Backlog
            }
        }

        if (dto.ParentId.HasValue)
        {
            item.ParentId = dto.ParentId.Value;
        }

        if (dto.ExternalDependency != null)
        {
            item.ExternalDependency = dto.ExternalDependency.Trim();
        }

        if (dto.AcceptanceCriteria != null)
        {
            item.AcceptanceCriteria = dto.AcceptanceCriteria.Trim();
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("İş öğesi güncellendi: [{Type}] {Title} (ID: {Id}, Status: {Status})",
            item.Type, item.Title, item.Id, item.Status);

        return Ok(item);
    }
}
