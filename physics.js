// Fizik ve Dünya Ayarları Modülü
const Physics = {
    gravity: 0.5,         // Yer çekimi ivmesi (aşağı doğru çekim gücü)
    friction: 0.85,       // Zemin sürtünmesi (karakter durunca kayarak yavaşlaması için)
    airResistance: 0.98,  // Hava sürtünmesi (havadayken yön değiştirmeyi biraz zorlaştırır)
    worldWidth: 900,      // Canvas genişliği
    worldHeight: 550,     // Canvas yüksekliği

    // Statik platformlar listesi (İleride harita seçimine göre çoğaltabiliriz)
    platforms: [
        // Ana Zemin (x, y, genişlik, yükseklik)
        { x: 50, y: 480, width: 800, height: 30 },
        // Havada duran sol küçük platform
        { x: 150, y: 320, width: 180, height: 15 },
        // Havada duran sağ küçük platform
        { x: 570, y: 320, width: 180, height: 15 }
    ],

    // Çarpışma kontrolleri (AABB Çarpışma Algoritması)
    checkPlatformCollision(player, platform) {
        return (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height - player.vy <= platform.y + 10 // Üstten basma toleransı
        );
    },

    // Sınır kontrolleri (Ekrandan dışarı uçmayı engellemek ya da aşağı düşünce ölmek için)
    applyBounds(player) {
        // Sol duvar
        if (player.x < 0) {
            player.x = 0;
            player.vx *= -0.5; // Duvara çarpınca biraz geri seksin
        }
        // Sağ duvar
        if (player.x + player.width > this.worldWidth) {
            player.x = this.worldWidth - player.width;
            player.vx *= -0.5;
        }
        // Tavan
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }
    }
};
