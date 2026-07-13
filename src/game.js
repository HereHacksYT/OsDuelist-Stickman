/* ==========================================================================
   OSDUELIST STICKMAN - MULTI-TOUCH VE ANA OYUN MOTORU (TAM SÜRÜM)
   ========================================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas sanal çözünürlüğü fizik dünyasıyla tam 16:9 HD senkronize
canvas.width = Physics.worldWidth;
canvas.height = Physics.worldHeight;

// Güncellenmiş Renk Havuzu
const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6", "#ffffff"];
const colorNames = ["Mavi", "Kırmızı", "Yeşil", "Sarı", "Mor", "Beyaz"];

// Güncellenmiş Yeni Şapka Havuzu (İsimleri İstediğin Gibi Düzenlendi)
const hats = ["Yok", "Kral Tacı", "Kovboy Şapkası", "Robot Kaskı", "Steve Kafası", "Muz"];

// Güncellenmiş Yeni Çılgın Silah Listesi (Hasar ve Menzil Dengeleri Yapıldı)
const weaponsList = [
    { name: "Kılıç", type: "melee", damage: 16, range: 65 },
    { name: "Lazer", type: "ranged", damage: 10, range: 350 },
    { name: "Balta", type: "melee", damage: 22, range: 60 },
    { name: "Balyoz", type: "melee", damage: 25, range: 65 },
    { name: "Bomba", type: "projectile", damage: 20, range: 400 },
    { name: "Muz Fırlatan Silah", type: "projectile", damage: 12, range: 450 },
    { name: "Mıknatıs", type: "pull", damage: 5, range: 180 }
];

// Oyuncu Seçim İndeksleri
let p1Config = { colorIdx: 0, hatIdx: 0, weaponIdx: 0 };
let p2Config = { colorIdx: 1, hatIdx: 0, weaponIdx: 1 };

let gameActive = false;
let gameMode = 1; // 1 = Bot, 2 = 2 Oyuncu Aynı Ekran

// Nesnelerin Tanımlanması
const player1 = new Player(180, 350, colors[p1Config.colorIdx], false);
let player2 = new Player(680, 350, colors[p2Config.colorIdx], true);

/* ==========================================================================
   MENÜ SEÇİM YÖNETİMİ
   ========================================================================== */
function changeColor(player, dir) {
    let cfg = player === 1 ? p1Config : p2Config;
    cfg.colorIdx = (cfg.colorIdx + dir + colors.length) % colors.length;
    let txt = document.getElementById(`p${player}-color-text`);
    txt.innerText = colorNames[cfg.colorIdx];
    txt.style.color = colors[cfg.colorIdx];
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
   MASAÜSTÜ KLAVYE DİNLEYİCİLERİ
   ========================================================================== */
const keys = {};
window.addEventListener("keydown", e => keys[e.code] = true);
window.addEventListener("keyup", e => keys[e.code] = false);

/* ==========================================================================
   GELİŞMİŞ MULTI-TOUCH (ÇOKLU DOKUNMATİK) SİSTEMİ
   ========================================================================== */
const mobileKeys = {}; // Mobilde aktif basılan tüm sanal tuşları tutar

function handleTouchUpdate(e) {
    e.preventDefault();
    
    // Her güncellemede önce tüm mobil giriş durumlarını sıfırla
    const buttons = document.querySelectorAll("#mobile-controls .btn");
    buttons.forEach(btn => {
        let code = btn.getAttribute("data-btn");
        mobileKeys[code] = false;
        btn.classList.remove("active-press");
    });

    // Ekrandaki tüm aktif parmak dokunuşlarını (Multi-touch) tara
    for (let i = 0; i < e.targetTouches.length; i++) {
        let touch = e.targetTouches[i];
        
        // Parmağın koordinatındaki HTML elementini bul
        let element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.closest(".btn")) {
            let actualBtn = element.closest(".btn");
            let code = actualBtn.getAttribute("data-btn");
            mobileKeys[code] = true;
            actualBtn.classList.add("active-press"); // Görsel basılma efekti ver
        }
    }
}

// Multi-touch dinleyicilerini tüm kontrol paneline bağlıyoruz
const controlZone = document.getElementById("mobile-controls");
controlZone.addEventListener("touchstart", handleTouchUpdate, { passive: false });
controlZone.addEventListener("touchmove", handleTouchUpdate, { passive: false });
controlZone.addEventListener("touchend", handleTouchUpdate, { passive: false });
controlZone.addEventListener("touchcancel", handleTouchUpdate, { passive: false });

/* ==========================================================================
   OYUN BAŞLATMA VE HUD AYARLARI
   ========================================================================== */
function startGame(mode) {
    gameMode = mode;
    gameActive = true;
    projectiles = []; // Eski mermileri temizle

    // Oyuncu 1 Kurulumu
    player1.color = colors[p1Config.colorIdx];
    player1.hat = hats[p1Config.hatIdx];
    let w1 = weaponsList[p1Config.weaponIdx];
    player1.weapon = new Weapon(w1.name, w1.type, w1.damage, w1.range);
    player1.health = 100; player1.x = 180; player1.y = 350; player1.vx = 0; player1.vy = 0;

    // Oyuncu 2 / Bot Kurulumu
    player2 = new Player(680, 350, colors[p2Config.colorIdx], gameMode === 1);
    player2.hat = hats[p2Config.hatIdx];
    let w2 = weaponsList[p2Config.weaponIdx];
    player2.weapon = new Weapon(w2.name, w2.type, w2.damage, w2.range);
    player2.health = 100; player2.vx = 0; player2.vy = 0;

    document.getElementById("p1-name-display").innerText = "Oyuncu 1";
    document.getElementById("p2-name-display").innerText = gameMode === 1 ? "Bot (AI)" : "Oyuncu 2";

    // Ekran Gizleme / Gösterme Aşamaları
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("ui-container").classList.remove("hidden");
    document.getElementById("mobile-controls").classList.remove("hidden");

    if (gameMode === 1) {
        document.getElementById("p2-ctrl").style.visibility = "hidden";
    } else {
        document.getElementById("p2-ctrl").style.visibility = "visible";
    }

    gameLoop();
}

function updateUI() {
    document.getElementById("p1-health").style.width = player1.health + "%";
    document.getElementById("p2-health").style.width = player2.health + "%";
}

/* ==========================================================================
   BOT YAPAY ZEKASI (AI MOTORU)
   ========================================================================== */
function handleBotAI() {
    if (player2.health <= 0) return;

    let distX = (player1.x + player1.width/2) - (player2.x + player2.width/2);
    let distY = player1.y - player2.y;

    // Yatay Takip
    if (Math.abs(distX) > 40) {
        if (distX > 0) player2.moveRight(); else player2.moveLeft();
    }

    // Akıllı Zıplama Tetikçisi
    if (distY < -60 && Math.random() < 0.05) {
        player2.jump();
    }

    // Silah Kullanım Kuralları
    if (Math.abs(distX) < player2.weapon.range && Math.abs(distY) < 80) {
        player2.direction = distX > 0 ? 1 : -1;
        player2.weapon.use(player2, player1);
    }
}

/* ==========================================================================
   ANA OYUN DÖNGÜSÜ (GAME LOOP)
   ========================================================================== */
function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Harita Platformlarını Çiz
    ctx.fillStyle = "#2c3e50";
    for (let platform of Physics.platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        ctx.fillStyle = "#34495e";
        ctx.fillRect(platform.x, platform.y, platform.width, 3); // Parlama şeridi
        ctx.fillStyle = "#2c3e50";
    }

    // 2. Oyuncu 1 Kontrollerini Oku
    if (player1.health > 0) {
        if (keys["KeyA"] || mobileKeys["KeyA"]) player1.moveLeft();
        if (keys["KeyD"] || mobileKeys["KeyD"]) player1.moveRight();
        if (keys["KeyW"] || mobileKeys["KeyW"]) player1.jump();
        if (keys["Space"] || mobileKeys["Space"]) player1.weapon.use(player1, player2);
    }

    // 3. Oyuncu 2 Veya Bot Kontrollerini Oku
    if (gameMode === 2 && player2.health > 0) {
        if (keys["ArrowLeft"] || mobileKeys["ArrowLeft"]) player2.moveLeft();
        if (keys["ArrowRight"] || mobileKeys["ArrowRight"]) player2.moveRight();
        if (keys["ArrowUp"] || mobileKeys["ArrowUp"]) player2.jump();
        if (keys["KeyL"] || mobileKeys["KeyL"]) player2.weapon.use(player2, player1);
    } else if (gameMode === 1) {
        handleBotAI();
    }

    // 4. Karakter ve Silah Güncellemeleri
    player1.update();
    player2.update();
    if (player1.weapon) player1.weapon.update();
    if (player2.weapon) player2.weapon.update();

    // 5. Aktif Mermilerin (Bomba, Muz) Fiziğini İşleme ve Çizme
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let proj = projectiles[i];
        
        // Merminin kime hasar vereceğini sahibine göre belirle
        let currentTarget = (player1.weapon && player1.weapon.name === "Bomba" || player1.weapon && player1.weapon.name === "Muz Fırlatan Silah") && proj.vx * (player1.direction) > 0 ? player2 : player1;
        
        // Eğer iki mermi de sahnedeyse daha güvenli hedef doğrulaması yapalım
        if (player1.health > 0 && player2.health > 0) {
            // Mermi, fırlatanın tersine doğru kime yakınsa ona çarpar mantığıyla güncellenir
            proj.update(proj.vx > 0 ? player2 : player1);
        } else {
            proj.update(player2);
        }

        if (!proj.active) {
            projectiles.splice(i, 1); // Pasif olan mermiyi diziden at
        } else {
            proj.draw(ctx);
        }
    }

    // 6. Karakter Çizimleri
    if (player1.health > 0) player1.draw(ctx);
    if (player2.health > 0) player2.draw(ctx);

    // 7. Arayüz Can Güncellemesi
    updateUI();

    // 8. Ölüm ve Boşluğa Düşme Limitleri
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
        
        setTimeout(() => {
            gameActive = false;
            document.getElementById("main-menu").classList.remove("hidden");
            document.getElementById("ui-container").classList.add("hidden");
            document.getElementById("mobile-controls").classList.add("hidden");
        }, 3500);
        return;
    }

    requestAnimationFrame(gameLoop);
}
