/* ==========================================================================
   OSDUELIST STICKMAN - KARAKTER (PLAYER) MOTORU (TAM SÜRÜM)
   ========================================================================== */

class Player {
    constructor(x, y, color, isBot = false) {
        // Pozisyon ve Hız Vektörleri
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        // Karakter Boyutları (Hitbox)
        this.width = 30;
        this.height = 60;
        
        // Tasarım ve Kimlik Bilgileri
        this.color = color;
        this.isBot = isBot;
        this.hat = "Yok";     // Seçilen şapka kozmetiği
        this.weapon = null;    // Kuşanılan silah nesnesi
        
        // Oyun Durum Değişkenleri
        this.health = 100;
        this.isGrounded = false;
        this.direction = isBot ? -1 : 1; // 1 = Sağ, -1 = Sol
        
        // Hareket ve Güç Sabitleri
        this.speed = 0.85;
        this.maxSpeed = 6.5;
        this.jumpForce = 13.5;
    }

    /**
     * Çöp Adamı ve Üzerindeki Kozmetikleri Canvas'a Çizme Fonksiyonu
     */
    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        let headX = this.x + this.width / 2;
        let headY = this.y - 15;

        // 1. ŞAPKA KOZMETİKLERİNİ ÇİZ (Kafanın Üstüne Oturtulur)
        if (this.hat === "Kral") {
            ctx.fillStyle = "#f1c40f";
            ctx.strokeStyle = "#d35400";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headX - 14, headY - 8);
            ctx.lineTo(headX - 12, headY - 24); // Sol kule
            ctx.lineTo(headX - 5, headY - 16);
            ctx.lineTo(headX, headY - 28);      // Orta kule
            ctx.lineTo(headX + 5, headY - 16);
            ctx.lineTo(headX + 12, headY - 24); // Sağ kule
            ctx.lineTo(headX + 14, headY - 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.lineWidth = 4; // Çizgi kalınlığını çöp adama geri eşitle
        } 
        else if (this.hat === "Kovboy") {
            ctx.fillStyle = "#a0522d";
            // Şapkanın geniş alt siperliği
            ctx.beginPath();
            ctx.ellipse(headX, headY - 10, 20, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // Şapkanın üst gövdesi
            ctx.fillRect(headX - 10, headY - 22, 20, 12);
        } 
        else if (this.hat === "Silindir") {
            ctx.fillStyle = "#111111";
            // Alt düz siperlik
            ctx.fillRect(headX - 16, headY - 11, 32, 4);
            // Uzun dik şapka gövdesi
            ctx.fillRect(headX - 11, headY - 29, 22, 18);
            // Şapkanın kırmızı şeridi
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(headX - 11, headY - 14, 22, 3);
        }

        // 2. KAFA ÇİZİMİ
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.stroke();

        // 3. GÖVDE (OMURGA)
        ctx.beginPath();
        ctx.moveTo(headX, this.y);
        ctx.lineTo(headX, this.y + this.height * 0.6);
        ctx.stroke();

        // 4. BACAKLAR (Dinamik Duruş)
        let hipY = this.y + this.height * 0.6;
        ctx. someLines = true;
        ctx.beginPath();
        // Sol Bacak
        ctx.moveTo(headX, hipY);
        ctx.lineTo(this.x, this.y + this.height);
        // Sağ Bacak
        ctx.moveTo(headX, hipY);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.stroke();

        // 5. KOLLAR VE SİLAH TUTUŞU
        ctx.beginPath();
        ctx.moveTo(headX, this.y + 12);
        // El, karakterin baktığı yöne doğru uzanır
        let handX = headX + (22 * this.direction);
        let handY = this.y + 22;
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Eğer bir silah kuşanılmışsa el koordinatlarında silahı çiz
        if (this.weapon) {
            this.weapon.draw(ctx, handX, handY, this.direction);
        }
    }

    /**
     * Karakterin Hızlanma, Yavaşlama ve Çarpışma Hesaplamaları
     */
    update() {
        // Yer çekimi kuvvetini dikey hıza ekle
        this.vy += Physics.gravity;

        // Sürtünme Uygulama
        if (this.isGrounded) {
            this.vx *= Physics.friction; // Karada hızlı yavaşlama
        } else {
            this.vx *= Physics.airResistance; // Havada hafif süzülme
        }

        // Pozisyonları hız vektörlerine göre ilerlet
        this.x += this.vx;
        this.y += this.vy;

        // Hız Sınırlarını Uygula (Çılgın hız patlamalarını kontrol altına alır)
        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

        // Platform Çarpışma Testi
        this.isGrounded = false;
        for (let platform of Physics.platforms) {
            if (Physics.checkPlatformCollision(this, platform)) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.isGrounded = true;
            }
        }

        // Ekran Kenar Duvar Kontrolleri
        Physics.applyBounds(this);
    }

    // Sol Hareketi
    moveLeft() {
        this.vx -= this.speed;
        this.direction = -1;
    }

    // Sağ Hareketi
    moveRight() {
        this.vx += this.speed;
        this.direction = 1;
    }

    // Zıplama Komutu
    jump() {
        if (this.isGrounded) {
            this.vy = -this.jumpForce;
            this.isGrounded = false;
        }
    }

    /**
     * Hasar Alma ve Supreme Duelist Tarzı Geri Fırlatma (Knockback) Motoru
     */
    takeDamage(amount, knockbackX, knockbackY) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        // Karakteri vuruş yönüne göre havaya ve geriye fırlat
        this.vx += knockbackX;
        this.vy += knockbackY;
        this.isGrounded = false;
    }
}
