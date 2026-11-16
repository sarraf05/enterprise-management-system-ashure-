import React, { useState, useEffect } from 'react';
import { IconClose, IconAlert, IconCheck } from './Icons';
import './WorkItemDrawer.css';

const STATUS_OPTIONS = ['New', 'Undone', 'Testing', 'Blocked', 'Closed'];

export default function WorkItemDrawer({ isOpen, item, sprints, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('New');
  const [sprintId, setSprintId] = useState('');
  const [externalDependency, setExternalDependency] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setStatus(item.status || 'New');
      setSprintId(item.sprintId ? String(item.sprintId) : '');
      setExternalDependency(item.externalDependency || '');
      setAcceptanceCriteria(item.acceptanceCriteria || '');
      setError('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('İş öğesi başlığı boş olamaz.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(item.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        sprintId: sprintId ? parseInt(sprintId, 10) : null,
        externalDependency: item.type === 'UserStory' ? externalDependency.trim() : item.externalDependency,
        acceptanceCriteria: item.type === 'Task' ? acceptanceCriteria.trim() : item.acceptanceCriteria,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const isUserStory = item.type === 'UserStory';
  const isTask = item.type === 'Task';

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Üst Bar */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <span className={`type-badge type-badge--${item.type.toLowerCase()}`}>
              {item.type}
            </span>
            <span className="drawer-item-id">#{item.id}</span>
          </div>
          <button type="button" className="drawer-close-btn" onClick={onClose} title="Kapat">
            <IconClose width={18} height={18} />
          </button>
        </div>

        {error && <div className="drawer-error">{error}</div>}

        <form onSubmit={handleSubmit} className="drawer-form">
          {/* Başlık */}
          <div className="drawer-field">
            <label htmlFor="drawer-title">Başlık</label>
            <input
              id="drawer-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 5 Durum Seçici (Pill Butonlar) */}
          <div className="drawer-field">
            <label>Durum (Status)</label>
            <div className="status-button-group">
              {STATUS_OPTIONS.map((st) => (
                <button
                  type="button"
                  key={st}
                  className={`status-badge status-badge--${st.toLowerCase()} drawer-status-btn ${
                    status === st ? 'is-selected' : 'is-unselected'
                  }`}
                  onClick={() => setStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sprint Seçimi */}
          <div className="drawer-field">
            <label htmlFor="drawer-sprint">Sprint Ataması</label>
            <select
              id="drawer-sprint"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
            >
              <option value="">(Backlog - Sprint Dışı)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isActive ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* User Story Özel Alanı: Dışa Bağımlılık */}
          {isUserStory && (
            <div className="drawer-field dependency-card">
              <div className="field-header">
                <IconAlert width={16} height={16} />
                <label htmlFor="drawer-dependency">Dışa Bağımlılık (External Dependency)</label>
              </div>
              <p className="field-hint">
                Bu User Story'nin tamamlanması için başka bir ekibe, servise veya üçüncü taraf API'ye olan bağımlılıkları belirtin.
              </p>
              <textarea
                id="drawer-dependency"
                rows="3"
                placeholder="Örn: Muhasebe mikroservisi fatura API şablonu veya Banka Sanal POS anahtarları bekleniyor..."
                value={externalDependency}
                onChange={(e) => setExternalDependency(e.target.value)}
              />
            </div>
          )}

          {/* Task Özel Alanı: Kabul Kriterleri */}
          {isTask && (
            <div className="drawer-field criteria-card">
              <div className="field-header">
                <IconCheck width={16} height={16} />
                <label htmlFor="drawer-criteria">Kabul Kriterleri (Acceptance Criteria)</label>
              </div>
              <p className="field-hint">
                Bu görevin tamamlanmış (Done) sayılması için sağlanması gereken somut kabul koşulları.
              </p>
              <textarea
                id="drawer-criteria"
                rows="3"
                placeholder="Örn: İstek zaman aşımı 5 saniye olmalı ve hata durumunda 3 kez yeniden denenmeli..."
                value={acceptanceCriteria}
                onChange={(e) => setAcceptanceCriteria(e.target.value)}
              />
            </div>
          )}

          {/* Açıklama */}
          <div className="drawer-field">
            <label htmlFor="drawer-desc">Detaylı Açıklama</label>
            <textarea
              id="drawer-desc"
              rows="4"
              placeholder="İşin kapsamı, teknik detaylar ve notlar..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Butonlar */}
          <div className="drawer-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
            >
              {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
