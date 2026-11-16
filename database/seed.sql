-- ========================================================
-- Başlangıç Verileri (Seed Data)
-- Aşama 1: 4 Farklı Kurumsal Renkli Şirket Ekipleri
-- Aşama 2: Pilot Ekip ("Core Yazılım Ekibi") için Sprint 1 ve Hiyerarşik İş Ağacı
-- ========================================================

-- Ekipler
INSERT OR IGNORE INTO "Teams" ("Id", "Name", "Description", "IconColor", "IsPilot", "CreatedAt")
VALUES
    (1, 'Core Yazılım Ekibi', 'Şirketin ana yazılım geliştirme süreçlerini yöneten ve ürün altyapısını inşa eden çekirdek ekip.', '#0078D4', 1, CURRENT_TIMESTAMP),
    (2, 'Ürün ve Arayüz Tasarımı', 'Kullanıcı deneyimi (UX) ve arayüz tasarımı (UI) süreçlerini yürüten ekip.', '#8661C5', 0, CURRENT_TIMESTAMP),
    (3, 'Veri Bilimi ve Yapay Zeka', 'Veri analizi, makine öğrenimi modelleri ve yapay zeka çözümleri geliştiren ekip.', '#107C10', 0, CURRENT_TIMESTAMP),
    (4, 'Bulut ve Altyapı Yönetimi', 'Sunucu, ağ ve bulut altyapısının kurulumu, izlenmesi ve optimizasyonundan sorumlu ekip.', '#D83B01', 0, CURRENT_TIMESTAMP);

-- Pilot Ekip için Sprint 1
INSERT OR IGNORE INTO "Sprints" ("Id", "TeamId", "Name", "StartDate", "EndDate", "IsActive")
VALUES
    (1, 1, 'Sprint 1', datetime('now'), datetime('now', '+14 days'), 1);

-- Pilot Ekip için Hiyerarşik WorkItems (Epic -> Feature -> UserStory -> Task)
INSERT OR IGNORE INTO "WorkItems" ("Id", "TeamId", "SprintId", "ParentId", "Type", "Title", "Description", "ExternalDependency", "AcceptanceCriteria", "Status", "CreatedAt")
VALUES
    -- 1. Epic
    (1, 1, 1, NULL, 'Epic', 'E-Ticaret Platform Modernizasyonu', 'Şirketin ana satış ve ödeme mimarisinin mikroservis altyapısına taşınması ve kullanıcı deneyiminin yenilenmesi.', NULL, NULL, 'Undone', CURRENT_TIMESTAMP),
    
    -- 2. Feature (Epic altına bağlı)
    (2, 1, 1, 1, 'Feature', 'Ödeme ve Sipariş Yönetimi Entegrasyonu', 'Kredi kartı, 3D Secure güvenli ödeme ve sipariş faturası oluşturma süreçlerinin uçtan uca yönetimi.', NULL, NULL, 'Undone', CURRENT_TIMESTAMP),
    
    -- 3. User Story 1 (Feature altına bağlı - Dışa Bağımlılık dolu)
    (3, 1, 1, 2, 'UserStory', 'Kredi Kartı ile 3D Secure Ödeme Akışı', 'Bir müşteri olarak, siparişimi güvenle tamamlayabilmek için kredi kartı bilgilerimi girip 3D SMS şifresiyle ödeme yapabilmek istiyorum.', 'İyzico / Banka Sanal POS API Gateway bağlantısı ve API anahtarları gerekiyor.', NULL, 'Undone', CURRENT_TIMESTAMP),
    
    -- 4. User Story 2 (Feature altına bağlı - Dışa Bağımlılık dolu)
    (4, 1, 1, 2, 'UserStory', 'Sipariş Özeti ve E-Fatura Bilgileri Ekranı', 'Bir müşteri olarak, ödemem tamamlandıktan sonra sipariş detaylarımı görüp e-arşiv faturamı indirebilmek istiyorum.', 'Muhasebe mikroservisinin fatura şablonu API sözleşmesi bekleniyor.', NULL, 'Blocked', CURRENT_TIMESTAMP),
    
    -- 5. Task 1 (User Story 1 altına bağlı - Testing)
    (5, 1, 1, 3, 'Task', 'Banka API İstemcisinin Yazılması ve Hata Yönetimi', 'Sanal POS entegrasyonu için HTTP istemcisi ve hata kodları eşleme katmanının kodlanması.', NULL, 'İstek zaman aşımı 5 saniye olmalı ve hata durumunda 3 kez yeniden denenmeli (Retry Policy).', 'Testing', CURRENT_TIMESTAMP),
    
    -- 6. Task 2 (User Story 1 altına bağlı - New)
    (6, 1, 1, 3, 'Task', '3D Secure Callback Uç Noktasının Güvenliği', 'Bankadan dönen POST isteğindeki imza ve hash değerinin doğrulanması.', NULL, 'Hash doğrulama algoritması SHA-256 ile kontrol edilmeli ve geçersiz imzada işlem iptal edilmeli.', 'New', CURRENT_TIMESTAMP),
    
    -- 7. Task 3 (User Story 2 altına bağlı - Closed)
    (7, 1, 1, 4, 'Task', 'Sipariş Onay Ekranı Arayüz Tasarımı', 'Kullanıcının sipariş numarasını ve satın aldığı ürünleri listelediği ekranın React bileşenlerinin geliştirilmesi.', NULL, 'Mobil ve masaüstü responsive tasarıma uygun olmalı ve sipariş numarası panoya kopyalanabilmeli.', 'Closed', CURRENT_TIMESTAMP),
    
    -- 8. Task 4 (User Story 2 altına bağlı - Blocked)
    (8, 1, 1, 4, 'Task', 'Fatura PDF İndirme Entegrasyonu', 'Fatura servisi ile haberleşip tek tıkla PDF oluşturup indiren butonun bağlanması.', NULL, 'PDF 1 sayfayı aşmayacak şekilde optimize edilmiş şablonla üretilmeli ve indirme 2 saniyeden kısa sürmeli.', 'Blocked', CURRENT_TIMESTAMP);
