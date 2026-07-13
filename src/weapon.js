/* ==========================================================================
   OSDUELIST STICKMAN - SİLAH VE VURUŞ MOTORU (TAM SÜRÜM)
   ========================================================================== */

class Weapon {
    constructor(name, type, damage, range) {
        this.name = name;
        this.type = type; // "melee" (Yakın Dövüş) veya "ranged" (Menzilli Lazer)
        this.damage = damage;
        this.range = range;
        
        // Saldırı Zamanlayıcıları
        this.isAttacking = false;
        this.attackTimer = 0;
        this.cooldown = 0;
    }

    /**
     * Silahları Karakterin El Pozisyonuna Göre Ekrana Çizme
     */
    draw(ctx, handX, handY, direction) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (this.name === "Kılıç") {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#f39c12"; // Altın Sarısı Kılıç Namlusu

            ctx.beginPath();
            ctx.moveTo(handX, handY);

            if (this.isAttacking) {
                // Saldırı anında kılıç öne doğru hızla savrulur (Açı esnetilir)
                ctx.lineTo(handX + (this.range * 0.9 * direction), handY + 10);
                
                // Vuruş Efekti (Rüzgar çizgisi)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 2;
                ctx.stroke();
                
                ctx.strokeStyle = "#f39c12";
                ctx.lineWidth = 4;
            } else {
                // Normal duruş: Kılıç çapraz yukarı bakar
                ctx.lineTo(handX + (28 * direction), handY - 18);
            }
            ctx.stroke();

            // Kılıcın Kabzası (Detay kozmetik)
            ctx.strokeStyle = "#7f8c8d";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(handX - (2 * direction), handY + 2);
            ctx.lineTo(handX + (4 * direction), handY - 4);
            ctx.stroke();
        } 
        
        else if (this.name === "Lazer") {
            // Lazer Silahının Gövdesi
            ctx.fillStyle = "#9b59b6"; // Mor Lazer Silahı
            ctx.fillRect(handX, handY - 5, 22 * direction, 9);
            
            // Silah Kabzası
            ctx.fillStyle = "#34495e";
            ctx.fillRect(handX + (4 * direction), handY + 4, 6 * direction, 6);

            // Eğer ateş ediliyorsa Lazer Işınını Çiz
            if (this.isAttacking && this.attackTimer > 5) {
                ctx.strokeStyle = "#e67e22"; // Neon Turuncu Lazer Işını
                ctx.lineWidth = 4;
                ctx.shadowBlur = 15; // Lazer parlama efekti (Yüksek Kalite)
                ctx.shadowColor = "#e67e22";

                ctx.beginPath();
                ctx.moveTo(handX + (22 * direction), handY - 1);
                ctx.lineTo(handX + (this.range * direction), handY - 1);
                ctx.stroke();

                // Parlama efektini diğer çizimler bozulmasın diye hemen sıfırla
                ctx.shadowBlur = 0;
            }
        }
    }

    /**
     * Silahı Kullanma ve Hasar/Fırlatma Algoritması
     */
    use(owner, target) {
        // Eğer silah bekleme süresindeyse (cooldown) ateş edemez
        if (this.cooldown > 0) return;

        this.isAttacking = true;
        this.attackTimer = 15; // Saldırı animasyon karesi süresi
        this.cooldown = 25;    // Vuruş hızı (Saldırı arası gecikme)

        // 1. YAKIN DÖVÜŞ (KILIÇ) VURUŞ KONTROLÜ
        if (this.type === "melee") {
            let distance = Math.abs((owner.x + owner.width / 2) - (target.x + target.width / 2));
            
            // Hedef doğru yönde mi?
            let isTargetInFront = (owner.direction === 1 && target.x > owner.x) || 
                                  (owner.direction === -1 && target.x < owner.x);

            // Mesafe ve yükseklik kontrolü (Kılıç menzilindeyse)
            if (distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 65) {
                // Supreme Duelist tarzı devasa geri fırlatma kuvveti
                let knockbackX = owner.direction * 14; 
                let knockbackY = -7; // Havaya doğru uçurur
                
                target.takeDamage(this.damage, knockbackX, knockbackY);
            }
        } 
        
        // 2. MENZİLLİ (LAZER) VURUŞ KONTROLÜ
        else if (this.type === "ranged") {
            let distance = Math.abs(owner.x - target.x);
            let isTargetInFront = (owner.direction === 1 && target.x > owner.x) || 
                                  (owner.direction === -1 && target.x < owner.x);

            // Lazer ışını yatay bir çizgide hedefi kesiyor mu?
            if (isTargetInFront && distance < this.range && Math.abs((owner.y + 20) - (target.y + 20)) < 45) {
                // Lazer daha az fırlatır ama uzaktan vurur
                let knockbackX = owner.direction * 9;
                let knockbackY = -4;
                
                target.takeDamage(this.damage, knockbackX, knockbackY);
            }
        }
    }

    /**
     * Zamanlayıcıları Saniyede 60 Kare Hızında Güncelleme
     */
    update() {
        if (this.cooldown > 0) this.cooldown--;
        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }
    }
}
