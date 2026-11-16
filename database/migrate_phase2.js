const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve('C:/Users/bekir/Desktop/ASHURE/database/azure_clone.db');
const db = new DatabaseSync(dbPath);

console.log('Phase 2 tabloları oluşturuluyor...');

db.exec(`
CREATE TABLE IF NOT EXISTS Teams (
    Id INTEGER NOT NULL CONSTRAINT PK_Teams PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    Description TEXT NOT NULL,
    IconColor TEXT NOT NULL DEFAULT '#0078D4',
    IsPilot INTEGER NOT NULL DEFAULT 0,
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS Sprints (
    Id INTEGER NOT NULL CONSTRAINT PK_Sprints PRIMARY KEY AUTOINCREMENT,
    TeamId INTEGER NOT NULL,
    Name TEXT NOT NULL,
    StartDate TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    EndDate TEXT NOT NULL,
    IsActive INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT FK_Sprints_Teams_TeamId FOREIGN KEY (TeamId) REFERENCES Teams (Id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS WorkItems (
    Id INTEGER NOT NULL CONSTRAINT PK_WorkItems PRIMARY KEY AUTOINCREMENT,
    TeamId INTEGER NOT NULL,
    SprintId INTEGER NULL,
    ParentId INTEGER NULL,
    Type TEXT NOT NULL,
    Title TEXT NOT NULL,
    Description TEXT NULL,
    ExternalDependency TEXT NULL,
    AcceptanceCriteria TEXT NULL,
    Status TEXT NOT NULL DEFAULT 'New',
    CreatedAt TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT FK_WorkItems_Teams_TeamId FOREIGN KEY (TeamId) REFERENCES Teams (Id) ON DELETE CASCADE,
    CONSTRAINT FK_WorkItems_Sprints_SprintId FOREIGN KEY (SprintId) REFERENCES Sprints (Id) ON DELETE SET NULL,
    CONSTRAINT FK_WorkItems_WorkItems_ParentId FOREIGN KEY (ParentId) REFERENCES WorkItems (Id) ON DELETE RESTRICT
);
`);

// Pilot Team kontrolü (Id = 1)
const pilotTeam = db.prepare('SELECT Id FROM Teams WHERE IsPilot = 1 LIMIT 1').get();
const teamId = pilotTeam ? pilotTeam.Id : 1;

// Sprints boşsa ekle
const sprintCount = db.prepare('SELECT COUNT(*) as count FROM Sprints WHERE TeamId = ?').get(teamId);
let sprint1Id = 1;

if (sprintCount.count === 0) {
  const sprintStmt = db.prepare(`
    INSERT INTO Sprints (TeamId, Name, StartDate, EndDate, IsActive)
    VALUES (?, 'Sprint 1', datetime('now'), datetime('now', '+14 days'), 1)
  `);
  const sRes = sprintStmt.run(teamId);
  sprint1Id = Number(sRes.lastInsertRowid);
  console.log('Sprint 1 eklendi, Id:', sprint1Id);
} else {
  const existing = db.prepare('SELECT Id FROM Sprints WHERE TeamId = ? LIMIT 1').get(teamId);
  sprint1Id = existing.Id;
}

// WorkItems boşsa ekle
const workItemCount = db.prepare('SELECT COUNT(*) as count FROM WorkItems WHERE TeamId = ?').get(teamId);
if (workItemCount.count === 0) {
  const insertWI = db.prepare(`
    INSERT INTO WorkItems (TeamId, SprintId, ParentId, Type, Title, Description, ExternalDependency, AcceptanceCriteria, Status, CreatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  // 1. Epic
  const epicRes = insertWI.run(
    teamId, sprint1Id, null, 'Epic',
    'E-Ticaret Platform Modernizasyonu',
    'Şirketin ana satış ve ödeme mimarisinin mikroservis altyapısına taşınması ve kullanıcı deneyiminin yenilenmesi.',
    null, null, 'Undone'
  );
  const epicId = Number(epicRes.lastInsertRowid);

  // 2. Feature (Epic altına)
  const featRes = insertWI.run(
    teamId, sprint1Id, epicId, 'Feature',
    'Ödeme ve Sipariş Yönetimi Entegrasyonu',
    'Kredi kartı, 3D Secure güvenli ödeme ve sipariş faturası oluşturma süreçlerinin uçtan uca yönetimi.',
    null, null, 'Undone'
  );
  const featId = Number(featRes.lastInsertRowid);

  // 3. User Story 1 (Dışa bağımlılık dolu)
  const us1Res = insertWI.run(
    teamId, sprint1Id, featId, 'UserStory',
    'Kredi Kartı ile 3D Secure Ödeme Akışı',
    'Bir müşteri olarak, siparişimi güvenle tamamlayabilmek için kredi kartı bilgilerimi girip 3D SMS şifresiyle ödeme yapabilmek istiyorum.',
    'İyzico / Banka Sanal POS API Gateway bağlantısı ve API anahtarları gerekiyor.',
    null, 'Undone'
  );
  const us1Id = Number(us1Res.lastInsertRowid);

  // 4. User Story 2 (Dışa bağımlılık dolu)
  const us2Res = insertWI.run(
    teamId, sprint1Id, featId, 'UserStory',
    'Sipariş Özeti ve E-Fatura Bilgileri Ekranı',
    'Bir müşteri olarak, ödemem tamamlandıktan sonra sipariş detaylarımı görüp e-arşiv faturamı indirebilmek istiyorum.',
    'Muhasebe mikroservisinin fatura şablonu API sözleşmesi bekleniyor.',
    null, 'Blocked'
  );
  const us2Id = Number(us2Res.lastInsertRowid);

  // 5. Tasks for US1
  insertWI.run(
    teamId, sprint1Id, us1Id, 'Task',
    'Banka API İstemcisinin Yazılması ve Hata Yönetimi',
    'Sanal POS entegrasyonu için HTTP istemcisi ve hata kodları eşleme katmanının kodlanması.',
    null,
    'İstek zaman aşımı 5 saniye olmalı ve hata durumunda 3 kez yeniden denenmeli (Retry Policy).',
    'Testing'
  );

  insertWI.run(
    teamId, sprint1Id, us1Id, 'Task',
    '3D Secure Callback Uç Noktasının Güvenliği',
    'Bankadan dönen POST isteğindeki imza ve hash değerinin doğrulanması.',
    null,
    'Hash doğrulama algoritması SHA-256 ile kontrol edilmeli ve geçersiz imzada işlem iptal edilmeli.',
    'New'
  );

  // 6. Tasks for US2
  insertWI.run(
    teamId, sprint1Id, us2Id, 'Task',
    'Sipariş Onay Ekranı Arayüz Tasarımı',
    'Kullanıcının sipariş numarasını ve satın aldığı ürünleri listelediği ekranın React bileşenlerinin geliştirilmesi.',
    null,
    'Mobil ve masaüstü responsive tasarıma uygun olmalı ve sipariş numarası panoya kopyalanabilmeli.',
    'Closed'
  );

  insertWI.run(
    teamId, sprint1Id, us2Id, 'Task',
    'Fatura PDF İndirme Entegrasyonu',
    'Fatura servisi ile haberleşip tek tıkla PDF oluşturup indiren butonun bağlanması.',
    null,
    'PDF 1 sayfayı aşmayacak şekilde optimize edilmiş şablonla üretilmeli ve indirme 2 saniyeden kısa sürmeli.',
    'Blocked'
  );

  console.log('WorkItems hiyerarşik ağacı başarıyla eklendi!');
}

const allWi = db.prepare('SELECT Id, Type, Title, Status, ParentId, SprintId FROM WorkItems').all();
console.log('Mevcut WorkItems:');
console.table(allWi);
db.close();
