using Ashure.Backend.Models;

namespace Ashure.Backend.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        context.Database.EnsureCreated();

        // 1. Ekipleri Ekle (Yoksa)
        if (!context.Teams.Any())
        {
            var seedTeams = new List<Team>
            {
                new Team
                {
                    Name = "Core Yazılım Ekibi",
                    Description = "Şirketin ana yazılım geliştirme süreçlerini yöneten ve ürün altyapısını inşa eden çekirdek ekip.",
                    IconColor = "#0078D4", // Azure Mavisi (Pilot Ekip Vurgusu)
                    IsPilot = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Team
                {
                    Name = "Ürün ve Arayüz Tasarımı",
                    Description = "Kullanıcı deneyimi (UX) ve arayüz tasarımı (UI) süreçlerini yürüten ekip.",
                    IconColor = "#8661C5", // Kurumsal Mor
                    IsPilot = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Team
                {
                    Name = "Veri Bilimi ve Yapay Zeka",
                    Description = "Veri analizi, makine öğrenimi modelleri ve yapay zeka çözümleri geliştiren ekip.",
                    IconColor = "#107C10", // Zümrüt Yeşili
                    IsPilot = false,
                    CreatedAt = DateTime.UtcNow
                },
                new Team
                {
                    Name = "Bulut ve Altyapı Yönetimi",
                    Description = "Sunucu, ağ ve bulut altyapısının kurulumu, izlenmesi ve optimizasyonundan sorumlu ekip.",
                    IconColor = "#D83B01", // Canlı Turuncu
                    IsPilot = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            context.Teams.AddRange(seedTeams);
            context.SaveChanges();
        }

        // 2. Pilot Ekip ("Core Yazılım Ekibi") İçin Sprint ve Hiyerarşik WorkItem Verilerini Ekle
        var pilotTeam = context.Teams.FirstOrDefault(t => t.IsPilot);
        if (pilotTeam != null && !context.Sprints.Any(s => s.TeamId == pilotTeam.Id))
        {
            // Aktif Sprint 1
            var sprint1 = new Sprint
            {
                TeamId = pilotTeam.Id,
                Name = "Sprint 1",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                IsActive = true
            };
            context.Sprints.Add(sprint1);
            context.SaveChanges();

            // 1 Adet Epic
            var epic = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = null,
                Type = "Epic",
                Title = "E-Ticaret Platform Modernizasyonu",
                Description = "Şirketin ana satış ve ödeme mimarisinin mikroservis altyapısına taşınması ve kullanıcı deneyiminin yenilenmesi.",
                Status = "Undone",
                CreatedAt = DateTime.UtcNow
            };
            context.WorkItems.Add(epic);
            context.SaveChanges();

            // Epic altında 1 Adet Feature
            var feature = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = epic.Id,
                Type = "Feature",
                Title = "Ödeme ve Sipariş Yönetimi Entegrasyonu",
                Description = "Kredi kartı, 3D Secure güvenli ödeme ve sipariş faturası oluşturma süreçlerinin uçtan uca yönetimi.",
                Status = "Undone",
                CreatedAt = DateTime.UtcNow
            };
            context.WorkItems.Add(feature);
            context.SaveChanges();

            // Feature altında 2 Adet User Story
            var userStory1 = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = feature.Id,
                Type = "UserStory",
                Title = "Kredi Kartı ile 3D Secure Ödeme Akışı",
                Description = "Bir müşteri olarak, siparişimi güvenle tamamlayabilmek için kredi kartı bilgilerimi girip 3D SMS şifresiyle ödeme yapabilmek istiyorum.",
                ExternalDependency = "İyzico / Banka Sanal POS API Gateway bağlantısı ve API anahtarları gerekiyor.",
                Status = "Undone",
                CreatedAt = DateTime.UtcNow
            };

            var userStory2 = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = feature.Id,
                Type = "UserStory",
                Title = "Sipariş Özeti ve E-Fatura Bilgileri Ekranı",
                Description = "Bir müşteri olarak, ödemem tamamlandıktan sonra sipariş detaylarımı görüp e-arşiv faturamı indirebilmek istiyorum.",
                ExternalDependency = "Muhasebe mikroservisinin fatura şablonu API sözleşmesi bekleniyor.",
                Status = "Blocked",
                CreatedAt = DateTime.UtcNow
            };

            context.WorkItems.AddRange(userStory1, userStory2);
            context.SaveChanges();

            // User Story 1 altında 2 Adet Task
            var task1 = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = userStory1.Id,
                Type = "Task",
                Title = "Banka API İstemcisinin Yazılması ve Hata Yönetimi",
                Description = "Sanal POS entegrasyonu için HTTP istemcisi ve hata kodları eşleme katmanının kodlanması.",
                AcceptanceCriteria = "İstek zaman aşımı 5 saniye olmalı ve hata durumunda 3 kez yeniden denenmeli (Retry Policy).",
                Status = "Testing",
                CreatedAt = DateTime.UtcNow
            };

            var task2 = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = userStory1.Id,
                Type = "Task",
                Title = "3D Secure Callback Uç Noktasının Güvenliği",
                Description = "Bankadan dönen POST isteğindeki imza ve hash değerinin doğrulanması.",
                AcceptanceCriteria = "Hash doğrulama algoritması SHA-256 ile kontrol edilmeli ve geçersiz imzada işlem iptal edilmeli.",
                Status = "New",
                CreatedAt = DateTime.UtcNow
            };

            // User Story 2 altında 2 Adet Task
            var task3 = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = userStory2.Id,
                Type = "Task",
                Title = "Sipariş Onay Ekranı Arayüz Tasarımı",
                Description = "Kullanıcının sipariş numarasını ve satın aldığı ürünleri listelediği ekranın React bileşenlerinin geliştirilmesi.",
                AcceptanceCriteria = "Mobil ve masaüstü responsive tasarıma uygun olmalı ve sipariş numarası panoya kopyalanabilmeli.",
                Status = "Closed",
                CreatedAt = DateTime.UtcNow
            };

            var task4 = new WorkItem
            {
                TeamId = pilotTeam.Id,
                SprintId = sprint1.Id,
                ParentId = userStory2.Id,
                Type = "Task",
                Title = "Fatura PDF İndirme Entegrasyonu",
                Description = "Fatura servisi ile haberleşip tek tıkla PDF oluşturup indiren butonun bağlanması.",
                AcceptanceCriteria = "PDF 1 sayfayı aşmayacak şekilde optimize edilmiş şablonla üretilmeli ve indirme 2 saniyeden kısa sürmeli.",
                Status = "Blocked",
                CreatedAt = DateTime.UtcNow
            };

            context.WorkItems.AddRange(task1, task2, task3, task4);
            context.SaveChanges();
        }
    }
}
