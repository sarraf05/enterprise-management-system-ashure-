import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconEdit, IconChevronRight } from './Icons';
import './TeamCard.css';

export default function TeamCard({ team, onEdit }) {
  const navigate = useNavigate();

  const id = team.id ?? team.Id;
  const name = team.name ?? team.Name;
  const description = team.description ?? team.Description;
  const iconColor = team.iconColor ?? team.IconColor ?? '#0078D4';
  const isPilot = team.isPilot ?? team.IsPilot;

  const handleCardClick = () => {
    navigate(`/teams/${id}`);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(team);
  };

  return (
    <div className={`team-card ${isPilot ? 'team-card--pilot' : ''}`} onClick={handleCardClick}>
      {/* Üst Renk Vurgusu */}
      <div className="team-card-accent" style={{ backgroundColor: iconColor }} />

      <div className="team-card-body">
        {/* Üst Başlık ve Rozetler */}
        <div className="team-card-header">
          <div className="team-card-title-group">
            <span className="team-color-dot" style={{ backgroundColor: iconColor }} />
            <h3 className="team-card-title">{name}</h3>
          </div>

          <div className="team-card-badges">
            {isPilot && (
              <span className="pilot-pill" title="Aktif geliştirilen pilot ekip">
                Pilot Ekip
              </span>
            )}
            <button
              type="button"
              className="btn-card-edit"
              onClick={handleEditClick}
              title="Ekip bilgilerini düzenle"
              aria-label="Ekibi düzenle"
            >
              <IconEdit width={13} height={13} />
              <span>Düzenle</span>
            </button>
          </div>
        </div>

        {/* Ekip Açıklaması */}
        <p className="team-card-desc">
          {description || 'Bu ekip için henüz bir açıklama eklenmedi.'}
        </p>

        {/* Kart Alt Bilgisi */}
        <div className="team-card-footer">
          <span className="team-card-action">
            <span>Çalışma Alanı</span>
            <IconChevronRight width={14} height={14} />
          </span>
        </div>
      </div>
    </div>
  );
}
