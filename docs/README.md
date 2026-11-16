# ASHURE — İş Bölümü ve Proje Yönetimi Platformu

Microsoft Azure DevOps'un kurumsal organizasyonel yapısını, Trello'nun görsel sadeliğiyle harmanlayan modern iş bölümü ve proje yönetim platformu.

---

## 1. Mimari Genel Bakış (Architecture Overview)

Proje monorepo yaklaşımıyla katmanlı ve modüler olarak yapılandırılmıştır:

```
ASHURE/
├── backend/                  → C# ASP.NET Core Web API & API Runner
│   ├── Controllers/
│   │   ├── TeamsController.cs       → /api/teams uç noktaları
│   │   ├── SprintsController.cs     → /api/teams/{teamId}/sprints, /api/sprints
│   │   └── WorkItemsController.cs   → /api/teams/{teamId}/workitems, /api/workitems, /api/workitems/{id}
│   ├── Data/
│   │   ├── AppDbContext.cs          → EF Core DbContext (Teams, Sprints, WorkItems ilişkileri)
│   │   └── DbInitializer.cs         → Otomatik SQLite oluşturma ve Phase 1 & 2 Seed verileri
│   ├── DTOs/
│   │   ├── TeamDtos.cs              → Ekip veri transfer nesneleri
│   │   ├── SprintDtos.cs            → Sprint oluşturma nesneleri
│   │   └── WorkItemDtos.cs          → İş öğesi oluşturma ve güncelleme nesneleri
│   ├── Models/
│   │   ├── Team.cs                  → Ekip Entity sınıfı
│   │   ├── Sprint.cs                → Sprint Entity sınıfı
│   │   └── WorkItem.cs              → Self-referencing (hiyerarşik) İş Öğesi Entity sınıfı
│   ├── runner.js                    → Canlı SQLite REST API sunucusu (Port 5000)
│   └── Ashure.Backend.csproj        → .NET 8 proje dosyası
│
├── frontend/                 → React (Vite tabanlı modern SPA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           → Azure kurumsal üst bar ve profil göstergesi
│   │   │   ├── TeamCard.jsx         → Ekip kartı ve düzenleme aksiyonları
│   │   │   ├── TeamModal.jsx        → Ekip oluşturma ve düzenleme modalı
│   │   │   ├── BacklogView.jsx      → Hiyerarşik ağaç (Epic > Feature > UserStory > Task)
│   │   │   ├── SprintView.jsx       → Sprint bazlı hikaye kartları ve 5'li tek tık durum butonları
│   │   │   ├── WorkItemDrawer.jsx   → Detay düzenleme çekmecesi (External Dependency, Acceptance Criteria)
│   │   │   ├── CreateWorkItemModal  → Alt öğe veya yeni iş ekleme modalı
│   │   │   └── CreateSprintModal    → Yeni sprint ekleme modalı
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        → Ekipler Ana Sayfası
│   │   │   └── TeamDetail.jsx       → Ekip Çalışma Alanı (Backlog & Sprintler Sekmeleri)
│   │   ├── services/api.js          → teamsApi, sprintsApi, workItemsApi
│   │   └── App.jsx                  → Rota tanımları
│   └── vite.config.js               → Reverse Proxy (/api -> localhost:5000)
│
├── database/                 → SQLite Veritabanı ve Şemalar
│   ├── azure_clone.db        → Fiziksel SQLite veritabanı
│   ├── schema.sql            → DDL Tablo Şeması referansı (Teams, Sprints, WorkItems)
│   └── seed.sql              → Başlangıç verisi SQL referansı
│
└── docs/                     → Proje dokümantasyonu
```

---

## 2. Aşama 2: Hiyerarşi Mantığı ve İlişkisel Şema

### A. Veritabanı İlişkileri

```
Teams (1) ──────────< Sprints (N)
  │                      │
  │                      │ (SprintId - Nullable FK)
  │ (TeamId)             ▼
  └─────────────────< WorkItems (N) ──┐ (ParentId - Self-Referencing FK)
                          ▲           │
                          └───────────┘
```

1. **`Teams`:** Şirket organizasyonundaki çalışma alanları (Core Yazılım Ekibi [Pilot], Tasarım, Veri Bilimi, Altyapı).
2. **`Sprints`:** Ekibe (`TeamId`) bağlı zaman kutulu periyotlar (Ad, Başlangıç, Bitiş, Aktiflik).
3. **`WorkItems` (Self-Referencing Ağaç):**
   - **`TeamId`:** İşin ait olduğu takımı belirtir.
   - **`SprintId` (Nullable):** `null` ise öğe **Backlog**'dadır; dolu ise ilgili **Sprint** içerisindedir.
   - **`ParentId` (Nullable):** Üst öğeyi işaret eder.
     - **Epic:** `ParentId = null` (Stratejik tepe hedef)
     - **Feature:** `ParentId = Epic.Id` (Özellik/Modül)
     - **User Story:** `ParentId = Feature.Id` (Kullanıcı Hikayesi — `ExternalDependency` alanı ile dışa bağımlılıklar tutulur)
     - **Task:** `ParentId = UserStory.Id` (Teknik Görev — `AcceptanceCriteria` alanı ile kabul kriterleri tutulur)
   - **`Status`:** 5 resmi Agile durumu: `New`, `Undone`, `Testing`, `Blocked`, `Closed`.

---

## 3. Ekranlar ve Kullanım Kılavuzu

### 1. Ekipler Panosu (`/`)
- Tüm ekipler kurumsal renkleriyle listelenir.
- **Core Yazılım Ekibi** üzerinde `★ Pilot Ekip` rozeti bulunur.
- Tıklandığında ekibin detay çalışma alanına (`/teams/1`) geçilir.

### 2. Ekip Çalışma Alanı (`/teams/:id`)
- Üstte sol tarafta **"← Ekiplere Dön"** butonu, ekip adı ve pilot rozeti yer alır.
- İki ana sekme bulunur:
  1. **📋 Backlog Hiyerarşisi:**
     - İşler girintili ağaç yapısında listelenir.
     - Düğümler açılıp kapanabilir (chevron).
     - Her satırda `Epic`, `Feature`, `UserStory`, `Task` renkli tür rozeti, mevcut durum ve Sprint bilgisi görünür.
     - User Story üzerinde dışa bağımlılık varsa sarı uyarı rozeti (`⚠️ Bağımlılık Mevcut`), Task üzerinde kabul kriteri varsa mavi onay rozeti (`✓ Kriter Tanımlı`) belirir.
     - `+ Alt Öğe Ekle` butonu ile Epic altına Feature, Feature altına User Story, User Story altına Task hiyerarşik olarak eklenebilir.
     - Satıra tıklandığında sağdan açılan **Drawer** panelinden detaylar (Dışa Bağımlılık, Kabul Kriteri, Durum, Sprint) düzenlenebilir.
  2. **🏃 Sprint Yönetimi:**
     - Aktif sprint açılır listeden seçilebilir, tarih aralığı görüntülenir.
     - `+ Yeni Sprint Oluştur` butonu ile yeni sprintler tanımlanabilir.
     - Seçili sprinte atanmış User Story'ler ve altlarındaki Task'lar kartlar halinde listelenir.
     - Her task kartının üzerinde bulunan 5 renkli buton (`New`, `Undone`, `Testing`, `Blocked`, `Closed`) ile **tek tıkla** durum anında değiştirilebilir.
