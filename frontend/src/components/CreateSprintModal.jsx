import React, { useState, useEffect } from 'react';
import { IconClose, IconCalendar } from './Icons';
import './TeamModal.css';

export default function CreateSprintModal({ isOpen, teamId, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const twoWeeksLater = new Date();
      twoWeeksLater.setDate(today.getDate() + 14);

      setName('');
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(twoWeeksLater.toISOString().split('T')[0]);
      setIsActive(true);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Lütfen sprint adını giriniz.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Lütfen başlangıç ve bitiş tarihlerini seçiniz.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('Bitiş tarihi başlangıç tarihinden önce olamaz.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onCreate({
        teamId,
        name: name.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isActive,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Sprint oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span
              className="modal-color-preview"
              style={{
                backgroundColor: '#EFF6FC',
                color: '#0078D4',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
            >
              <IconCalendar width={16} height={16} />
            </span>
            <h2 className="modal-title">Yeni Sprint Oluştur</h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Kapat">
            <IconClose width={18} height={18} />
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="sprint-name">
              Sprint Adı <span className="required">*</span>
            </label>
            <input
              id="sprint-name"
              type="text"
              placeholder="Örn: Sprint 2 - Ödeme Altyapısı"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="sprint-start">
                Başlangıç Tarihi <span className="required">*</span>
              </label>
              <input
                id="sprint-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="sprint-end">
                Bitiş Tarihi <span className="required">*</span>
              </label>
              <input
                id="sprint-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-checkbox-card">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <div className="checkbox-text">
                <strong>Aktif Sprint Olarak Başlat</strong>
                <p>Sprint yönetimi ekranında varsayılan çalışma dönemi olarak seçili gelir.</p>
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
              {isSubmitting ? 'Oluşturuluyor...' : 'Sprinti Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}