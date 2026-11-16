import React, { useState } from 'react';
import {
  IconPlus,
  IconChevronRight,
  IconChevronDown,
  IconAlert,
  IconCheck,
  IconEmpty,
  IconExpandAll,
  IconCollapseAll,
  IconEpic,
  IconFeature,
  IconUserStory,
  IconTask,
} from './Icons';
import './BacklogView.css';

// Tür ikonları eşleştirmesi
function getTypeIcon(type) {
  switch (type) {
    case 'Epic':
      return <IconEpic width={13} height={13} />;
    case 'Feature':
      return <IconFeature width={13} height={13} />;
    case 'UserStory':
      return <IconUserStory width={13} height={13} />;
    case 'Task':
      return <IconTask width={13} height={13} />;
    default:
      return null;
  }
}

export default function BacklogView({
  workItems,
  sprints,
  onSelectItem,
  onAddSubItem,
  onOpenCreateModal,
}) {
  // Kural 4: Varsayılan olarak tüm dallar KAPALI (sadece en üst Epic'ler görünür)
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Tümünü Genişlet / Tümünü Daralt
  const handleExpandAll = () => {
    const allIds = new Set(workItems.map((w) => w.id));
    setExpandedIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const isAllExpanded = expandedIds.size >= workItems.length && workItems.length > 0;

  // Sprint ismini id üzerinden bul
  const getSprintName = (sprintId) => {
    if (!sprintId) return 'Backlog';
    const s = sprints.find((sp) => sp.id === sprintId);
    return s ? s.name : `Sprint #${sprintId}`;
  };

  // Hiyerarşik ağacı inşa et (Epic -> Feature -> UserStory -> Task)
  const buildTree = () => {
    const itemMap = new Map();
    workItems.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    const roots = [];
    workItems.forEach((item) => {
      const node = itemMap.get(item.id);
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const treeData = buildTree();

  // Rekürsif Ağaç Satırı
  const renderItemNode = (node, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);

    // Alt öğe ekleme kuralı
    let canAddChild = false;
    let addChildLabel = '';
    if (node.type === 'Epic') {
      canAddChild = true;
      addChildLabel = 'Feature Ekle';
    } else if (node.type === 'Feature') {
      canAddChild = true;
      addChildLabel = 'Story Ekle';
    } else if (node.type === 'UserStory') {
      canAddChild = true;
      addChildLabel = 'Task Ekle';
    }

    return (
      <div key={node.id} className="tree-node-wrapper">
        <div
          className={`tree-row tree-row--${node.type.toLowerCase()}`}
          style={{ paddingLeft: `${depth * 28 + 18}px` }}
          onClick={() => onSelectItem(node)}
        >
          {/* Kademeli Genişletme Oku */}
          <div className="tree-indent-controls">
            {hasChildren ? (
              <button
                type="button"
                className={`expand-toggle-btn ${isExpanded ? 'is-expanded' : ''}`}
                onClick={(e) => toggleExpand(node.id, e)}
                title={isExpanded ? 'Daralt' : 'Genişlet'}
              >
                {isExpanded ? (
                  <IconChevronDown width={14} height={14} />
                ) : (
                  <IconChevronRight width={14} height={14} />
                )}
              </button>
            ) : (
              <span className="tree-leaf-bullet" />
            )}
          </div>

          {/* Tür Rozeti (Vektör İkonlu) */}
          <span className={`type-badge type-badge--${node.type.toLowerCase()}`}>
            {getTypeIcon(node.type)}
            <span>{node.type}</span>
          </span>

          {/* Başlık ve Vurgu Rozetleri */}
          <div className="tree-title-group">
            <span className="item-id">#{node.id}</span>
            <span className="item-title">{node.title}</span>

            {/* Dışa Bağımlılık Vurgusu (Vektör ikonlu) */}
            {node.type === 'UserStory' && node.externalDependency && (
              <span className="dependency-pill" title={`Dışa Bağımlılık: ${node.externalDependency}`}>
                <IconAlert width={12} height={12} />
                <span>Bağımlılık Mevcut</span>
              </span>
            )}

            {/* Kabul Kriteri Vurgusu (Vektör ikonlu) */}
            {node.type === 'Task' && node.acceptanceCriteria && (
              <span className="criteria-pill" title={`Kabul Kriteri: ${node.acceptanceCriteria}`}>
                <IconCheck width={12} height={12} />
                <span>Kriter Tanımlı</span>
              </span>
            )}
          </div>

          {/* Sağ Alan: Sprint, 5'li Durum Rozeti, Alt Öğe Ekle */}
          <div className="tree-row-meta">
            <span className={`sprint-pill ${node.sprintId ? 'is-sprint' : 'is-backlog'}`}>
              {getSprintName(node.sprintId)}
            </span>

            <span className={`status-badge status-badge--${node.status.toLowerCase()}`}>
              {node.status}
            </span>

            {canAddChild && (
              <button
                type="button"
                className="btn-add-child"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSubItem(node);
                }}
                title={`Yeni ${addChildLabel}`}
              >
                <IconPlus width={12} height={12} />
                <span>{addChildLabel}</span>
              </button>
            )}
          </div>
        </div>

        {/* Çocuk Öğeler (Sadece Açıldığında Render Edilir) */}
        {hasChildren && isExpanded && (
          <div className="tree-children-container">
            {node.children.map((child) => renderItemNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="backlog-view">
      {/* Backlog Üst Çubuğu */}
      <div className="backlog-toolbar">
        <div className="backlog-summary">
          <h2>Hiyerarşik İş Listesi (Backlog)</h2>
          <p>
            Stratejik Epic hedeflerinden teknik görevlere kademeli açılan iş kırılım yapısı
          </p>
        </div>

        <div className="backlog-toolbar-actions">
          {/* Tümünü Aç / Tümünü Daralt Butonu */}
          {workItems.length > 0 && (
            <button
              type="button"
              className="btn-toggle-all"
              onClick={isAllExpanded ? handleCollapseAll : handleExpandAll}
              title={isAllExpanded ? 'Tüm dalları kapat' : 'Tüm dalları aç'}
            >
              {isAllExpanded ? (
                <>
                  <IconCollapseAll width={15} height={15} />
                  <span>Tümünü Daralt</span>
                </>
              ) : (
                <>
                  <IconExpandAll width={15} height={15} />
                  <span>Tümünü Genişlet</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenCreateModal()}
          >
            <IconPlus width={15} height={15} />
            <span>Yeni İş Öğesi Ekle</span>
          </button>
        </div>
      </div>

      {/* Ağaç Görünümü */}
      {workItems.length === 0 ? (
        <div className="backlog-empty">
          <div className="empty-icon-wrap">
            <IconEmpty width={48} height={48} />
          </div>
          <h3>Bu Ekip İçin Henüz İş Öğesi Yok</h3>
          <p>İlk Epic veya görevinizi ekleyerek backlog oluşturmaya başlayın.</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onOpenCreateModal()}
          >
            <IconPlus width={15} height={15} />
            <span>İlk İşi Ekle</span>
          </button>
        </div>
      ) : (
        <div className="backlog-tree-container">
          {treeData.map((rootNode) => renderItemNode(rootNode, 0))}
        </div>
      )}
    </div>
  );
}
