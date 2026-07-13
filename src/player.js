/* ==========================================================================
   OSDUELIST STICKMAN - KARAKTER MOTORU VE KOZMETİKLER (TAM SÜRÜM)
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
     * Çöp Adamı ve Üzerindeki Yeni Kozmetikleri Çizen Ana Fonksiyon
     */
    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        let headX = this.x + this.width / 2;
        let headY = this.y - 15;

        // 1. KOZMETİKLER (SÜSTÜR, OYUNA ETKİ ETMEZ)
        if (this.hat === "Kral Tacı") {
            ctx.fillStyle = "#f1c40f"; // Altın sarısı
            ctx.strokeStyle = "#f39c12";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headX - 14, headY - 8);
            ctx.lineTo(headX - 13, headY - 24); // Sol kule
            ctx.lineTo(headX - 6, headY - 16);
            ctx.lineTo(headX, headY - 28);      // Orta kule (En yüksek)
            ctx.lineTo(headX + 6, headY - 16);
            ctx.lineTo(headX + 13, headY - 24); // Sağ kule
            ctx.lineTo(headX + 14, headY - 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.lineWidth = 4; // Çizgiyi çöp adam kalınına geri döndür
            
            // Tacın üstündeki minik elmas detayları
            ctx.fillStyle = "#e74c3c";
            ctx.fillRect(headX - 1, headY - 31, 3, 3);
        } 
        else if (this.hat === "Kovboy Şapkası") {
            ctx.fillStyle = "#795548"; // Kahverengi tonu
            // Şapkanın eğimli alt siperliği
            ctx.beginPath();
            ctx.ellipse(headX, headY - 10, 22, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            // Şapkanın üst kıvrımlı gövdesi
            ctx.fillRect(headX - 11, headY - 24, 22, 14);
            // Siyah şapka bandı
            ctx.fillStyle = "#212121";
            ctx.fillRect(headX - 11, headY - 13, 22, 3);
        } 
        else if (this.hat === "Robot Kaskı") {
            ctx.fillStyle = "#90a4ae"; // Metalik gri
            ctx.strokeStyle = "#37474f";
            ctx.lineWidth = 2;
            // Kaskın ana kare kutusu kafayı kaplar
            ctx.fillRect(headX - 14, headY - 14, 28, 28);
            ctx.strokeRect(headX - 14, headY - 14, 28, 28);
            
            // Robotun parlayan göz siperliği
            ctx.fillStyle = "#00e5ff"; // Neon mavi göz
            ctx.fillRect(headX - 10, headY - 6, 20, 5);
            
            // Tepe anteni
            ctx.strokeStyle = "#37474f";
            ctx.beginPath();
            ctx.moveTo(headX, headY - 14);
            ctx.lineTo(headX, headY - 22);
            ctx.stroke();
            ctx.fillStyle = "#e74c3c"; // Anten ucu kırmızı ışık
            ctx.beginPath();
            ctx.arc(headX, headY - 23, 3, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.lineWidth = 4;
        }
        else if (this.hat === "Steve Kafası") {
            // Minecraft Steve pikselli kare kafası
            ctx.fillStyle = "#a1887f"; // Ten rengi taban
            ctx.fillRect(headX - 15, headY - 15, 30, 30);
            
            // Saçlar
            ctx.fillStyle = "#4e342e"; // Kahverengi saç
            ctx.fillRect(headX - 15, headY - 15, 30, 8); // Üst saç
            ctx.fillRect(headX - 15, headY - 7, 6, 8);   // Sol favori
            ctx.fillRect(headX + 9, headY - 7, 6, 8);    // Sağ favori
            
            // Gözler (Minecraft piksel tarzı)
            ctx.fillStyle = "#ffffff"; // Beyazlar
            ctx.fillRect(headX - 10, headY + 1, 5, 4);
            ctx.fillRect(headX + 5, headY + 1, 5, 4);
            ctx.fillStyle = "#0288d1"; // Mavi göz bebekleri
            ctx.fillRect(headX - 8, headY + 1, 3, 4);
            ctx.fillRect(headX + 5, headY + 1, 3, 4);
            
            // Sakal/Ağız
            ctx.fillStyle = "#4e342e";
            ctx.fillRect(headX - 4, headY + 7, 8, 4);
        }
        else if (this.hat === "Muz") {
            ctx.fillStyle = "#ffeb3b"; // Canlı Muz Sarısı
            ctx.strokeStyle = "#fbc02d";
            ctx.lineWidth = 2;
            
            // Kafayı tamamen kaplayan muz eğrisi
            ctx.beginPath();
            ctx.arc(headX, headY + 3, 15, Math.PI, 0, false); // Alt yuvarlama
            ctx.lineTo(headX + 4, headY - 32);               // Muzun üst sivri ucu
            ctx.quadraticCurveTo(headX - 15, headY - 10, headX - 15, headY + 3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // Muzun kahverengi sap ucu
            ctx.fillStyle = "#5d4037";
            ctx.fillRect(headX + 1, headY - 35, 3, 4);
            
            ctx.lineWidth = 4;
        }

        // 2. NORMAL KAFA ÇİZİMİ (Kozmetik yoksa veya kaskların altında merkez belirlemek için)
        // Eğer Steve veya Robot tam kaplıyorsa iç kafa çizgisini hafifletiyoruz
        if (this.hat !== "Steve Kafası" && this.hat !== "Robot Kaskı") {
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.arc(headX, headY, 12, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 3. GÖVDE (OMURGA)
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(headX, this.y);
        ctx.lineTo(headX, this.y + this.height * 0.6);
        ctx.stroke();

        // 4. BACAKLAR
        let hipY = this.y + this.height * 0.6;
        ctx.beginPath();
        ctx.moveTo(headX, hipY);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.moveTo(headX, hipY);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.stroke();

        // 5. KOLLAR VE SİLAH TUTUŞU
        ctx.beginPath();
        ctx.moveTo(headX, this.y + 12);
        let handX = headX + (22 * this.direction);
        let handY = this.y + 22;
        ctx.lineTo(handX, handY);
        ctx.stroke();

        // Silahı çizdir
        if (this.weapon) {
            this.weapon.draw(ctx, handX, handY, this.direction);
        }
    }

    /**
     * Hız, Sürtünme ve Platform Çarpışma Güncellemeleri
     */
    update() {
        this.vy += Physics.gravity;

        if (this.isGrounded) {
            this.vx *= Physics.friction;
        } else {
            this.vx *= Physics.airResistance;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.vx > this.maxSpeed) this.vx = this.maxSpeed;
        if (this.vx < -this.maxSpeed) this.vx = -this.maxSpeed;

        this.isGrounded = false;
        for (let platform of Physics.platforms) {
            if (Physics.checkPlatformCollision(this, platform)) {
                this.y = platform.y - this.height;
                this.vy = 0;
                this.isGrounded = true;
            }
        }

        Physics.applyBounds(this);
    }

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

    takeDamage(amount, knockbackX, knockbackY) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
        
        this.vx += knockbackX;
        this.vy += knockbackY;
        this.isGrounded = false;
    }
}
