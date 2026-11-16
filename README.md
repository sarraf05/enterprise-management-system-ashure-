<img width="1912" height="906" alt="Ekran görüntüsü 2026-11-17 013004" src="https://github.com/user-attachments/assets/ab59d571-6884-4fda-b67c-0b6ab79e0d8d" />
<img width="1917" height="906" alt="Ekran görüntüsü 2026-11-17 012952" src="https://github.com/user-attachments/assets/32c2d3fd-7389-4505-897e-4ee650e278a7" />
<img width="1916" height="910" alt="Ekran görüntüsü 2026-11-17 012946" src="https://github.com/user-attachments/assets/859076a3-7f44-4b31-b4ba-b3281e7adeb9" />
<img width="1917" height="973" alt="Ekran görüntüsü 2026-11-17 012941" src="https://github.com/user-attachments/assets/03133469-3bdf-49ab-9e9a-cdbaf93a14f5" />
<img width="1901" height="912" alt="Ekran görüntüsü 2026-11-17 013012" src="https://github.com/user-attachments/assets/7eb0681f-b2a7-4120-822e-82e4468b245a" />
enterprise-management-system
# Kurumsal Proje ve Sprint Yönetim Platformu

Modern yazılım ekipleri için geliştirilmiş; **Azure Boards** disiplinine ve **Trello** sadeliğine sahip modüler proje yönetim uygulaması.

## Mimari ve Teknoloji Yığını
* **Mimari Yapı:** Monorepo (`/frontend`, `/backend`, `/database`)
* **Backend:** C# (.NET 8 Web API) & Entity Framework Core
* **Frontend:** React (Vite) & Modüler CSS
* **Veritabanı:** SQLite

## Tamamlanan Fazlar ve Özellikler
### Faz 1: Ekipler Panosu (Teams Dashboard)
* Şirket bünyesindeki departman ve ekiplerin yönetimi, renk kodlu ayrım ve Pilot Ekip (`Core Yazılım Ekibi`) tanımlaması.

### Faz 2: Backlog Hiyerarşisi ve Sprint Yönetimi
* **Self-Referencing WorkItem Algoritması:** Tek tabloda kendi kendine bağlanan (`ParentId`) ağaç yapısı ile `Epic -> Feature -> User Story -> Task` hiyerarşisi.
* **Kademeli Açılım (Progressive Disclosure):** Backlog ekranında varsayılan kapalı Epic görünümü ve kademeli alt dal açılımı.
* **Özel Alanlar & Durum Akışı:** User Story seviyesinde **Dışa Bağımlılık (`ExternalDependency`)**, Task seviyesinde **Kabul Kriterleri (`AcceptanceCriteria`)** ve 5 aşamalı durum yaşam döngüsü (`New`, `Undone`, `Testing`, `Blocked`, `Closed`).

## Uygulama Ekran Görüntüleri
<img width="1917" height="973" alt="Ekran görüntüsü 2026-11-17 012941" src="https://github.com/user-attachments/assets/eb574927-d1b2-4363-b23c-638d3a750643" />

<img width="1916" height="910" alt="Ekran görüntüsü 2026-11-17 012946" src="https://github.com/user-attachments/assets/a4829c2e-55b9-4cd0-8fb1-0f369a2f65bc" />
<img width="1917" height="906" alt="Ekran görüntüsü 2026-11-17 012952" src="https://github.com/user-attachments/assets/5887662c-8b33-4ec4-b625-7d138bbfe444" />
<img width="1912" height="906" alt="Ekran görüntüsü 2026-11-17 013004" src="https://github.com/user-attachments/assets/5b5a8e3f-018c-47eb-9aca-81b0a913682e" />
<img width="1901" height="912" alt="Ekran görüntüsü 2026-11-17 013012" src="https://github.com/user-attachments/assets/9fea85d2-c8d2-4c74-894d-cec025d9241e" />






