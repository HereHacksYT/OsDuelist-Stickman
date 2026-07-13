/* ==========================================================================
   OSDUELIST STICKMAN - SİLAHLAR VE MERMİ MOTORU (TAM SÜRÜM)
   ========================================================================== */

// Ekrandaki mermileri (Muz ve Bomba gibi) takip edecek küresel dizi
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
     * Silahların Çizim Geometrisi (Her Silaha Özel Görsel Tasarım)
     */
    draw(ctx, handX, handY, direction) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // 1. KILIÇ ÇİZİMİ
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
        
        // 2. LAZER SİLAHI ÇİZİMİ
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

        // 3. BALTA ÇİZİMİ
        else if (this.name === "Balta") {
            ctx.strokeStyle = "#7f8c8d"; // Sapı metalik gri
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            
            // Saldırı anında balta aşağı doğru sertçe savrulur
            let targetAngle = this.isAttacking ? 12 : -25;
            let ax = handX + (32 * direction);
            let ay = handY + targetAngle;
            ctx.lineTo(ax, ay);
            ctx.stroke();

            // Baltanın Kesici Ağzı (Çift taraflı savaş baltası)
            ctx.fillStyle = "#d5dbdb";
            ctx.strokeStyle = "#95a5a6";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(ax, ay, 10, Math.PI * 0.5, Math.PI * 1.5, direction === -1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // 4. BALYOZ ÇİZİMİ
        else if (this.name === "Balyoz") {
            ctx.strokeStyle = "#a0522d"; // Ahşap sap
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            
            let bx = handX + (35 * direction);
            let by = this.isAttacking ? handY + 15 : handY - 20;
            ctx.lineTo(bx, by);
            ctx.stroke();

            // Devasa Balyoz Kafası
            ctx.fillStyle = "#5d6d7e";
            ctx.fillRect(bx - 8, by - 12, 16, 24);
        }

        // 5. BOMBA FIRLATICISI ÇİZİMİ
        else if (this.name === "Bomba") {
            ctx.fillStyle = "#2c3e50";
            // Roketatar benzeri namlu
            ctx.fillRect(handX, handY - 6, 25 * direction, 12);
            // Tetik arkası hazne
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(handX - (2 * direction), handY - 3, 4 * direction, 6);
        }

        // 6. MUZ FIRLATAN SİLAH ÇİZİMİ
        else if (this.name === "Muz Fırlatan Silah") {
            ctx.fillStyle = "#ffeb3b"; // Muz renginde tabanca
            ctx.fillRect(handX, handY - 4, 20 * direction, 8);
            ctx.fillStyle = "#fbc02d";
            ctx.fillRect(handX + (4 * direction), handY + 4, 5 * direction, 6); // Kabza
        }

        // 7. MIKNATIS ÇİZİMİ
        else if (this.name === "Mıknatıs") {
            ctx.strokeStyle = "#e74c3c"; // Kırmızı ucu
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            let mx = handX + (18 * direction);
            ctx.lineTo(mx, handY);
            ctx.stroke();

            // Mıknatısın metal nalları (U Şekli)
            ctx.strokeStyle = "#ecf0f1"; // Beyaz kutup ucu
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(mx, handY - 6);
            ctx.lineTo(mx + (6 * direction), handY - 6);
            ctx.moveTo(mx, handY + 6);
            ctx.lineTo(mx + (6 * direction), handY + 6);
            ctx.stroke();

            // Çekim Alanı Dalgası Efekti (Saldırı anında)
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
     * Silah Tetikleme ve Çarpışma Hesaplama Algoritması
     */
    use(owner, target) {
        if (this.cooldown > 0) return;

        this.isAttacking = true;
        this.attackTimer = 15;
        this.cooldown = 30; // Genel saldırı hızı

        let ownerCenterX = owner.x + owner.width / 2;
        let targetCenterX = target.x + target.width / 2;
        let distance = Math.abs(ownerCenterX - targetCenterX);
        let isTargetInFront = (owner.direction === 1 && target.x > owner.x) || 
                              (owner.direction === -1 && target.x < owner.x);

        // --- YAKIN DÖVÜŞ: KILIÇ ---
        if (this.name === "Kılıç" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 60) {
            target.takeDamage(this.damage, owner.direction * 14, -7);
        } 
        
        // --- MENZİLLİ: LAZER ---
        else if (this.name === "Lazer" && isTargetInFront && distance < this.range && Math.abs((owner.y + 20) - (target.y + 20)) < 45) {
            target.takeDamage(this.damage, owner.direction * 8, -3);
        }

        // --- YAKIN DÖVÜŞ: BALTA (Yüksek Hasar, Orta Fırlatma) ---
        else if (this.name === "Balta" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 60) {
            target.takeDamage(this.damage, owner.direction * 11, -8);
        }

        // --- YAKIN DÖVÜŞ: BALYOZ (Devasa Fırlatma Kuvveti) ---
        else if (this.name === "Balyoz" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 65) {
            target.takeDamage(this.damage, owner.direction * 22, -12); // Uçurur!
        }

        // --- ÖZEL MEKANİK: MIKNATIS (Kendine Çeker!) ---
        else if (this.name === "Mıknatıs" && distance < this.range && isTargetInFront && Math.abs(owner.y - target.y) < 80) {
            // Fırlatmak yerine sahibine doğru hızla çeker (-owner.direction)
            let pullForceX = -owner.direction * 15;
            let pullForceY = -4; // Hafifçe yerden keser ki rahat çekilsin
            target.takeDamage(this.damage, pullForceX, pullForceY);
        }

        // --- MERMİLİ SİLAH: BOMBA (Uzak Menzile Fırlatılır) ---
        else if (this.name === "Bomba") {
            let startX = ownerCenterX + (25 * owner.direction);
            let startY = owner.y + 22;
            // fırlatılan mermi nesnesini diziye ekle
            projectiles.push(new Projectile(startX, startY, owner.direction, "bomba", this.damage));
        }

        // --- MERMİLİ SİLAH: MUZ TABANCASI ---
        else if (this.name === "Muz Fırlatan Silah") {
            let startX = ownerCenterX + (22 * owner.direction);
            let startY = owner.y + 22;
            // Hızlı muz mermisi
            projectiles.push(new Projectile(startX, startY, owner.direction, "muz", this.damage));
            this.cooldown = 15; // Muz silahı seri ateş eder!
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
   PROJECTILE (MERMİ, BOMBA, MUZ) SINIFI
   ========================================================================== */
class Projectile {
    constructor(x, y, direction, type, damage) {
        this.x = x;
        this.y = y;
        this.vx = direction * (type === "muz" ? 12 : 7); // Muz daha hızlı gider
        this.vy = type === "bomba" ? -4 : 0;            // Bomba hafif kavisli gider
        this.type = type;
        this.damage = damage;
        this.radius = type === "bomba" ? 8 : 6;
        this.active = true;
    }

    update(target) {
        // Fiziksel İlerleme
        if (this.type === "bomba") {
            this.vy += 0.25; // Bombaya yerçekimi uygula (kavisli düşüş)
        }
        this.x += this.vx;
        this.y += this.vy;

        // Ekran Sınır Kontrolü
        if (this.x < 0 || this.x > 900 || this.y > 550) {
            this.active = false;
            return;
        }

        // Hedef Hitbox Kontrolü (Mermi hedefe çarptı mı?)
        let hit = this.x > target.x && 
                  this.x < target.x + target.width && 
                  this.y > target.y && 
                  this.y < target.y + target.height;

        if (hit) {
            this.active = false;
            if (this.type === "bomba") {
                // Bomba patlaması: Devasa alan hasarı ve uçurma etkisi
                let dir = this.vx > 0 ? 1 : -1;
                target.takeDamage(this.damage + 10, dir * 18, -10);
            } else if (this.type === "muz") {
                // Muz isabeti: Normal hasar, kaydırma etkisi
                let dir = this.vx > 0 ? 1 : -1;
                target.takeDamage(this.damage, dir * 9, -2);
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        if (this.type === "bomba") {
            // Siyah gülle bomba çizimi
            ctx.fillStyle = "#2c3e50";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Yanan fitil kıvılcımı
            ctx.fillStyle = "#e67e22";
            ctx.fillRect(this.x + 2, this.y - 10, 3, 3);
        } 
        else if (this.type === "muz") {
            // Hilal şeklinde sarı muz mermisi
            ctx.fillStyle = "#ffeb3b";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ffeb3b";
            ctx.stroke();
        }
    }
}
