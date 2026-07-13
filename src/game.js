/* ==========================================================================
   OSDUELIST STICKMAN - MULTI-TOUCH VE HARİTA MOTORU (TAM SÜRÜM)
   ========================================================================== */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas sanal çözünürlüğü fizik dünyasıyla tam 16:9 HD senkronize
canvas.width = Physics.worldWidth;
canvas.height = Physics.worldHeight;

// Renk Havuzu
const colors = ["#3498db", "#e74c3c", "#2ecc71", "#f1c40f", "#9b59b6", "#ffffff"];
const colorNames = ["Mavi", "Kırmızı", "Yeşil", "Sarı", "Mor", "Beyaz"];

// Şapka Havuzu
const hats = ["Yok", "Kral Tacı", "Kovboy Şapkası", "Robot Kaskı", "Steve Kafası", "Muz"];

// Silah Listesi (Bomba Hasarı 35 yapıldı -> 3 İsabet = 105 Hasar ile Ölüm)
const weaponsList = [
    { name: "Kılıç", type: "melee", damage: 16, range: 65 },
    { name: "Lazer", type: "ranged", damage: 10, range: 350 },
    { name: "Balta", type: "melee", damage: 22, range: 60 },
    { name: "Balyoz", type: "melee", damage: 25, range: 65 },
    { name: "Bomba", type: "projectile", damage: 35, range: 400 },
    { name: "Muz Fırlatan Silah", type: "projectile", damage: 12, range: 450 },
    { name: "Mıknatıs", type: "pull", damage: 5, range: 180 }
];

// Harita Listesi
const mapsList = ["Yüksek Arena", "Kapalı Arena"];
let mapIdx = 0;

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

// Yeni Harita Değiştirme Fonksiyonu
function changeMap(dir) {
    mapIdx = (mapIdx + dir + mapsList.length) % mapsList.length;
    document.getElementById("map-name-text").innerText = mapsList[mapIdx];
    Physics.currentMap = mapsList[mapIdx]; // Fizik motoruna haritayı bildir
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
const mobileKeys = {};

function handleTouchUpdate(e) {
    e.preventDefault();
    
    const buttons = document.querySelectorAll("#mobile-controls .btn");
    buttons.forEach(btn => {
        let code = btn.getAttribute("data-btn");
        mobileKeys[code] = false;
        btn.classList.remove("active-press");
    });

    for (let i = 0; i < e.targetTouches.length; i++) {
        let touch = e.targetTouches[i];
        let element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.closest(".btn")) {
            let actualBtn = element.closest(".btn");
            let code = actualBtn.getAttribute("data-btn");
            mobileKeys[code] = true;
            actualBtn.classList.add("active-press");
        }
    }
}

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
    projectiles = []; 

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

    if (Math.abs(distX) > 40) {
        if (distX > 0) player2.moveRight(); else player2.moveLeft();
    }

    if (distY < -60 && Math.random() < 0.05) {
        player2.jump();
    }

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
        ctx.fillRect(platform.x, platform.y, platform.width, 3); 
        ctx.fillStyle = "#2c3e50";
    }

    // "Kapalı Arena" haritasındaysak alt zemine görsel bir barikat çizelim
    if (Physics.currentMap === "Kapalı Arena") {
        ctx.fillStyle = "#111a24";
        ctx.fillRect(0, 530, 900, 20);
        ctx.fillStyle = "#e74c3c"; // Güvenli bölge alt kırmızı sınırı
        ctx.fillRect(0, 530, 900, 3);
    }

    // 2. Oyuncu 1 Kontrolleri
    if (player1.health > 0) {
        if (keys["KeyA"] || mobileKeys["KeyA"]) player1.moveLeft();
        if (keys["KeyD"] || mobileKeys["KeyD"]) player1.moveRight();
        if (keys["KeyW"] || mobileKeys["KeyW"]) player1.jump();
        if (keys["Space"] || mobileKeys["Space"]) player1.weapon.use(player1, player2);
    }

    // 3. Oyuncu 2 Veya Bot Kontrolleri
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

    // 5. Aktif Mermilerin (Bomba ve Muz) Fiziğini İşleme ve Çizme
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let proj = projectiles[i];
        
        // Bombaların her iki oyuncuyu da etkileyebilmesi için nesneleri parametre olarak geçiyoruz
        proj.update(player1, player2);

        if (!proj.active) {
            // Patlama anı çizim efektini tetiklemek için önce çizdirip sonra siliyoruz
            proj.draw(ctx); 
            projectiles.splice(i, 1); 
        } else {
            proj.draw(ctx);
        }
    }

    // 6. Karakter Çizimleri
    if (player1.health > 0) player1.draw(ctx);
    if (player2.health > 0) player2.draw(ctx);

    // 7. Arayüz Can Güncellemesi
    updateUI();

    // 8. Ölüm ve Boşluğa Düşme Limitleri (Sadece Yüksek Arena'da boşluktan düşme aktiftir)
    if (Physics.currentMap === "Yüksek Arena") {
        if (player1.y > 530) player1.health = 0;
        if (player2.y > 530) player2.health = 0;
    }

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
