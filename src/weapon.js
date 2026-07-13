class Weapon {
    constructor(name, type, damage, range) {
        this.name = name;
        this.type = type; // "melee" (yakın dövüş) veya "ranged" (menzilli)
        this.damage = damage;
        this.range = range;
        
        this.isAttacking = false;
        this.attackTimer = 0;
        this.cooldown = 0;
    }

    // Silahı Çizme Fonksiyonu (Karakterin el koordinatlarına göre)
    draw(ctx, handX, handY, direction) {
        ctx.lineWidth = 5;
        
        if (this.name === "Kılıç") {
            ctx.strokeStyle = "#f1c40f"; // Altın Sarısı Kılıç
            ctx.beginPath();
            ctx.moveTo(handX, handY);
            
            // Saldırı anında kılıç öne doğru savrulur
            if (this.isAttacking) {
                ctx.lineTo(handX + (this.range * direction), handY - 5);
            } else {
                ctx.lineTo(handX + (25 * direction), handY - 20); // Normal duruş
            }
            ctx.stroke();
        } 
        else if (this.name === "Lazer Silahı") {
            ctx.strokeStyle = "#9b59b6"; // Mor Silah
            ctx.fillStyle = "#9b59b6";
            
            // Basit bir namlu çizimi
            ctx.beginPath();
            ctx.fillRect(handX, handY - 4, 20 * direction, 8);
            
            // Eğer ateş ediyorsa lazer ışınını çiz
            if (this.isAttacking && this.attackTimer > 10) {
                ctx.strokeStyle = "#e67e22"; // Turuncu Lazer Işını
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(handX + (20 * direction), handY);
                ctx.lineTo(handX + (this.range * direction), handY);
                ctx.stroke();
            }
        }
    }

    // Saldırı Tetikleme
    use(owner, target) {
        if (this.cooldown > 0) return;

        this.isAttacking = true;
        this.attackTimer = 20; // Saldırı animasyon süresi
        this.cooldown = 30;    // İki saldırı arası bekleme süresi

        // Vuruş Kontrolü (Hitbox)
        if (this.type === "melee") {
            // Yakın dövüş: Mesafe ve yön kontrolü
            let distance = Math.abs((owner.x + owner.width/2) - (target.x + target.width/2));
            let correctDirection = (direction) => {
                return direction === 1 ? (target.x > owner.x) : (target.x < owner.x);
            };

            if (distance < this.range && correctDirection(owner.direction) && Math.abs(owner.y - target.y) < 60) {
                // Supreme Duelist tarzı fırlatma kuvveti (Knockback)
                let kbX = owner.direction * 12;
                let kbY = -6; 
                target.takeDamage(this.damage, kbX, kbY);
            }
        } 
        else if (this.type === "ranged") {
            // Menzilli: Lazer ışını hedefi kesiyor mu?
            let correctDirection = (owner.direction === 1 && target.x > owner.x) || (owner.direction === -1 && target.x < owner.x);
            let distance = Math.abs(owner.x - target.x);

            if (correctDirection && distance < this.range && Math.abs(owner.y - target.y) < 40) {
                let kbX = owner.direction * 8;
                let kbY = -4;
                target.takeDamage(this.damage, kbX, kbY);
            }
        }
    }

    // Zamanlayıcıları Güncelleme
    update() {
        if (this.cooldown > 0) this.cooldown--;
        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) this.isAttacking = false;
        }
    }
}
