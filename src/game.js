/* ==========================================================================
   OSDUELIST STICKMAN - ANA OYUN MOTORU (TAM SÜRÜM)
   ========================================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas çözünürlüğünü fizik dünyasına göre sabitleyelim
canvas.width = Physics.worldWidth;
canvas.height = Physics.worldHeight;

// Menü Seçenek Havuzları (Eksiksiz Kombinasyonlar)
const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6", "#ffffff"];
const colorNames = ["Mavi", "Kırmızı", "Yeşil", "Sarı", "Mor", "Beyaz"];
const hats = ["Yok", "Kral", "Kovboy", "Silindir"];
const weaponsList = [
    { name: "Kılıç", type: "melee", damage: 16, range: 65 },
    { name: "Lazer", type: "ranged", damage: 10, range: 350 }
];

// Oyuncu Seçim İndeks Takipçileri
let p1Config = { colorIdx: 0, hatIdx: 0, weaponIdx: 0 };
let p2Config = { colorIdx: 1, hatIdx: 0, weaponIdx: 1 };

let gameActive = false;
let gameMode = 1; // 1 = Bot'a Karşı, 2 = İki Kişilik Aynı Ekran

// Oyuncu Nesnelerini Başlatma
const player1 = new Player(180, 350, colors[p1Config.colorIdx], false);
let player2 = new Player(680, 350, colors[p2Config.colorIdx], true);

/* ==========================================================================
   KOZMETİK VE SEÇİM MENÜSÜ FONKSİYONLARI (KIRPILMAMIŞ)
   ========================================================================== */

function changeColor(player, dir) {
    let cfg = player === 1 ? p1Config : p2Config;
    cfg.colorIdx = (cfg.colorIdx + dir + colors.length) % colors.length;
    
    let textElement = document.getElementById(`p${player}-color-text`);
    textElement.innerText = colorNames[cfg.colorIdx];
    textElement.style.color = colors[cfg.colorIdx];
}

function changeHat(player, dir) {
    let cfg = player === 1 ? p1Config : p2Config;
    cfg.hatIdx = (cfg.hatIdx + dir + hats.length) % hats.length;
    document.getElementById(`p${player}-hat-text`).innerText = hats[cfg.hatIdx];
}

function changeWeapon(player, dir) {
    let cfg = player === 1 ? p1Config : p2Config;
    cfg.weaponIdx = (cfg.weaponIdx + dir + weaponsList.length) % weaponsList.length;
    document.getElementById(`p${player}-weapon-text`).innerText = weaponsList[cfg.weaponIdx].name;
}

/* ==========================================================================
   OYUN BAŞLATMA VE GİRİŞ SİSTEMLERİ
   ========================================================================== */

function startGame(mode) {
    gameMode = mode;
    gameActive = true;

    // 1. Oyuncu Ayarlarını Giydir
    player1.color = colors[p1Config.colorIdx];
    player1.hat = hats[p1Config.hatIdx];
    let w1 = weaponsList[p1Config.weaponIdx];
    player1.weapon = new Weapon(w1.name, w1.type, w1.damage, w1.range);
    player1.health = 100;
    player1.x = 180; player1.y = 350; player1.vx = 0; player1.vy = 0;

    // 2. Oyuncu / Bot Ayarlarını Giydir
    player2 = new Player(680, 350, colors[p2Config.colorIdx], gameMode === 1);
    player2.hat = hats[p2Config.hatIdx];
    let w2 = weaponsList[p2Config.weaponIdx];
    player2.weapon = new Weapon(w2.name, w2.type, w2.damage, w2.range);
    player2.health = 100;
    player2.vx = 0; player2.vy = 0;

    // İsim Göstergelerini Güncelle
    document.getElementById("p1-name-display").innerText = "Oyuncu 1";
    document.getElementById("p2-name-display").innerText = gameMode === 1 ? "Bot (AI)" : "Oyuncu 2";

    // Menüyü Gizle, Arayüzü ve Dokunmatik Butonları Aç
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("ui-container").classList.remove("hidden");
    document.getElementById("mobile-controls").classList.remove("hidden");

    // Tek kişilik modda Oyuncu 2'nin dokunmatik butonlarını gizle
    if (gameMode === 1) {
        document.getElementById("p2-ctrl").style.visibility = "hidden";
    } else {
        document.getElementById("p2-ctrl").style.visibility = "visible";
    }

    // Ana oyun döngüsünü ateşle
    gameLoop();
}

// Klavye Dinleyicileri (Masaüstü İçin)
const keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

// Mobil Dokunmatik Tuş Entegrasyonu (Gelişmiş Gecikmesiz Sistem)
const mobileKeys = {};
function bindMobileBtn(id, actionCode) {
    const btn = document.getElementById(id);
    if (!btn) return;
    
    btn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        mobileKeys[actionCode] = true;
    });
    
    btn.addEventListener("touchend", (e) => {
        e.preventDefault();
        mobileKeys[actionCode] = false;
    });
}

// Butonları eşleştirme
bindMobileBtn("btn-p1-left", "KeyA");
bindMobileBtn("btn-p1-right", "KeyD");
bindMobileBtn("btn-p1-up", "KeyW");
bindMobileBtn("btn-p1-atk", "Space");

bindMobileBtn("btn-btn-p2-left", "ArrowLeft"); // HTML id'sine göre senkron
bindMobileBtn("btn-p2-left", "ArrowLeft");
bindMobileBtn("btn-p2-right", "ArrowRight");
bindMobileBtn("btn-p2-up", "ArrowUp");
bindMobileBtn("btn-p2-atk", "KeyL");

function updateUI() {
    document.getElementById("p1-health").style.width = player1.health + "%";
    document.getElementById("p2-health").style.width = player2.health + "%";
}

/* ==========================================================================
   BOT YAPAY ZEKASI (AI MOTORU)
   ========================================================================== */
function handleBotAI() {
    if (player2.health <= 0) return;

    let targetX = player1.x;
    let targetY = player1.y;
    let distX = targetX - player2.x;
    let distY = targetY - player2.y;

    // Yatayda Oyuncuyu Takip Etme
    if (Math.abs(distX) > 35) {
        if (distX > 0) player2.moveRight(); else player2.moveLeft();
    }

    // Oyuncu yukarı zıpladıysa akıllı zıplama tetiklemesi
    if (distY < -60 && Math.random() < 0.06) {
        player2.jump();
    }

    // Silah Menziline girerse acımasızca saldır
    if (Math.abs(distX) < player2.weapon.range && Math.abs(distY) < 70) {
        player2.direction = distX > 0 ? 1 : -1;
        player2.weapon.use(player2, player1);
    }
}

/* ==========================================================================
   ANA DÖNGÜ (60 FPS GAME LOOP)
   ========================================================================== */
function gameLoop() {
    if (!gameActive) return;

    // Ekranı temizle
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Platformları Çiz
    ctx.fillStyle = "#2c3e50";
    for (let platform of Physics.platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platformların üzerine hafif neon hat çizelim (Görsel kalite için)
        ctx.fillStyle = "#34495e";
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
        ctx.fillStyle = "#2c3e50";
    }

    // 2. Oyuncu 1 Girişlerini İşle (Klavye veya Mobil Dokunmatik)
    if (player1.health > 0) {
        if (keys["KeyA"] || mobileKeys["KeyA"]) player1.moveLeft();
        if (keys["KeyD"] || mobileKeys["KeyD"]) player1.moveRight();
        if (keys["KeyW"] || mobileKeys["KeyW"]) player1.jump();
        if (keys["Space"] || mobileKeys["Space"]) player1.weapon.use(player1, player2);
    }

    // 3. Oyuncu 2 / Bot Girişlerini İşle
    if (gameMode === 2 && player2.health > 0) {
        if (keys["ArrowLeft"] || mobileKeys["ArrowLeft"]) player2.moveLeft();
        if (keys["ArrowRight"] || mobileKeys["ArrowRight"]) player2.moveRight();
        if (keys["ArrowUp"] || mobileKeys["ArrowUp"]) player2.jump();
        if (keys["KeyL"] || mobileKeys["KeyL"]) player2.weapon.use(player2, player1);
    } else if (gameMode === 1) {
        handleBotAI();
    }

    // 4. Fizikleri ve Silah Zamanlayıcılarını İlerlet
    player1.update();
    player2.update();
    if (player1.weapon) player1.weapon.update();
    if (player2.weapon) player2.weapon.update();

    // 5. Karakterleri Ekrana Çiz
    if (player1.health > 0) player1.draw(ctx);
    if (player2.health > 0) player2.draw(ctx);

    // 6. Can Barlarını Güncelle
    updateUI();

    // 7. Ölüm ve Kazanma Durumu Kontrolü (Aşağı Düşme Dahil)
    // Eğer karakter haritanın altına düştüyse elenir (Ölüm çizgisi y=540)
    if (player1.y > 530) player1.health = 0;
    if (player2.y > 530) player2.health = 0;

    if (player1.health <= 0 || player2.health <= 0) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 6;

        let winMsg = player1.health <= 0 ? (gameMode === 1 ? "BOT KAZANDI!" : "OYUNCU 2 KAZANDI!") : "OYUNCU 1 KAZANDI!";
        
        ctx.strokeText(winMsg, canvas.width / 2, canvas.height / 2);
        ctx.fillText(winMsg, canvas.width / 2, canvas.height / 2);
        
        // 3.5 saniye sonra oyunu tamamen sıfırlayıp ana menüye döner
        setTimeout(() => {
            gameActive = false;
            document.getElementById("main-menu").classList.remove("hidden");
            document.getElementById("ui-container").classList.add("hidden");
            document.getElementById("mobile-controls").classList.add("hidden");
        }, 3500);
        return; // Döngüyü kırar
    }

    // Sonraki kareyi çağır
    requestAnimationFrame(gameLoop);
}
