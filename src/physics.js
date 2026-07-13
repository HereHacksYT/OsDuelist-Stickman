/* ==========================================================================
   OSDUELIST STICKMAN - FİZİK VE DÜNYA MOTORU (HARİTA UYUMLU TAM SÜRÜM)
   ========================================================================== */

const Physics = {
    gravity: 0.45,         
    friction: 0.82,       
    airResistance: 0.97,  

    worldWidth: 900,
    worldHeight: 550,

    // Aktif harita modu takipçisi ("Yüksek Arena" veya "Kapalı Arena")
    currentMap: "Yüksek Arena",

    platforms: [
        { x: 100, y: 460, width: 700, height: 30 },
        { x: 130, y: 290, width: 220, height: 15 },
        { x: 550, y: 290, width: 220, height: 15 },
        { x: 380, y: 160, width: 140, height: 15 }
    ],

    checkPlatformCollision(player, platform) {
        return (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height >= platform.y &&
            player.y + player.height - player.vy <= platform.y + 12
        );
    },

    /**
     * Haritaya Özel Sınır Koruyucu Sistem
     */
    applyBounds(player) {
        // Sol Duvar
        if (player.x < 0) {
            player.x = 0;
            player.vx = Math.abs(player.vx) * 0.4;
        }

        // Sağ Duvar
        if (player.x + player.width > this.worldWidth) {
            player.x = this.worldWidth - player.width;
            player.vx = -Math.abs(player.vx) * 0.4;
        }

        // Tavan Sınırı
        if (player.y < 0) {
            player.y = 0;
            player.vy = 0;
        }

        // KAPALI ARENA MODUNDA ALT SINIR (Düşerek ölmeyi engeller, zemin görevi görür)
        if (this.currentMap === "Kapalı Arena") {
            let groundLimit = this.worldHeight - player.height - 20;
            if (player.y > groundLimit) {
                player.y = groundLimit;
                player.vy = 0;
                player.isGrounded = true;
            }
        }
    }
};
