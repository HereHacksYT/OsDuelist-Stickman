/* ==========================================================================
   OSDUELIST STICKMAN - FİZİK VE DÜNYA MOTORU (TAM SÜRÜM)
   ========================================================================== */

const Physics = {
    // Fiziksel Kuvvet ve Sürtünme Katsayıları
    gravity: 0.45,         // Yer çekimi ivmesi (Karakterlerin düşme hızı)
    friction: 0.82,       // Karadaki sürtünme (Oyuncu durduğunda kayarak yavaşlar)
    airResistance: 0.97,  // Havada sürtünme (Havada yön vermeyi dengeler)

    // Sanal Çözünürlük Boyutları (16:9 HD Oranı için Sabit)
    worldWidth: 900,
    worldHeight: 550,

    // Harita Platformları Tasarımı (X, Y, Genişlik, Yükseklik)
    platforms: [
        // 1. Ana Büyük Zemin (Tam Ortada)
        { x: 100, y: 460, width: 700, height: 30 },
        
        // 2. Havada Asılı Sol Platform
        { x: 130, y: 290, width: 220, height: 15 },
        
        // 3. Havada Asılı Sağ Platform
        { x: 550, y: 290, width: 220, height: 15 },

        // 4. En Üst Küçük Strateji Platformu
        { x: 380, y: 160, width: 140, height: 15 }
    ],

    /**
     * AABB (Axis-Aligned Bounding Box) Çarpışma Algoritması
     * Oyuncunun platformların üzerine basıp basmadığını tam piksel doğruluğuyla hesaplar.
     */
    checkPlatformCollision(player, platform) {
        return (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height - player.vy <= platform.y + 12 // Düşüş toleransı (Glitchleri önler)
        );
    },

    /**
     * Dünya Sınır Koruyucu Sistem
     * Oyuncuların sağa sola çılgınca uçup ekrandan kaybolmasını engeller, 
     * ancak aşağı düşenlerin haritadan çıkıp elenmesine izin verir.
     */
    applyBounds(player) {
        // Sol Duvar Çarpışması (Hafifçe Geri Sektirmeli)
        if (player.x < 0) {
            player.x = 0;
            player.vx = Math.abs(player.vx) * 0.4; // Çarpınca sağa doğru yönelir
        }

        // Sağ Duvar Çarpışması (Hafifçe Geri Sektirmeli)
        if (player.x + player.width > this.worldWidth) {
            player.x = this.worldWidth - player.width;
            player.vx = -Math.abs(player.vx) * 0.4; // Çarpınca sola doğru yönelir
        }

        // Tavan Sınırı (Karakter tavana çarpınca ivmesi sıfırlanır)
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
    }
};
