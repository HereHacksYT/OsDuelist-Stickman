/* ==========================================================================
   OSDUELIST STICKMAN - SİLAHLAR VE AKILLI HASAR MOTORU (TAM SÜRÜM)
   ========================================================================== */

// Ekrandaki mermileri (Muz ve Yuvarlanan Bomba) takip eden küresel dizi
let projectiles = [];

class Weapon {
    constructor(name, type, damage, range) {
        this.name = name;
        this.type = type; 
        this.damage = damage;
        this.range = range;
        
        this.isAttacking = false;
        this.attackTimer = 0;
        this.cooldown = 0;
    }

    /**
     * Silahların Çizim Geometrisi
     */
    draw(ctx, handX, handY, direction) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (this.name === "Kılıç") {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#f39c12"; 
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            if (this.isAttacking) {
                ctx.lineTo(handX + (this.range * 0.9 * direction), handY + 10);
            } else {
                ctx.lineTo(handX + (28 * direction), handY - 18);
            }
            ctx.stroke();
        } 
        else if (this.name === "Lazer") {
            ctx.fillStyle = "#9b59b6";
            ctx.fillRect(handX, handY - 5, 22 * direction, 9);
            if (this.isAttacking && this.attackTimer > 5) {
                ctx.strokeStyle = "#e67e22";
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(handX + (22 * direction), handY - 1);
                ctx.lineTo(handX + (this.range * direction), handY - 1);
                ctx.stroke();
            }
        }
        else if (this.name === "Balta") {
            ctx.strokeStyle = "#7f8c8d";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            let targetAngle = this.isAttacking ? 12 : -25;
            let ax = handX + (32 * direction);
            let ay = handY + targetAngle;
            ctx.lineTo(ax, ay);
            ctx.stroke();
            ctx.fillStyle = "#d5dbdb";
            ctx.strokeStyle = "#95a5a6";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ax, ay, 10, Math.PI * 0.5, Math.PI * 1.5, direction === -1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        else if (this.name === "Balyoz") {
            ctx.strokeStyle = "#a0522d";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            let bx = handX + (35 * direction);
            let by = this.isAttacking ? handY + 15 : handY - 20;
            ctx.lineTo(bx, by);
            ctx.stroke();
            ctx.fillStyle = "#5d6d7e";
            ctx.fillRect(bx - 8, by - 12, 16, 24);
        }
        else if (this.name === "Bomba") {
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(handX, handY - 6, 25 * direction, 12);
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(handX - (2 * direction), handY - 3, 4 * direction, 6);
        }
        else if (this.name === "Muz Fırlatan Silah") {
            ctx.fillStyle = "#ffeb3b";
            ctx.fillRect(handX, handY - 4, 20 * direction, 8);
            ctx.fillStyle = "#fbc02d";
            ctx.fillRect(handX + (4 * direction), handY + 4, 5 * direction, 6);
        }
        else if (this.name === "Mıknatıs") {
            ctx.strokeStyle = "#e74c3c";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            let mx = handX + (18 * direction);
            ctx.lineTo(mx, handY);
            ctx.stroke();
            ctx.strokeStyle = "#ecf0f1";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(mx, handY - 6);
            ctx.lineTo(mx + (6 * direction), handY - 6);
            ctx.moveTo(mx, handY + 6);
            ctx.lineTo(mx + (6 * direction), handY + 6);
            ctx.stroke();
            if (this.isAttacking) {
                ctx.strokeStyle = "rgba(52, 152, 219, 0.4)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mx, handY, this.range, -Math.PI/4, Math.PI/4, direction === -1);
                ctx.stroke();
            }
        }
    }

    /**
     * Silah Tetikleme ve Cooldown Yönetimi
     */
    use(owner, target) {
        if (this.cooldown > 0) return;

        this.isAttacking = true;
        this.attackTimer = 15;

        // KRİTİK BEKLEME SÜRELERİ (COOLDOWN)
        if (this.name === "Bomba") {
            this.cooldown = 180; // 3 Saniye
        } else {
            this.cooldown = 60;  // 1 Saniye
        }

        let ownerCenterX = owner.x + owner.width / 2;
        let targetCenterX = target.x + target.width / 2;
        let distance = Math.abs(ownerCenterX - targetCenterX);
        let isTargetInFront = (owner.direction === 1 && target.x > owner.x) || 
                              (owner.direction === -1 && target.x < owner.x);

        // Yakın dövüş kontrolleri
        if (this.name === "Kılıç" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 60) {
            target.takeDamage(this.damage, owner.direction * 14, -7);
        } 
        else if (this.name === "Lazer" && isTargetInFront && distance < this.range && Math.abs((owner.y + 20) - (target.y + 20)) < 45) {
            target.takeDamage(this.damage, owner.direction * 8, -3);
        }
        else if (this.name === "Balta" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 60) {
            target.takeDamage(this.damage, owner.direction * 11, -8);
        }
        else if (this.name === "Balyoz" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 65) {
            target.takeDamage(this.damage, owner.direction * 22, -12);
        }
        else if (this.name === "Mıknatıs" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 80) {
            target.takeDamage(this.damage, -owner.direction * 15, -4);
        }
        // MERMİLİ SİLAHLARDA 'OWNER' BİLGİSİNİ AKTARIYORUZ
        else if (this.name === "Bomba") {
            let startX = ownerCenterX + (25 * owner.direction);
            let startY = owner.y + 22;
            projectiles.push(new Projectile(startX, startY, owner.direction, "bomba", this.damage, owner));
        }
        else if (this.name === "Muz Fırlatan Silah") {
            let startX = ownerCenterX + (22 * owner.direction);
            let startY = owner.y + 22;
            projectiles.push(new Projectile(startX, startY, owner.direction, "muz", this.damage, owner));
        }
    }

    update() {
        if (this.cooldown > 0) this.cooldown--;
        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }
    }
}

/* ==========================================================================
   YUVARLANAN VE SAHİP DUYARLI MERMİ MOTORU
   ========================================================================== */
class Projectile {
    // constructor kısmına 'owner' parametresi eklendi
    constructor(x, y, direction, type, damage, owner) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = damage; // Normal hasar (35)
        this.owner = owner;   // Silahı ateşleyen karakter
        this.radius = type === "bomba" ? 9 : 6;
        this.active = true;

        this.vx = direction * (type === "muz" ? 12 : 6);
        this.vy = type === "bomba" ? -4.5 : 0;

        this.hasTouchedGround = false;
        this.fuseTimer = 60; 
        this.explosionCircle = 0;
        this.drawExplosionFX = false;
    }

    update(p1, p2) {
        if (!this.active) return;

        // OYUNCULARIN BİRBİRİNE DEĞMESİ (KATI FİZİK)
        if (p1.health > 0 && p2.health > 0) {
            let p1CenterX = p1.x + p1.width / 2;
            let p2CenterX = p2.x + p2.width / 2;
            let isOverlappingX = p1.x < p2.x + p2.width && p1.x + p1.width > p2.x;
            let isOverlappingY = p1.y < p2.y + p2.height && p1.y + p1.height > p2.y;
            if (isOverlappingX && isOverlappingY) {
                let intersectX = (p1.width + p2.width) / 2 - Math.abs(p1CenterX - p2CenterX);
                if (p1CenterX < p2CenterX) { p1.x -= intersectX * 0.5; p2.x += intersectX * 0.5; p1.vx = -1.5; p2.vx = 1.5; } 
                else { p1.x += intersectX * 0.5; p2.x -= intersectX * 0.5; p1.vx = 1.5; p2.vx = -1.5; }
            }
        }

        // --- MUZ MERMİSİ (Ateşleyene çarpmaz, doğrudan rakibi arar) ---
        if (this.type === "muz") {
            this.x += this.vx;
            [p1, p2].forEach(target => {
                if (target !== this.owner && target.health > 0 && this.x > target.x && this.x < target.x + target.width &&
                    this.y > target.y && this.y < target.y + target.height) {
                    this.active = false;
                    target.takeDamage(this.damage, this.vx > 0 ? 9 : -9, -2);
                }
            });
            if (this.x < 0 || this.x > 900) this.active = false;
            return;
        }

        // --- YUVARLANAN VE TEKMELENEBİLEN BOMBA ---
        if (this.type === "bomba") {
            this.vy += 0.3; 
            if (this.hasTouchedGround) { this.vx *= 0.95; }
            this.x += this.vx;
            this.y += this.vy;

            // Duvar sekmeleri
            if (this.x - this.radius < 0) { this.x = this.radius; this.vx = -this.vx * 0.6; }
            if (this.x + this.radius > 900) { this.x = 900 - this.radius; this.vx = -this.vx * 0.6; }

            // Platform çarpışmaları
            for (let plat of Physics.platforms) {
                if (this.x > plat.x && this.x < plat.x + plat.width &&
                    this.y + this.radius >= plat.y && this.y - this.radius <= plat.y + 10) {
                    this.y = plat.y - this.radius;
                    this.vy = 0;
                    this.hasTouchedGround = true;
                }
            }
            if (Physics.currentMap === "Kapalı Arena" && this.y + this.radius >= 530) {
                this.y = 530 - this.radius;
                this.vy = 0;
                this.hasTouchedGround = true;
            }

            // BOMBA TEKMELEME MOTORU
            [p1, p2].forEach(player => {
                if (player.health <= 0) return;
                let bombOverlapsX = this.x + this.radius > player.x && this.x - this.radius < player.x + player.width;
                let bombOverlapsY = this.y + this.radius > player.y && this.y - this.radius < player.y + player.height;
                if (bombOverlapsX && bombOverlapsY) {
                    let playerCenterX = player.x + player.width / 2;
                    if (this.x < playerCenterX) { this.vx = -Math.abs(this.vx) - 4; this.x = player.x - this.radius - 2; } 
                    else { this.vx = Math.abs(this.vx) + 4; this.x = player.x + player.width + this.radius + 2; }
                    if (Math.abs(player.vx) > 0.2) { this.vx += player.vx * 1.5; }
                    this.vy = -2.5;
                    this.hasTouchedGround = true;
                }
            });

            if (this.hasTouchedGround) {
                this.fuseTimer--;
                if (this.fuseTimer <= 0) { this.explode(p1, p2); }
            }
            if (this.y > 560) this.active = false;
        }
    }

    /**
     * AKILLI PATLAMA: SAHİBİNE 10, DİĞERİNE 35 HASAR
     */
    explode(p1, p2) {
        this.active = false;
        this.explosionCircle = 112; 
        this.drawExplosionFX = true;

        [p1, p2].forEach(target => {
            if (target.health <= 0) return;

            let targetCenterX = target.x + target.width / 2;
            let targetCenterY = target.y + target.height / 2;
            let dist = Math.hypot(this.x - targetCenterX, this.y - targetCenterY);

            if (dist < this.explosionCircle) {
                let pushDir = targetCenterX > this.x ? 1 : -1;
                let forceMultiplier = (this.explosionCircle - dist) / this.explosionCircle;
                
                // KRİTİK HASAR MANTIĞI:
                // Eğer patlamaya yakalanan hedef bombayı atan kişiyse (owner) 10 hasar, değilse 35 hasar ver.
                let finalDamage = (target === this.owner) ? 10 : this.damage;
                
                target.takeDamage(finalDamage, pushDir * 24 * forceMultiplier, -14 * forceMultiplier);
            }
        });
    }

    draw(ctx) {
        if (!this.active) {
            if (this.drawExplosionFX) {
                ctx.fillStyle = "rgba(231, 76, 60, 0.6)";
                ctx.beginPath(); ctx.arc(this.x, this.y, this.explosionCircle, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "rgba(241, 196, 15, 0.7)";
                ctx.beginPath(); ctx.arc(this.x, this.y, this.explosionCircle * 0.5, 0, Math.PI * 2); ctx.fill();
                this.drawExplosionFX = false; 
            }
            return;
        }
        if (this.type === "bomba") {
            ctx.fillStyle = "#2c3e50";
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
            if (this.hasTouchedGround && Math.floor(this.fuseTimer / 6) % 2 === 0) { ctx.fillStyle = "#e74c3c"; } 
            else { ctx.fillStyle = "#f1c40f"; }
            ctx.fillRect(this.x - 2, this.y - this.radius - 4, 4, 4);
        } 
        else if (this.type === "muz") {
            ctx.fillStyle = "#ffeb3b";
            ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.lineWidth = 3; ctx.strokeStyle = "#ffeb3b"; ctx.stroke();
        }
    }
}
