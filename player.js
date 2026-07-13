class Player {
    constructor(x, y, color, isBot = false) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.width = 30;
        this.height = 60;
        this.color = color;
        this.isBot = isBot;
        
        // Oyun Durumları
        this.health = 100;
        this.isGrounded = false;
        this.direction = isBot ? -1 : 1; // Başlangıç yönü
        this.speed = 0.8;
        this.maxSpeed = 6;
        this.jumpForce = 13;

        // Silah Yuvası (Bir sonraki adımda weapon.js ile dolduracağız)
        this.weapon = null; 
    }

    // Çöp Adamın Çizimi (Canvas Elementleri)
    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";

        // 1. Kafa
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y - 15, 12, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Gövde (Omurga)
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.stroke();

        // 3. Bacaklar (Harekete göre hafif esner)
        ctx.beginPath();
        // Sol Bacak
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x, this.y + this.height);
        // Sağ Bacak
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.stroke();

        // 4. Kollar ve Silahı Tutuş Pozisyonu
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        // Elini silahın doğrultusuna göre uzatır
        let handX = this.x + this.width / 2 + (20 * this.direction);
        let handY = this.y + 20;
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Eğer kuşanılmış bir silah varsa, silahı çiz
        if (this.weapon) {
            this.weapon.draw(ctx, handX, handY, this.direction);
        }
    }

    // Karakterin Pozisyonunu ve Fiziklerini Güncelleme
    update() {
        // Yerçekimi Uygula
        this.vy += Physics.gravity;

        // Sürtünme Uygula (Havada veya karada olmasına göre)
        if (this.isGrounded) {
            this.vx *= Physics.friction;
        } else {
            this.vx *= Physics.airResistance;
        }

        // Pozisyonları Güncelle
        this.x += this.vx;
        this.y += this.vy;

        // Platform Çarpışma Kontrolleri
        this.isGrounded = false;
        for (let platform of Physics.platforms) {
            if (Physics.checkPlatformCollision(this, platform)) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.isGrounded = true;
            }
        }

        // Dünya Sınırlarını Uygula
        Physics.applyBounds(this);

        // Hız Sınırları (Çılgınca hızlanmaları önlemek için)
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;
    }

    // Hareket Fonksiyonları
    moveLeft() {
        this.vx -= this.speed;
        this.direction = -1;
    }

    moveRight() {
        this.vx += this.speed;
        this.direction = 1;
    }

    jump() {
        if (this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
        }
    }

    // Hasar Alma ve Supreme Duelist Tarzı Geri Savrulma (Knockback)
    takeDamage(amount, knockbackX, knockbackY) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Karakteri havaya ve geriye doğru fırlat
        this.vx += knockbackX;
        this.vy += knockbackY;
    }
}
