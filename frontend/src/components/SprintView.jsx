import React, { useState } from 'react';
import {
  IconPlus,
  IconCalendar,
  IconAlert,
  IconCheck,
  IconEmpty,
  IconUserStory,
  IconTask,
} from './Icons';
import './SprintView.css';

const STATUS_LIST = ['New', 'Undone', 'Testing', 'Blocked', 'Closed'];

export default function SprintView({
  sprints,
  workItems,
  onOpenCreateSprint,
  onOpenCreateTask,
  onUpdateStatus,
  onSelectItem,
}) {
  const [selectedSprintId, setSelectedSprintId] = useState(() => {
    const active = sprints.find((s) => s.isActive);
    return active ? active.id : sprints[0]?.id || null;
  });

  const currentSprint = sprints.find((s) => s.id === selectedSprintId) || sprints[0] || null;

  // Seçili sprinte ait işler
  const sprintItems = workItems.filter((w) => w.sprintId === currentSprint?.id);

  // Bu sprintteki User Story'ler
  const storiesInSprint = sprintItems.filter((w) => w.type === 'UserStory');

  // Her Story'nin bu sprintteki Task'ları
  const getTasksForStory = (storyId) => {
    return sprintItems.filter((w) => w.type === 'Task' && w.parentId === storyId);
  };

  // Doğrudan sprint'e atanmış bağımsız görevler
  const standaloneTasks = sprintItems.filter(
    (w) => w.type === 'Task' && (!w.parentId || !storiesInSprint.some((s) => s.id === w.parentId))
  );

  const handleStatusChange = (e, itemId, newStatus) => {
    e.stopPropagation();
    onUpdateStatus(itemId, newStatus);
  };

  return (
    <div className="sprint-view">
      {/* Sprint Seçici ve Bilgi Üst Barı */}
      <div className="sprint-toolbar">
        <div className="sprint-selector-group">
          <label htmlFor="sprint-select">Sprint Seçimi:</label>
          <select
            id="sprint-select"
            value={currentSprint?.id || ''}
            onChange={(e) => setSelectedSprintId(parseInt(e.target.value, 10))}
            className="sprint-dropdown"
          >
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.isActive ? '(Aktif)' : ''}
              </option>
            ))}
          </select>

          {currentSprint && (
            <div className="sprint-dates">
              <IconCalendar width={15} height={15} />
              <span>
                {new Date(currentSprint.startDate).toLocaleDateString('tr-TR')} —{' '}
                {new Date(currentSprint.endDate).toLocaleDateString('tr-TR')}
              </span>
              {currentSprint.isActive && (
                <span className="active-sprint-badge">Aktif Sprint</span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={onOpenCreateSprint}
        >
          <IconPlus width={15} height={15} />
          <span>Yeni Sprint Oluştur</span>
        </button>
      </div>

      {/* Sprint İçi Görevler Listesi */}
      {!currentSprint ? (
        <div className="sprint-empty">
          <div className="empty-icon-wrap">
            <IconEmpty width={48} height={48} />
          </div>
          <h3>Henüz Sprint Bulunmuyor</h3>
          <p>Çalışma periyodunu başlatmak için ilk sprintinizi oluşturun.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={onOpenCreateSprint}
          >
            <IconPlus width={15} height={15} />
            <span>İlk Sprinti Oluştur</span>
          </button>
        </div>
      ) : storiesInSprint.length === 0 && standaloneTasks.length === 0 ? (
        <div className="sprint-empty">
          <div className="empty-icon-wrap">
            <IconEmpty width={48} height={48} />
          </div>
          <h3>Bu Sprint İçinde Henüz İş Yok</h3>
          <p>
            Backlog sekmesinden işleri bu sprinte atayabilir veya doğrudan bu sprinte yeni bir görev ekleyebilirsiniz.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenCreateTask(currentSprint.id)}
          >
            <IconPlus width={15} height={15} />
            <span>Bu Sprint'e İş Ekle</span>
          </button>
        </div>
      ) : (
        <div className="sprint-stories-container">
          {/* User Story ve Alt Task Grupları */}
          {storiesInSprint.map((story) => {
            const storyTasks = getTasksForStory(story.id);

            return (
              <div key={story.id} className="story-section-card">
                {/* Story Başlık Başlığı */}
                <div className="story-header" onClick={() => onSelectItem(story)}>
                  <div className="story-header-main">
                    <span className="type-badge type-badge--userstory">
                      <IconUserStory width={12} height={12} />
                      <span>User Story</span>
                    </span>
                    <span className="story-id">#{story.id}</span>
                    <h3 className="story-title">{story.title}</h3>

                    {/* Dışa Bağımlılık Vurgusu (Vektör İkonlu) */}
                    {story.externalDependency && (
                      <span className="dependency-pill" title={`Dışa Bağımlılık: ${story.externalDependency}`}>
                        <IconAlert width={12} height={12} />
                        <span>Bağımlılık: {story.externalDependency}</span>
                      </span>
                    )}
                  </div>

                  {/* Story Durum Değiştirici Hap Butonları */}
                  <div className="status-quick-pills" title="Story Durumunu Değiştir">
                    {STATUS_LIST.map((st) => (
                      <button
                        type="button"
                        key={st}
                        className={`status-badge status-badge--${st.toLowerCase()} pill-interactive ${
                          story.status === st ? 'is-active' : 'is-inactive'
                        }`}
                        onClick={(e) => handleStatusChange(e, story.id, st)}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Story Altındaki Task Kartları */}
                <div className="story-tasks-grid">
                  {storyTasks.length === 0 ? (
                    <div className="no-tasks-hint">
                      <span>Bu hikaye için henüz alt görev açılmadı.</span>
                      <button
                        type="button"
                        className="btn-add-child"
                        onClick={() => onOpenCreateTask(currentSprint.id, story)}
                      >
                        <IconPlus width={12} height={12} />
                        <span>Task Ekle</span>
                      </button>
                    </div>
                  ) : (
                    storyTasks.map((task) => (
                      <div
                        key={task.id}
                        className="task-card"
                        onClick={() => onSelectItem(task)}
                      >
                        <div className="task-card-top">
                          <span className="type-badge type-badge--task">
                            <IconTask width={12} height={12} />
                            <span>Task</span>
                          </span>
                          <span className="task-id">#{task.id}</span>
                        </div>

                        <h4 className="task-title">{task.title}</h4>

                        {task.description && (
                          <p className="task-desc">{task.description}</p>
                        )}

                        {/* Kabul Kriterleri Kutusu */}
                        {task.acceptanceCriteria && (
                          <div className="task-criteria-box">
                            <div className="criteria-check-icon">
                              <IconCheck width={12} height={12} />
                            </div>
                            <span>{task.acceptanceCriteria}</span>
                          </div>
                        )}

                        {/* 5'li Tek Tık Durum Değiştirici */}
                        <div className="task-status-row">
                          <span className="status-label">Durum:</span>
                          <div className="task-pill-group">
                            {STATUS_LIST.map((st) => (
                              <button
                                type="button"
                                key={st}
                                className={`task-status-btn status-badge--${st.toLowerCase()} ${
                                  task.status === st ? 'selected' : ''
                                }`}
                                onClick={(e) => handleStatusChange(e, task.id, st)}
                                title={`Durumu ${st} olarak güncelle`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Bağımsız Görevler */}
          {standaloneTasks.length > 0 && (
            <div className="story-section-card standalone-section">
              <div className="story-header standalone-header">
                <div className="story-header-main">
                  <span className="type-badge type-badge--feature">
                    <IconTask width={12} height={12} />
                    <span>Genel Görevler</span>
                  </span>
                  <h3 className="story-title">Sprint İçerisindeki Bağımsız Teknik İşler</h3>
                </div>
              </div>

              <div className="story-tasks-grid">
                {standaloneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                    onClick={() => onSelectItem(task)}
                  >
                    <div className="task-card-top">
                      <span className="type-badge type-badge--task">
                        <IconTask width={12} height={12} />
                        <span>Task</span>
                      </span>
                      <span className="task-id">#{task.id}</span>
                    </div>

                    <h4 className="task-title">{task.title}</h4>

                    {task.acceptanceCriteria && (
                      <div className="task-criteria-box">
                        <div className="criteria-check-icon">
                          <IconCheck width={12} height={12} />
                        </div>
                        <span>{task.acceptanceCriteria}</span>
                      </div>
                    )}

                    <div className="task-status-row">
                      <span className="status-label">Durum:</span>
                      <div className="task-pill-group">
                        {STATUS_LIST.map((st) => (
                          <button
                            type="button"
                            key={st}
                            className={`task-status-btn status-badge--${st.toLowerCase()} ${
                              task.status === st ? 'selected' : ''
                            }`}
                            onClick={(e) => handleStatusChange(e, task.id, st)}
                            title={`Durumu ${st} yap`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
