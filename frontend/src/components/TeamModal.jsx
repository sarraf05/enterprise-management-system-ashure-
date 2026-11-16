import React, { useState, useEffect } from 'react';
import { IconClose } from './Icons';
import './TeamModal.css';

const PRESET_COLORS = [
  { name: 'Azure Mavi', value: '#0078D4' },
  { name: 'Orman Yeşili', value: '#107C10' },
  { name: 'Azure Turuncu', value: '#D83B01' },
  { name: 'Kurumsal Mor', value: '#8661C5' },
  { name: 'Deniz Mavisi', value: '#008272' },
  { name: 'Kırmızı Mercan', value: '#D13438' },
];

export default function TeamModal({ isOpen, mode, team, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconColor, setIconColor] = useState('#0078D4');
  const [isPilot, setIsPilot] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team && mode === 'edit') {
      setName(team.name ?? team.Name ?? '');
      setDescription(team.description ?? team.Description ?? '');
      setIconColor(team.iconColor ?? team.IconColor ?? '#0078D4');
      setIsPilot(Boolean(team.isPilot ?? team.IsPilot));
    } else {
      setName('');
      setDescription('');
      setIconColor('#0078D4');
      setIsPilot(false);
    }
    setError('');
  }, [team, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lütfen ekip adını giriniz.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        iconColor,
        isPilot,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Başlık */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-color-preview" style={{ backgroundColor: iconColor }} />
            <h2 className="modal-title">
              {mode === 'edit' ? 'Ekibi Düzenle' : 'Yeni Ekip Oluştur'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Kapat">
            <IconClose width={18} height={18} />
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="team-name">Ekip Adı <span className="required">*</span></label>
            <input
              id="team-name"
              type="text"
              placeholder="Örn: Mobil Geliştirme Ekibi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="team-desc">Ekip Görevi ve Açıklaması</label>
            <textarea
              id="team-desc"
              rows="3"
              placeholder="Bu ekibin ana sorumluluklarını ve odak alanını belirtin..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Ekip Rengi (Görsel Ayrım)</label>
            <div className="color-palette">
              {PRESET_COLORS.map((col) => (
                <button
                  type="button"
                  key={col.value}
                  className={`color-swatch ${iconColor === col.value ? 'selected' : ''}`}
                  style={{ backgroundColor: col.value }}
                  onClick={() => setIconColor(col.value)}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          <div className="form-checkbox-card">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isPilot}
                onChange={(e) => setIsPilot(e.target.checked)}
              />
              <div className="checkbox-text">
                <strong>Pilot Ekip Olarak İşaretle</strong>
                <p>Aktif üzerinde çalışılan ana odak ekibi olarak en üstte gösterilir.</p>
              </div>
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Kaydediliyor...' : mode === 'edit' ? 'Değişiklikleri Kaydet' : 'Ekibi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
