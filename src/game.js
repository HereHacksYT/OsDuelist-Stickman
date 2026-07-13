const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas boyutlarını fizik motorundaki boyutlara eşitleyelim
canvas.width = Physics.worldWidth;
canvas.height = Physics.worldHeight;

// 1. Oyuncuları Oluştur (X, Y, Renk, Bot mu?)
const player1 = new Player(150, 300, "#3498db", false); // Mavi Oyuncu
const player2 = new Player(700, 300, "#e74c3c", true);  // Kırmızı Bot (AI)

// 2. Silahları Tanımla ve Oyunculara Ver
const kilic = new Weapon("Kılıç", "melee", 15, 60);
const lazer = new Weapon("Lazer Silahı", "ranged", 10, 300);

player1.weapon = kilic;
player2.weapon = lazer; // Bot uzaktan lazerle vursun

// Klavye Girişlerini Dinleme Paneli
const keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

// UI (Can Barları) Güncelleme Fonksiyonu
function updateUI() {
    const p1Bar = document.getElementById("p1-health");
    const p2Bar = document.getElementById("p2-health");
    
    p1Bar.style.width = player1.health + "%";
    p2Bar.style.width = player2.health + "%";
}

// Basit Bot Yapay Zekası (AI)
function handleBotAI() {
    if (player2.health <= 0) return;

    // Oyuncu 1 ile arasındaki mesafe
    let distanceX = player1.x - player2.x;
    let distanceY = player1.y - player2.y;

    // 1. Yatayda Takip Etme
    if (Math.abs(distanceX) > 40) {
        if (distanceX > 0) {
            player2.moveRight();
        } else {
            player2.moveLeft();
        }
    }

    // 2. Eğer Oyuncu Yukarıdaysa Rastgele Zıplama Eğilimi
    if (distanceY < -50 && Math.random() < 0.05) {
        player2.jump();
    }

    // 3. Saldırı Menziline Girince Ateş Etme/Vurma
    if (Math.abs(distanceX) < player2.weapon.range && Math.abs(distanceY) < 60) {
        // Botun yönünü oyuncuya doğru çevir
        player2.direction = distanceX > 0 ? 1 : -1;
        player2.weapon.use(player2, player1);
    }
}

// ANA OYUN DÖNGÜSÜ (Saniyede 60 kez çalışır)
function gameLoop() {
    // Ekranı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Arka Plan Statik Platformları Çiz
    ctx.fillStyle = "#34495e";
    for (let platform of Physics.platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // 2. Oyuncu 1 (Kullanıcı) Kontrollerini İşle
    if (player1.health > 0) {
        if (keys["KeyA"]) player1.moveLeft();
        if (keys["KeyD"]) player1.moveRight();
        if (keys["KeyW"]) player1.jump();
        if (keys["Space"]) player1.weapon.use(player1, player2); // Space ile saldırı
    }

    // 3. Bot Yapay Zekasını Çalıştır
    handleBotAI();

    // 4. Karakter ve Silah Fiziklerini Güncelle
    player1.update();
    player2.update();
    if(player1.weapon) player1.weapon.update();
    if(player2.weapon) player2.weapon.update();

    // 5. Çizimleri Yap
    if (player1.health > 0) player1.draw(ctx);
    if (player2.health > 0) player2.draw(ctx);

    // 6. Arayüzü Güncelle
    updateUI();

    // Oyun Bitti Kontrolü
    if (player1.health <= 0 || player2.health <= 0) {
        ctx.fillStyle = "#fff";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        
        let KasaMesaji = player1.health <= 0 ? "BOT KAZANDI!" : "OYUNCU 1 KAZANDI!";
        ctx.fillText(KasaMesaji, canvas.width / 2, canvas.height / 2);
        return; // Döngüyü durdur
    }

    // Sonraki kareyi çağır
    requestAnimationFrame(gameLoop);
}

// Oyunu Resmen Başlat
gameLoop();
