const API_BASE_URL = '/api';

export const teamsApi = {
  // Tüm ekipleri getir
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/teams`);
    if (!res.ok) {
      throw new Error(`Ekipler yüklenemedi (HTTP ${res.status})`);
    }
    return res.json();
  },

  // Tek ekip detayını getir
  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`);
    if (!res.ok) {
      throw new Error(`Ekip bulunamadı (HTTP ${res.status})`);
    }
    return res.json();
  },

  // Yeni ekip oluştur
  async create(teamData) {
    const res = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Ekip oluşturulamadı (HTTP ${res.status})`);
    }
    return res.json();
  },

  // Ekip bilgilerini güncelle
  async update(id, teamData) {
    const res = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Ekip güncellenemedi (HTTP ${res.status})`);
    }
    return res.json();
  },
};

export const sprintsApi = {
  // Ekibe ait sprintleri getir
  async getByTeamId(teamId) {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/sprints`);
    if (!res.ok) {
      throw new Error(`Sprintler yüklenemedi (HTTP ${res.status})`);
    }
    return res.json();
  },

  // Yeni sprint oluştur
  async create(sprintData) {
    const res = await fetch(`${API_BASE_URL}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sprintData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Sprint oluşturulamadı (HTTP ${res.status})`);
    }
    return res.json();
  },
};

export const workItemsApi = {
  // Ekibe ait tüm iş öğelerini getir
  async getByTeamId(teamId) {
    const res = await fetch(`${API_BASE_URL}/teams/${teamId}/workitems`);
    if (!res.ok) {
      throw new Error(`İş öğeleri yüklenemedi (HTTP ${res.status})`);
    }
    return res.json();
  },

  // Tek iş öğesi detayı
  async getById(id) {
    const res = await fetch(`${API_BASE_URL}/workitems/${id}`);
    if (!res.ok) {
      throw new Error(`İş öğesi bulunamadı (HTTP ${res.status})`);
    }
    return res.json();
  },

  // Yeni iş öğesi ekle
  async create(workItemData) {
    const res = await fetch(`${API_BASE_URL}/workitems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workItemData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `İş öğesi oluşturulamadı (HTTP ${res.status})`);
    }
    return res.json();
  },

  // İş öğesini güncelle (Status, SprintId, Title vb.)
  async update(id, updateData) {
    const res = await fetch(`${API_BASE_URL}/workitems/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `İş öğesi güncellenemedi (HTTP ${res.status})`);
    }
    return res.json();
  },
};
