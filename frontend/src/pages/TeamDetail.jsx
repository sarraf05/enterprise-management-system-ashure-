import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teamsApi, sprintsApi, workItemsApi } from '../services/api';
import BacklogView from '../components/BacklogView';
import SprintView from '../components/SprintView';
import WorkItemDrawer from '../components/WorkItemDrawer';
import CreateWorkItemModal from '../components/CreateWorkItemModal';
import CreateSprintModal from '../components/CreateSprintModal';
import './TeamDetail.css';

export default function TeamDetail() {
  const { id } = useParams();
  const teamId = parseInt(id, 10);

  const [team, setTeam] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'backlog' | 'sprints'
  const [activeTab, setActiveTab] = useState('backlog');

  // Drawer & Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isCreateWorkItemOpen, setIsCreateWorkItemOpen] = useState(false);
  const [createParent, setCreateParent] = useState(null);
  const [createType, setCreateType] = useState('Task');
  const [createSprintId, setCreateSprintId] = useState(null);

  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teamData, sprintsData, workItemsData] = await Promise.all([
        teamsApi.getById(teamId),
        sprintsApi.getByTeamId(teamId).catch(() => []),
        workItemsApi.getByTeamId(teamId).catch(() => []),
      ]);

      setTeam(teamData);
      setSprints(sprintsData);
      setWorkItems(workItemsData);
    } catch (err) {
      console.error('Ekip detay verileri alınamadı:', err);
      setError('Ekip bilgileri ve çalışma alanı verileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teamId]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  };

  const handleOpenCreateTop = () => {
    setCreateParent(null);
    setCreateType('Epic');
    setCreateSprintId(null);
    setIsCreateWorkItemOpen(true);
  };

  const handleAddSubItem = (parentNode) => {
    setCreateParent(parentNode);
    if (parentNode.type === 'Epic') setCreateType('Feature');
    else if (parentNode.type === 'Feature') setCreateType('UserStory');
    else if (parentNode.type === 'UserStory') setCreateType('Task');
    else setCreateType('Task');
    setCreateSprintId(parentNode.sprintId || null);
    setIsCreateWorkItemOpen(true);
  };

  const handleOpenCreateForSprint = (targetSprintId, storyParent = null) => {
    setCreateSprintId(targetSprintId);
    if (storyParent) {
      setCreateParent(storyParent);
      setCreateType('Task');
    } else {
      setCreateParent(null);
      setCreateType('UserStory');
    }
    setIsCreateWorkItemOpen(true);
  };

  const handleCreateWorkItem = async (data) => {
    await workItemsApi.create(data);
    const updated = await workItemsApi.getByTeamId(teamId);
    setWorkItems(updated);
  };

  const handleSaveWorkItem = async (itemId, updateData) => {
    await workItemsApi.update(itemId, updateData);
    const updated = await workItemsApi.getByTeamId(teamId);
    setWorkItems(updated);
  };

  const handleUpdateStatus = async (itemId, newStatus) => {
    setWorkItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );

    try {
      await workItemsApi.update(itemId, { status: newStatus });
    } catch (err) {
      console.error('Durum güncellenemedi:', err);
      const refreshed = await workItemsApi.getByTeamId(teamId);
      setWorkItems(refreshed);
    }
  };

  const handleCreateSprint = async (data) => {
    await sprintsApi.create(data);
    const updatedSprints = await sprintsApi.getByTeamId(teamId);
    setSprints(updatedSprints);
  };

  if (loading) {
    return (
      <div className="team-detail-state">
        <div className="spinner"></div>
        <p>Ekip çalışma alanı ve iş listesi yükleniyor...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="team-detail-error">
        <h3>Ekip Bulunamadı</h3>
        <p>{error || 'İstenen ekip veritabanında mevcut değil.'}</p>
        <Link to="/" className="btn-back">
          Ekipler Listesine Dön
        </Link>
      </div>
    );
  }

  const name = team.name ?? team.Name;
  const description = team.description ?? team.Description;
  const iconColor = team.iconColor ?? team.IconColor ?? '#0078D4';
  const isPilot = team.isPilot ?? team.IsPilot;

  return (
    <div className="team-detail-page">
      {/* Üst Navigasyon & Geri Butonu */}
      <div className="team-top-bar">
        <Link to="/" className="btn-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>Ekiplere Dön</span>
        </Link>

        <div className="team-header-card">
          <div className="team-identity">
            <span className="team-color-indicator" style={{ backgroundColor: iconColor }} />
            <h1 className="team-name-title">{name}</h1>
            {isPilot && (
              <span className="badge badge--pilot-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Pilot Ekip
              </span>
            )}
          </div>
          {description && <p className="team-description-sub">{description}</p>}
        </div>
      </div>

      {/* Sekmeler (Oval Segmented Control Tarzı): Backlog | Sprintler */}
      <div className="team-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'backlog' ? 'active' : ''}`}
          onClick={() => setActiveTab('backlog')}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <span>Backlog Hiyerarşisi</span>
          <span className="tab-counter">{workItems.length}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'sprints' ? 'active' : ''}`}
          onClick={() => setActiveTab('sprints')}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="4" ry="4" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>Sprint Yönetimi</span>
          <span className="tab-counter">{sprints.length}</span>
        </button>
      </div>

      {/* Aktif Sekme İçeriği */}
      <div className="team-tab-content">
        {activeTab === 'backlog' ? (
          <BacklogView
            workItems={workItems}
            sprints={sprints}
            onSelectItem={handleSelectItem}
            onAddSubItem={handleAddSubItem}
            onOpenCreateModal={handleOpenCreateTop}
          />
        ) : (
          <SprintView
            sprints={sprints}
            workItems={workItems}
            onOpenCreateSprint={() => setIsCreateSprintOpen(true)}
            onOpenCreateTask={handleOpenCreateForSprint}
            onUpdateStatus={handleUpdateStatus}
            onSelectItem={handleSelectItem}
          />
        )}
      </div>

      {/* Çekmece ve Modallar */}
      <WorkItemDrawer
        isOpen={isDrawerOpen}
        item={selectedItem}
        sprints={sprints}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveWorkItem}
      />

      <CreateWorkItemModal
        isOpen={isCreateWorkItemOpen}
        teamId={teamId}
        sprints={sprints}
        allWorkItems={workItems}
        defaultParent={createParent}
        defaultType={createType}
        defaultSprintId={createSprintId}
        onClose={() => setIsCreateWorkItemOpen(false)}
        onCreate={handleCreateWorkItem}
      />

      <CreateSprintModal
        isOpen={isCreateSprintOpen}
        teamId={teamId}
        onClose={() => setIsCreateSprintOpen(false)}
        onCreate={handleCreateSprint}
      />
    </div>
  );
}