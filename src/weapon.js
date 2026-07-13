/* ==========================================================================
   OSDUELIST STICKMAN - SİLAHLAR VE FİZİKSEL MERMİ MOTORU (TAM SÜRÜM)
   ========================================================================== */

// Ekrandaki mermileri (Muz ve Yuvarlanan Bomba) takip eden küresel dizi
let projectiles = [];

class Weapon {
    constructor(name, type, damage, range) {
        this.name = name;
        this.type = type; // "melee", "ranged", "projectile", "pull"
        this.damage = damage;
        this.range = range;
        
        // Zamanlayıcılar
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

        // 1. KILIÇ
        if (this.name === "Kılıç") {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#f39c12"; 
            ctx.beginPath();
            ctx.moveTo(handX);
            ctx.moveTo(handX, handY);
            if (this.isAttacking) {
                ctx.lineTo(handX + (this.range * 0.9 * direction), handY + 10);
            } else {
                ctx.lineTo(handX + (28 * direction), handY - 18);
            }
            ctx.stroke();
        } 
        
        // 2. LAZER SİLAHI
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

        // 3. BALTA
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

        // 4. BALYOZ
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

        // 5. BOMBA FIRLATICISI
        else if (this.name === "Bomba") {
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(handX, handY - 6, 25 * direction, 12);
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(handX - (2 * direction), handY - 3, 4 * direction, 6);
        }

        // 6. MUZ FIRLATAN SİLAH
        else if (this.name === "Muz Fırlatan Silah") {
            ctx.fillStyle = "#ffeb3b";
            ctx.fillRect(handX, handY - 4, 20 * direction, 8);
            ctx.fillStyle = "#fbc02d";
            ctx.fillRect(handX + (4 * direction), handY + 4, 5 * direction, 6);
        }

        // 7. MIKNATIS
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

        // COOLDOWN BALANSLARI
        if (this.name === "Bomba") {
            this.cooldown = 180; // Tam 3 Saniye Bekleme Süresi
        } else {
            this.cooldown = 60;  // Diğer Tüm Silahlar ve Muz Tam 1 Saniye
        }

        let ownerCenterX = owner.x + owner.width / 2;
        let targetCenterX = target.x + target.width / 2;
        let distance = Math.abs(ownerCenterX - targetCenterX);
        let isTargetInFront = (owner.direction === 1 && target.x > owner.x) || 
                              (owner.direction === -1 && target.x < owner.x);

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
        else if (this.name === "Bomba") {
            let startX = ownerCenterX + (25 * owner.direction);
            let startY = owner.y + 22;
            projectiles.push(new Projectile(startX, startY, owner.direction, "bomba", this.damage));
        }
        else if (this.name === "Muz Fırlatan Silah") {
            let startX = ownerCenterX + (22 * owner.direction);
            let startY = owner.y + 22;
            projectiles.push(new Projectile(startX, startY, owner.direction, "muz", this.damage));
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
   YUVARLANAN VE GECİKMELİ PATLAYAN PROJECTILE MOTORU
   ========================================================================== */
class Projectile {
    constructor(x, y, direction, type, damage) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = damage;
        this.radius = type === "bomba" ? 9 : 6;
        this.active = true;

        // İlk Fırlatılma Hızları
        this.vx = direction * (type === "muz" ? 12 : 6);
        this.vy = type === "bomba" ? -4.5 : 0;

        // Bomba Mekanik Zamanlayıcıları
        this.isGrounded = false;
        this.fuseTimer = 60; // Yere değdikten sonra 1 saniye (60 kare) sayar
        this.hasTouchedGround = false;
        this.explosionCircle = 0; // Görsel patlama halkası efekti çapı
    }

    update(p1, p2) {
        if (!this.active) return;

        // --- MUZ MERMİSİ KURALI (DOĞRUSAL HIZLI ATIŞ) ---
        if (this.type === "muz") {
            this.x += this.vx;
            
            // Muz doğrudan gövdeye çarptı mı?
            [p1, p2].forEach(target => {
                if (target.health > 0 && this.x > target.x && this.x < target.x + target.width &&
                    this.y > target.y && this.y < target.y + target.height) {
                    this.active = false;
                    target.takeDamage(this.damage, this.vx > 0 ? 9 : -9, -2);
                }
            });

            if (this.x < 0 || this.x > 900) this.active = false;
            return;
        }

        // --- GELİŞMİŞ YUVARLANAN BOMBA SİMÜLASYONU ---
        if (this.type === "bomba") {
            // Yerçekimi bombayı aşağı çeker
            this.vy += 0.3; 
            
            // Sürtünme: Yere değdiğinde bomba yuvarlanarak yavaşlar
            if (this.hasTouchedGround) {
                this.vx *= 0.95; 
            }

            this.x += this.vx;
            this.y += this.vy;

            // Ekran Duvarlarından Sekme Mekaniği
            if (this.x - this.radius < 0) { this.x = this.radius; this.vx = -this.vx * 0.6; }
            if (this.x + this.radius > 900) { this.x = 900 - this.radius; this.vx = -this.vx * 0.6; }

            // Platform Çarpışma ve Üzerinde Yuvarlanma Kontrolü
            let onPlatform = false;
            for (let plat of Physics.platforms) {
                if (this.x > plat.x && this.x < plat.x + plat.width &&
                    this.y + this.radius >= plat.y && this.y - this.radius <= plat.y + 10) {
                    this.y = plat.y - this.radius;
                    this.vy = 0;
                    onPlatform = true;
                    this.hasTouchedGround = true;
                }
            }

            // Kapalı Arena zemin kontrolü
            if (Physics.currentMap === "Kapalı Arena" && this.y + this.radius >= 530) {
                this.y = 530 - this.radius;
                this.vy = 0;
                onPlatform = true;
                this.hasTouchedGround = true;
            }

            // Fitil Geri Sayımı (Yere bir kez değdiyse başlar)
            if (this.hasTouchedGround) {
                this.fuseTimer--;
                if (this.fuseTimer <= 0) {
                    this.explode(p1, p2);
                }
            }

            // Boşluğa uçup gitme kontrolü
            if (this.y > 560) this.active = false;
        }
    }

    /**
     * Devasa Alan Hasarlı Patlama Algoritması
     */
    explode(p1, p2) {
        this.active = false;
        this.explosionCircle = 75; // Patlama etki yarıçapı

        // Haritadaki her iki karakteri de patlama mesafesine göre kontrol et
        [p1, p2].forEach(target => {
            if (target.health <= 0) return;

            let targetCenterX = target.x + target.width / 2;
            let targetCenterY = target.y + target.height / 2;
            
            // Merkezler arası tam piksel mesafesi
            let dist = Math.hypot(this.x - targetCenterX, this.y - targetCenterY);

            if (dist < this.explosionCircle) {
                // Bombanın itme yönü
                let pushDir = targetCenterX > this.x ? 1 : -1;
                // Yakınlığa göre şok dalgası şiddeti ayarla
                let forceMultiplier = (this.explosionCircle - dist) / this.explosionCircle;
                
                // Hasar 35 yapıldı: 3 bomba tam represents 105 hasar -> ÖLÜM!
                target.takeDamage(this.damage, pushDir * 22 * forceMultiplier, -13 * forceMultiplier);
            }
        });

        // Patlama duman halkasını ekranda göstermek için anlık efekt tetikleyicisi çizelim
        this.drawExplosionFX = true;
    }

    draw(ctx) {
        if (!this.active) {
            // Patlama anı alev çemberi kozmetiği
            if (this.drawExplosionFX && this.explosionCircle > 0) {
                ctx.fillStyle = "rgba(231, 76, 60, 0.7)";
                ctx.beginPath();
                ctx.arc(this.x, this.y, 65, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(241, 196, 15, 0.5)";
                ctx.beginPath();
                ctx.arc(this.x, this.y, 35, 0, Math.PI * 2);
                ctx.fill();
                this.drawExplosionFX = false; // Bir sonraki karede temizle
            }
            return;
        }

        if (this.type === "bomba") {
            // Bomba Gövdesi
            ctx.fillStyle = "#2c3e50";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Yere değdiyse parlayan kırmızı fitil uyarısı flaş çakar
            if (this.hasTouchedGround && Math.floor(this.fuseTimer / 6) % 2 === 0) {
                ctx.fillStyle = "#e74c3c";
            } else {
                ctx.fillStyle = "#f1c40f";
            }
            ctx.fillRect(this.x - 2, this.y - this.radius - 4, 4, 4);
        } 
        else if (this.type === "muz") {
            ctx.fillStyle = "#ffeb3b";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ffeb3b";
            ctx.stroke();
        }
    }
}
