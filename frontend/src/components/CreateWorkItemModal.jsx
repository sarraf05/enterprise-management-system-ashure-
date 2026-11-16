import React, { useState, useEffect } from 'react';
import { IconClose, IconAlert, IconCheck } from './Icons';
import './CreateWorkItemModal.css';

export default function CreateWorkItemModal({
  isOpen,
  teamId,
  sprints,
  allWorkItems,
  defaultParent,
  defaultType,
  defaultSprintId,
  onClose,
  onCreate,
}) {
  const [type, setType] = useState('Task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [sprintId, setSprintId] = useState('');
  const [externalDependency, setExternalDependency] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [status, setStatus] = useState('New');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (defaultParent) {
        setParentId(String(defaultParent.id));
        if (defaultParent.type === 'Epic') setType('Feature');
        else if (defaultParent.type === 'Feature') setType('UserStory');
        else if (defaultParent.type === 'UserStory') setType('Task');
        else setType('Task');
      } else if (defaultType) {
        setType(defaultType);
        setParentId('');
      } else {
        setType('Task');
        setParentId('');
      }

      if (defaultSprintId) {
        setSprintId(String(defaultSprintId));
      } else {
        setSprintId('');
      }

      setTitle('');
      setDescription('');
      setExternalDependency('');
      setAcceptanceCriteria('');
      setStatus('New');
      setError('');
    }
  }, [isOpen, defaultParent, defaultType, defaultSprintId]);

  if (!isOpen) return null;

  const getEligibleParents = () => {
    if (type === 'Feature') return allWorkItems.filter((w) => w.type === 'Epic');
    if (type === 'UserStory') return allWorkItems.filter((w) => w.type === 'Feature');
    if (type === 'Task') return allWorkItems.filter((w) => w.type === 'UserStory');
    return [];
  };

  const eligibleParents = getEligibleParents();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lütfen bir başlık giriniz.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onCreate({
        teamId,
        type,
        title: title.trim(),
        description: description.trim(),
        parentId: parentId ? parseInt(parentId, 10) : null,
        sprintId: sprintId ? parseInt(sprintId, 10) : null,
        externalDependency: type === 'UserStory' ? externalDependency.trim() : null,
        acceptanceCriteria: type === 'Task' ? acceptanceCriteria.trim() : null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'İş öğesi oluşturulamadı.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-workitem" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className={`type-badge type-badge--${type.toLowerCase()}`}>{type}</span>
            <h2 className="modal-title">
              {defaultParent ? `Alt Öğe Ekle (#${defaultParent.id} altına)` : 'Yeni İş Öğesi Ekle'}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Kapat">
            <IconClose width={18} height={18} />
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="wi-type">İş Öğesi Türü <span className="required">*</span></label>
            <select
              id="wi-type"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setParentId('');
              }}
            >
              <option value="Epic">Epic (Büyük Stratejik Hedef)</option>
              <option value="Feature">Feature (Özellik / Modül)</option>
              <option value="UserStory">User Story (Kullanıcı Hikayesi)</option>
              <option value="Task">Task (Teknik Görev)</option>
            </select>
          </div>

          {type !== 'Epic' && (
            <div className="form-group">
              <label htmlFor="wi-parent">
                Bağlı Olduğu Üst Öğe {type === 'Feature' ? '(Epic)' : type === 'UserStory' ? '(Feature)' : '(User Story)'}
              </label>
              <select
                id="wi-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">(Üst Öğe Seçin)</option>
                {eligibleParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - [{p.type}] {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="wi-title">Başlık <span className="required">*</span></label>
            <input
              id="wi-title"
              type="text"
              placeholder="Örn: 3D Secure SMS Doğrulama Entegrasyonu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="wi-sprint">Sprint Ataması</label>
            <select
              id="wi-sprint"
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
            >
              <option value="">(Backlog - Henüz Sprint'e Atanmadı)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.isActive ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          </div>

          {type === 'UserStory' && (
            <div className="form-group dependency-field">
              <label htmlFor="wi-dependency" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconAlert width={15} height={15} />
                <span>Dışa Bağımlılık (External Dependency)</span>
              </label>
              <input
                id="wi-dependency"
                type="text"
                placeholder="Örn: İyzico API anahtarları veya Muhasebe servis sözleşmesi bekleniyor..."
                value={externalDependency}
                onChange={(e) => setExternalDependency(e.target.value)}
              />
            </div>
          )}

          {type === 'Task' && (
            <div className="form-group criteria-field">
              <label htmlFor="wi-criteria" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCheck width={15} height={15} />
                <span>Kabul Kriterleri (Acceptance Criteria)</span>
              </label>
              <input
                id="wi-criteria"
                type="text"
                placeholder="Örn: Timeout 5 sn olmalı, geçersiz imzada hata dönmeli..."
                value={acceptanceCriteria}
                onChange={(e) => setAcceptanceCriteria(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="wi-desc">Açıklama</label>
            <textarea
              id="wi-desc"
              rows="3"
              placeholder="Detaylar, teknik notlar veya kullanıcı isterleri..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              {isSubmitting ? 'Ekleniyor...' : 'Öğeyi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}