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
*(Buraya Ctrl + V ile kopyaladığın 2-3 ekran görüntüsünü yapıştırabilirsin)*
