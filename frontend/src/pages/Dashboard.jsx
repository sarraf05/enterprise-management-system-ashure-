import React, { useState, useEffect } from 'react';
import { teamsApi } from '../services/api';
import TeamCard from '../components/TeamCard';
import TeamModal from '../components/TeamModal';
import { IconPlus, IconAlert, IconEmpty } from '../components/Icons';
import './Dashboard.css';

export default function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teamsApi.getAll();
      setTeams(data);
    } catch (err) {
      console.error('Ekipler çekilemedi:', err);
      setError('Ekipler yüklenirken bir sorun oluştu. Lütfen Backend servisinin çalıştığından emin olun.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedTeam(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (team) => {
    setModalMode('edit');
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleSaveTeam = async (formData) => {
    if (modalMode === 'create') {
      await teamsApi.create(formData);
      await fetchTeams();
    } else if (modalMode === 'edit' && selectedTeam) {
      const id = selectedTeam.id ?? selectedTeam.Id;
      await teamsApi.update(id, formData);
      await fetchTeams();
    }
  };

  return (
    <div className="dashboard">
      {/* Üst Başlık ve Aksiyon Barı */}
      <div className="dashboard-header">
        <div className="dashboard-heading">
          <h1 className="dashboard-title">Şirket Ekipleri</h1>
          <p className="dashboard-subtitle">
            Şirket bünyesindeki organizasyonel departmanlar, çalışma alanları ve aktif takımlar
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={handleOpenCreate}>
          <IconPlus width={16} height={16} />
          <span>Yeni Ekip Oluştur</span>
        </button>
      </div>

      {/* Durum Göstergeleri: Yükleniyor / Hata / Boş Liste */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <p className="state-text">Ekipler yükleniyor...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-banner">
          <div className="error-icon-wrap">
            <IconAlert width={20} height={20} />
          </div>
          <div className="error-content">
            <h4>Bağlantı Hatası</h4>
            <p>{error}</p>
            <button type="button" className="btn-retry" onClick={fetchTeams}>
              Yeniden Dene
            </button>
          </div>
        </div>
      )}

      {!loading && !error && teams.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <IconEmpty width={48} height={48} />
          </div>
          <h3>Henüz Ekip Bulunmuyor</h3>
          <p>Şirket organizasyonunu başlatmak için ilk ekibinizi oluşturun.</p>
          <button type="button" className="btn-primary" onClick={handleOpenCreate}>
            <IconPlus width={16} height={16} />
            <span>İlk Ekibi Oluştur</span>
          </button>
        </div>
      )}

      {/* Ekipler Grid Listesi */}
      {!loading && !error && teams.length > 0 && (
        <div className="teams-grid">
          {teams.map((team) => (
            <TeamCard
              key={team.id ?? team.Id}
              team={team}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      )}

      {/* Ekip Ekleme / Düzenleme Modalı */}
      <TeamModal
        isOpen={isModalOpen}
        mode={modalMode}
        team={selectedTeam}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTeam}
      />
    </div>
  );
}
