// ====================================================================
// ASHURE Backend API Runner (Zero-Dependency SQLite REST Service)
// C# ASP.NET Core Web API projesinin /api/teams, /api/sprints ve
// /api/workitems uç noktalarını aynı kontrat ile sunar.
// ====================================================================

const http = require('node:http');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 5000;
const DB_PATH = path.resolve(__dirname, '..', 'database', 'azure_clone.db');

const db = new DatabaseSync(DB_PATH);

// Helper: JSON yanıt gönder
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// Helper: Request body parse
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Normalizers
function normalizeTeam(row) {
  if (!row) return null;
  return {
    id: row.Id,
    name: row.Name,
    description: row.Description || '',
    iconColor: row.IconColor || '#0078D4',
    isPilot: Boolean(row.IsPilot),
    createdAt: row.CreatedAt
  };
}

function normalizeSprint(row) {
  if (!row) return null;
  return {
    id: row.Id,
    teamId: row.TeamId,
    name: row.Name,
    startDate: row.StartDate,
    endDate: row.EndDate,
    isActive: Boolean(row.IsActive)
  };
}

function normalizeWorkItem(row) {
  if (!row) return null;
  return {
    id: row.Id,
    teamId: row.TeamId,
    sprintId: row.SprintId,
    parentId: row.ParentId,
    type: row.Type,
    title: row.Title,
    description: row.Description || '',
    externalDependency: row.ExternalDependency || null,
    acceptanceCriteria: row.AcceptanceCriteria || null,
    status: row.Status || 'New',
    createdAt: row.CreatedAt
  };
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    // ----------------------------------------------------
    // TEAMS ENDPOINTS
    // ----------------------------------------------------

    // GET /api/teams
    if (req.method === 'GET' && pathname === '/api/teams') {
      const rows = db.prepare('SELECT * FROM Teams ORDER BY IsPilot DESC, CreatedAt ASC').all();
      return sendJson(res, 200, rows.map(normalizeTeam));
    }

    // GET /api/teams/:id
    const teamIdMatch = pathname.match(/^\/api\/teams\/(\d+)$/);
    if (req.method === 'GET' && teamIdMatch) {
      const id = parseInt(teamIdMatch[1], 10);
      const row = db.prepare('SELECT * FROM Teams WHERE Id = ?').get(id);
      if (!row) {
        return sendJson(res, 404, { message: `ID'si ${id} olan ekip bulunamadı.` });
      }
      return sendJson(res, 200, normalizeTeam(row));
    }

    // POST /api/teams
    if (req.method === 'POST' && pathname === '/api/teams') {
      const body = await parseBody(req);
      const name = (body.name || '').trim();
      const description = (body.description || '').trim();
      const iconColor = (body.iconColor || '#0078D4').trim();
      const isPilot = body.isPilot ? 1 : 0;

      if (!name) {
        return sendJson(res, 400, { message: 'Ekip adı zorunludur.' });
      }

      const stmt = db.prepare(`
        INSERT INTO Teams (Name, Description, IconColor, IsPilot, CreatedAt)
        VALUES (?, ?, ?, ?, datetime('now'))
      `);
      const result = stmt.run(name, description, iconColor, isPilot);

      const created = db.prepare('SELECT * FROM Teams WHERE Id = ?').get(result.lastInsertRowid);
      return sendJson(res, 201, normalizeTeam(created));
    }

    // PUT /api/teams/:id
    if (req.method === 'PUT' && teamIdMatch) {
      const id = parseInt(teamIdMatch[1], 10);
      const existing = db.prepare('SELECT * FROM Teams WHERE Id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { message: `ID'si ${id} olan ekip bulunamadı.` });
      }

      const body = await parseBody(req);
      const name = body.name !== undefined ? body.name.trim() : existing.Name;
      const description = body.description !== undefined ? body.description.trim() : existing.Description;
      const iconColor = body.iconColor !== undefined ? body.iconColor.trim() : existing.IconColor;
      const isPilot = body.isPilot !== undefined ? (body.isPilot ? 1 : 0) : existing.IsPilot;

      if (!name) {
        return sendJson(res, 400, { message: 'Ekip adı boş olamaz.' });
      }

      const stmt = db.prepare(`
        UPDATE Teams
        SET Name = ?, Description = ?, IconColor = ?, IsPilot = ?
        WHERE Id = ?
      `);
      stmt.run(name, description, iconColor, isPilot, id);

      const updated = db.prepare('SELECT * FROM Teams WHERE Id = ?').get(id);
      return sendJson(res, 200, normalizeTeam(updated));
    }

    // ----------------------------------------------------
    // SPRINTS ENDPOINTS
    // ----------------------------------------------------

    // GET /api/teams/:teamId/sprints
    const teamSprintsMatch = pathname.match(/^\/api\/teams\/(\d+)\/sprints$/);
    if (req.method === 'GET' && teamSprintsMatch) {
      const teamId = parseInt(teamSprintsMatch[1], 10);
      const rows = db.prepare('SELECT * FROM Sprints WHERE TeamId = ? ORDER BY IsActive DESC, StartDate DESC').all(teamId);
      return sendJson(res, 200, rows.map(normalizeSprint));
    }

    // POST /api/sprints
    if (req.method === 'POST' && pathname === '/api/sprints') {
      const body = await parseBody(req);
      const teamId = parseInt(body.teamId, 10);
      const name = (body.name || '').trim();
      const startDate = body.startDate || new Date().toISOString();
      const endDate = body.endDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
      const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1;

      if (!teamId || !name) {
        return sendJson(res, 400, { message: 'Takım ID ve Sprint adı zorunludur.' });
      }

      const stmt = db.prepare(`
        INSERT INTO Sprints (TeamId, Name, StartDate, EndDate, IsActive)
        VALUES (?, ?, ?, ?, ?)
      `);
      const result = stmt.run(teamId, name, startDate, endDate, isActive);
      const created = db.prepare('SELECT * FROM Sprints WHERE Id = ?').get(result.lastInsertRowid);
      return sendJson(res, 201, normalizeSprint(created));
    }

    // ----------------------------------------------------
    // WORKITEMS ENDPOINTS
    // ----------------------------------------------------

    // GET /api/teams/:teamId/workitems
    const teamWorkItemsMatch = pathname.match(/^\/api\/teams\/(\d+)\/workitems$/);
    if (req.method === 'GET' && teamWorkItemsMatch) {
      const teamId = parseInt(teamWorkItemsMatch[1], 10);
      const rows = db.prepare('SELECT * FROM WorkItems WHERE TeamId = ? ORDER BY CreatedAt ASC').all(teamId);
      return sendJson(res, 200, rows.map(normalizeWorkItem));
    }

    // GET /api/workitems/:id
    const workItemIdMatch = pathname.match(/^\/api\/workitems\/(\d+)$/);
    if (req.method === 'GET' && workItemIdMatch) {
      const id = parseInt(workItemIdMatch[1], 10);
      const row = db.prepare('SELECT * FROM WorkItems WHERE Id = ?').get(id);
      if (!row) {
        return sendJson(res, 404, { message: `ID'si ${id} olan iş öğesi bulunamadı.` });
      }
      return sendJson(res, 200, normalizeWorkItem(row));
    }

    // POST /api/workitems
    if (req.method === 'POST' && pathname === '/api/workitems') {
      const body = await parseBody(req);
      const teamId = parseInt(body.teamId, 10);
      const type = (body.type || 'Task').trim();
      const title = (body.title || '').trim();
      const description = (body.description || '').trim();
      const parentId = body.parentId ? parseInt(body.parentId, 10) : null;
      const sprintId = body.sprintId ? parseInt(body.sprintId, 10) : null;
      const externalDependency = body.externalDependency ? body.externalDependency.trim() : null;
      const acceptanceCriteria = body.acceptanceCriteria ? body.acceptanceCriteria.trim() : null;
      const status = (body.status || 'New').trim();

      if (!teamId || !title) {
        return sendJson(res, 400, { message: 'Takım ID ve başlık zorunludur.' });
      }

      const stmt = db.prepare(`
        INSERT INTO WorkItems (TeamId, SprintId, ParentId, Type, Title, Description, ExternalDependency, AcceptanceCriteria, Status, CreatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      const result = stmt.run(teamId, sprintId, parentId, type, title, description, externalDependency, acceptanceCriteria, status);
      const created = db.prepare('SELECT * FROM WorkItems WHERE Id = ?').get(result.lastInsertRowid);
      return sendJson(res, 201, normalizeWorkItem(created));
    }

    // PUT /api/workitems/:id
    if (req.method === 'PUT' && workItemIdMatch) {
      const id = parseInt(workItemIdMatch[1], 10);
      const existing = db.prepare('SELECT * FROM WorkItems WHERE Id = ?').get(id);
      if (!existing) {
        return sendJson(res, 404, { message: `ID'si ${id} olan iş öğesi bulunamadı.` });
      }

      const body = await parseBody(req);
      const title = body.title !== undefined ? body.title.trim() : existing.Title;
      const description = body.description !== undefined ? body.description.trim() : existing.Description;
      const status = body.status !== undefined ? body.status.trim() : existing.Status;
      
      let sprintId = existing.SprintId;
      if (body.sprintId !== undefined) {
        sprintId = (body.sprintId && parseInt(body.sprintId, 10) > 0) ? parseInt(body.sprintId, 10) : null;
      }

      let parentId = existing.ParentId;
      if (body.parentId !== undefined) {
        parentId = (body.parentId && parseInt(body.parentId, 10) > 0) ? parseInt(body.parentId, 10) : null;
      }

      const externalDependency = body.externalDependency !== undefined ? (body.externalDependency ? body.externalDependency.trim() : null) : existing.ExternalDependency;
      const acceptanceCriteria = body.acceptanceCriteria !== undefined ? (body.acceptanceCriteria ? body.acceptanceCriteria.trim() : null) : existing.AcceptanceCriteria;

      if (!title) {
        return sendJson(res, 400, { message: 'Başlık boş olamaz.' });
      }

      const stmt = db.prepare(`
        UPDATE WorkItems
        SET Title = ?, Description = ?, Status = ?, SprintId = ?, ParentId = ?, ExternalDependency = ?, AcceptanceCriteria = ?
        WHERE Id = ?
      `);
      stmt.run(title, description, status, sprintId, parentId, externalDependency, acceptanceCriteria, id);

      const updated = db.prepare('SELECT * FROM WorkItems WHERE Id = ?').get(id);
      return sendJson(res, 200, normalizeWorkItem(updated));
    }

    // Sağlık kontrolü
    if (pathname === '/api/health') {
      return sendJson(res, 200, { status: 'healthy', timestamp: new Date().toISOString() });
    }

    return sendJson(res, 404, { message: 'Endpoint bulunamadı' });
  } catch (err) {
    console.error('[API Error]:', err);
    return sendJson(res, 500, { message: 'Sunucu hatası oluştu', error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`[ASHURE Backend API] Port ${PORT} üzerinde çalışıyor.`);
  console.log(`[Database] SQLite bağlı: ${DB_PATH}`);
});
