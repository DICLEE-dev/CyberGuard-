# 🛡️ CyberGuard — Gerçek Zamanlı Şifre Analizörü

Kullanıcı şifre yazdıkça şifrenin entropi değerini, olası kombinasyon sayısını, farklı donanımlarda kırılma süresini ve zayıf noktalarını gerçek zamanlı analiz eden siber güvenlik aracı.

## ✨ Özellikler
- **Gerçek Zamanlı Entropi Hesaplama:** Karakter havuzu ve uzunluğa göre etkin bit entropisi hesabı.
- **Donanım Bazlı Kırılma Süresi:** Standart CPU, 8x RTX 4090 GPU kümesi ve süper bilgisayar hızlarına göre kırılma süresi tahmini.
- **Zayıf Nokta Tespiti:** Sızdırılmış Türkçe/global şifreler, klavye sıraları (`qwerty`), ardışık diziler (`1234`), tekrar eden karakterler ve yıl ifadeleri için ceza puanı.
- **Kriptografik Şifre Üretici:** `window.crypto.getRandomValues()` tabanlı güvenli şifre üretimi.
- **%100 İstemci Taraflı (Client-Side):** Hiçbir veri dış sunucuya gönderilmez.

## 🚀 Kurulum ve Çalıştırma
Herhangi bir derleme veya sunucu gerektirmez. `index.html` dosyasını tarayıcıda açmanız yeterlidir.