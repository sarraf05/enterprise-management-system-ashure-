-- ========================================================
-- ASHURE Database: azure_clone.db
-- Aşama 1: Teams Tablosu
-- Aşama 2: Sprints ve WorkItems Tabloları
-- ========================================================

-- 1. Teams Tablosu
CREATE TABLE IF NOT EXISTS "Teams" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Teams" PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT NOT NULL,
    "Description" TEXT NULL,
    "IconColor" TEXT NOT NULL DEFAULT '#0078D4',
    "IsPilot" INTEGER NOT NULL DEFAULT 0,
    "CreatedAt" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- 2. Sprints Tablosu
CREATE TABLE IF NOT EXISTS "Sprints" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_Sprints" PRIMARY KEY AUTOINCREMENT,
    "TeamId" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "StartDate" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    "EndDate" TEXT NOT NULL,
    "IsActive" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "FK_Sprints_Teams_TeamId" FOREIGN KEY ("TeamId") REFERENCES "Teams" ("Id") ON DELETE CASCADE
);

-- 3. WorkItems Tablosu (Self-Referencing Hiyerarşik Ağaç)
CREATE TABLE IF NOT EXISTS "WorkItems" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_WorkItems" PRIMARY KEY AUTOINCREMENT,
    "TeamId" INTEGER NOT NULL,
    "SprintId" INTEGER NULL,
    "ParentId" INTEGER NULL,
    "Type" TEXT NOT NULL, -- 'Epic', 'Feature', 'UserStory', 'Task'
    "Title" TEXT NOT NULL,
    "Description" TEXT NULL,
    "ExternalDependency" TEXT NULL,
    "AcceptanceCriteria" TEXT NULL,
    "Status" TEXT NOT NULL DEFAULT 'New', -- 'New', 'Undone', 'Testing', 'Blocked', 'Closed'
    "CreatedAt" TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT "FK_WorkItems_Teams_TeamId" FOREIGN KEY ("TeamId") REFERENCES "Teams" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_WorkItems_Sprints_SprintId" FOREIGN KEY ("SprintId") REFERENCES "Sprints" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_WorkItems_WorkItems_ParentId" FOREIGN KEY ("ParentId") REFERENCES "WorkItems" ("Id") ON DELETE RESTRICT
);
