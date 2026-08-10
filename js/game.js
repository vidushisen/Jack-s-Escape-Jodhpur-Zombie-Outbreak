/**
 * Main Game Controller & State Machine for Jack's Escape: Jodhpur Zombie Outbreak
 * Features Full Mobile Touch D-Pad Movement & Phone Responsive Layout
 */

const STATE = {
  TITLE: 'TITLE',
  DRIVING: 'DRIVING',
  WALKING: 'WALKING',
  AMBUSH: 'AMBUSH',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.engine = new GraphicsEngine(this.canvas);
    this.miniMapCanvas = document.getElementById('miniMapCanvas');
    this.miniMapCtx = this.miniMapCanvas ? this.miniMapCanvas.getContext('2d') : null;
    this.state = STATE.TITLE;

    // Input States
    this.keys = {};
    this.mouse = { x: 0, y: 0, isDown: false };
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // Game Objects
    this.player = new Player(100, 280);
    this.car = new Car(-150, 280);
    this.zombies = [];
    this.bullets = [];
    this.particles = [];
    this.pickups = [];

    // Wave System (Max 8 Waves)
    this.currentWave = 1;
    this.maxWaves = 8;
    this.zombiesInWave = 5;
    this.zombiesSpawnedInWave = 0;
    this.zombiesKilledInWave = 0;
    this.isWaveResting = false;
    this.restEndTime = 0;

    // Game Metrics (5000m Goal)
    this.kills = 0;
    this.distance = 0;
    this.targetDistance = 5000;
    this.dialogueQueue = [];
    this.currentDialogue = null;
    this.spawnTimer = 0;
    this.canExitCar = false;
    this.exitCarTime = 0;
    this.ambushTriggered = false;

    // DOM Elements
    this.hud = document.getElementById('hud');
    this.rightHud = document.getElementById('rightHud');
    this.killsHud = document.getElementById('killsHud');
    this.waveHud = document.getElementById('waveHud');
    this.waveBanner = document.getElementById('waveBanner');
    this.ammoAlert = document.getElementById('ammoAlert');
    this.ammoAlertText = document.getElementById('ammoAlertText');
    this.miniMapCard = document.getElementById('miniMapCard');
    this.exitCarPrompt = document.getElementById('exitCarPrompt');
    this.dialogueContainer = document.getElementById('dialogueContainer');
    this.dialogueText = document.getElementById('dialogueText');
    this.titleScreen = document.getElementById('titleScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.victoryScreen = document.getElementById('victoryScreen');
    this.soundBtn = document.getElementById('soundToggleBtn');

    this.initInputs();
    this.initUI();
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;

      // INSTANT EXIT CAR TRIGGER ON 'E', 'e', Space, OR Enter
      if ((e.key === 'e' || e.key === 'E' || e.code === 'KeyE' || e.key === 'Enter') && (this.canExitCar || this.player.isInCar)) {
        this.exitCar();
      }

      if (['1', '2', '3', '4'].includes(e.key) && !this.player.isInCar) {
        const idx = parseInt(e.key) - 1;
        if (this.player.weapons[idx] && this.player.weapons[idx].unlocked) {
          this.player.activeWeaponIndex = idx;
          this.updateWeaponHUD();
          audio.playPickup();
        }
      }

      if (e.key === ' ' && this.currentDialogue) {
        this.nextDialogue();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      this.mouse.isDown = true;
      if (this.canExitCar) {
        this.exitCar();
      } else if (this.currentDialogue) {
        this.nextDialogue();
      } else if ((this.state === STATE.AMBUSH || this.state === STATE.WALKING) && !this.player.isInCar) {
        this.handlePlayerAttack();
      }
    });

    window.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    // --- ON-SCREEN MOBILE TOUCH CONTROLS BINDING ---
    const bindTouchBtn = (btnId, keyName) => {
      const el = document.getElementById(btnId);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys[keyName] = true;
      });
      el.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys[keyName] = false;
      });
    };

    bindTouchBtn('btnUp', 'w');
    bindTouchBtn('btnDown', 's');
    bindTouchBtn('btnLeft', 'a');
    bindTouchBtn('btnRight', 'd');
    bindTouchBtn('btnSprint', 'Shift');

    const btnSwitch = document.getElementById('btnSwitch');
    if (btnSwitch) {
      btnSwitch.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.player.isInCar) return;
        let nextIdx = (this.player.activeWeaponIndex + 1) % this.player.weapons.length;
        while (!this.player.weapons[nextIdx].unlocked) {
          nextIdx = (nextIdx + 1) % this.player.weapons.length;
        }
        this.player.activeWeaponIndex = nextIdx;
        this.updateWeaponHUD();
        audio.playPickup();
      });
    }

    const btnShoot = document.getElementById('btnShoot');
    if (btnShoot) {
      btnShoot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mouse.isDown = true;
        if (this.canExitCar) {
          this.exitCar();
        } else if (this.currentDialogue) {
          this.nextDialogue();
        } else if (!this.player.isInCar) {
          this.handlePlayerAttack();
        }
      });
      btnShoot.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.mouse.isDown = false;
      });
    }
  }

  initUI() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    document.getElementById('exitCarBtn').addEventListener('click', () => this.exitCar());

    document.getElementById('mainMenuBtn').addEventListener('click', () => this.returnToMainMenu());
    document.getElementById('winMainMenuBtn').addEventListener('click', () => this.returnToMainMenu());

    this.soundBtn.addEventListener('click', () => {
      const enabled = audio.toggleSound();
      this.soundBtn.innerText = enabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
    });
  }

  startGame() {
    this.titleScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.rightHud.classList.remove('hidden');
    this.killsHud.classList.remove('hidden');
    this.miniMapCard.classList.remove('hidden');
    audio.init();
    audio.startBGM();

    // Clean Fresh Player & Car State
    this.player = new Player(100, 280);
    this.car = new Car(-150, 280);
    this.car.speed = 6;
    this.car.isBroken = false;
    this.zombies = [];
    this.bullets = [];
    this.particles = [];
    this.pickups = [];

    // Reset Metrics & DOM Counters Immediately!
    this.kills = 0;
    this.distance = 0;
    const killsEl = document.getElementById('killsText');
    if (killsEl) killsEl.innerText = '0';

    this.currentWave = 1;
    this.zombiesInWave = 5;
    this.zombiesSpawnedInWave = 0;
    this.zombiesKilledInWave = 0;
    this.isWaveResting = false;
    this.updateWaveHUD();

    this.state = STATE.DRIVING;
    this.player.isInCar = true;
    this.canExitCar = false;
    this.exitCarTime = 0;
    this.ambushTriggered = false;

    this.updatePlayerHUD();
    this.updateDistanceHUD();

    this.showDialogue([
      "Jack: Driving down Rajasthan highway... Jodhpur entrance is right ahead.",
      "Jack: Wait... what's that dark smoke coming out of the bonnet?!",
      "Jack: Oh no! Engine's overheating! C'mon baby, don't break down now!"
    ]);
  }

  exitCar() {
    this.canExitCar = false;
    this.exitCarPrompt.classList.add('hidden');
    this.dialogueContainer.classList.add('hidden');
    this.currentDialogue = null;

    this.player.isInCar = false;
    this.player.x = this.car.x + 50;
    this.player.y = 280;
    this.state = STATE.WALKING;
    this.exitCarTime = Date.now();
    this.ambushTriggered = false;

    this.player.weapons[1].unlocked = true;
    this.player.activeWeaponIndex = 1;
    this.updateWeaponHUD();

    this.pickups.push(new Pickup(450, 260, 'shotgun'));
    this.pickups.push(new Pickup(850, 300, 'ak47'));
    this.pickups.push(new Pickup(350, 240, 'ammo'));
    this.pickups.push(new Pickup(600, 320, 'health'));
  }

  restartGame() {
    this.gameOverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.startGame();
  }

  returnToMainMenu() {
    this.gameOverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.rightHud.classList.add('hidden');
    this.killsHud.classList.add('hidden');
    this.waveHud.classList.add('hidden');
    this.miniMapCard.classList.add('hidden');
    this.exitCarPrompt.classList.add('hidden');
    this.dialogueContainer.classList.add('hidden');
    this.titleScreen.classList.remove('hidden');

    this.kills = 0;
    this.distance = 0;
    const killsEl = document.getElementById('killsText');
    if (killsEl) killsEl.innerText = '0';

    this.state = STATE.TITLE;
    audio.stopBGM();
  }

  showDialogue(lines) {
    this.dialogueQueue = lines;
    this.dialogueContainer.classList.remove('hidden');
    this.nextDialogue();
  }

  nextDialogue() {
    if (this.dialogueQueue.length > 0) {
      this.currentDialogue = this.dialogueQueue.shift();
      this.dialogueText.innerText = `"${this.currentDialogue}"`;
    } else {
      this.currentDialogue = null;
      this.dialogueContainer.classList.add('hidden');
    }
  }

  showWaveBanner(title, sub, duration = 2800) {
    document.getElementById('waveBannerTitle').innerText = title;
    document.getElementById('waveBannerSub').innerText = sub;
    this.waveBanner.classList.remove('hidden');
    if (duration > 0) {
      setTimeout(() => {
        if (!this.isWaveResting) this.waveBanner.classList.add('hidden');
      }, duration);
    }
  }

  showAmmoAlert(text, type = 'empty') {
    this.ammoAlertText.innerText = text;
    if (type === 'refill') {
      this.ammoAlert.classList.add('refill');
    } else {
      this.ammoAlert.classList.remove('refill');
    }
    this.ammoAlert.classList.remove('hidden');
    setTimeout(() => {
      this.ammoAlert.classList.add('hidden');
    }, 2200);
  }

  handlePlayerAttack() {
    if (this.player.isDead || this.player.isInCar) return;
    const now = Date.now();
    const w = this.player.weapons[this.player.activeWeaponIndex];

    if (now - this.player.lastShotTime < w.fireRate) return;

    if (w.type === 'melee') {
      this.player.lastShotTime = now;
      this.player.recoil = 10;
      audio.playCrowbar();

      this.zombies.forEach(z => {
        const dist = Math.hypot(z.x - this.player.x, z.y - this.player.y);
        if (dist < w.range + z.radius) {
          z.health -= w.damage;
          z.hitCooldown = 6;
          z.x += Math.cos(this.player.angle) * 22;
          z.y += Math.sin(this.player.angle) * 22;
          audio.playZombieHurt();
          this.spawnBloodParticles(z.x, z.y);
        }
      });
    } else {
      if (w.ammo <= 0) {
        this.showAmmoAlert(`⚠️ OUT OF AMMO FOR ${w.name}! PRESS [1] FOR CROWBAR OR PICKUP AMMO!`, 'empty');
        return;
      }
      w.ammo--;
      this.player.lastShotTime = now;
      this.player.recoil = 8;

      if (w.name === 'PISTOL') audio.playPistol();
      else if (w.name === 'SHOTGUN') audio.playShotgun();
      else if (w.name === 'AK-47') audio.playAK47();

      this.particles.push(
        new Particle(
          this.player.x + Math.cos(this.player.angle) * 25,
          this.player.y + Math.sin(this.player.angle) * 25,
          0, 0, '#fef08a', 9, 4
        )
      );

      const pellets = w.pellets || 1;
      for (let i = 0; i < pellets; i++) {
        const spreadAngle = this.player.angle + (Math.random() - 0.5) * w.spread;
        this.bullets.push(new Bullet(this.player.x, this.player.y, spreadAngle, w.speed, w.damage));
      }

      this.updateWeaponHUD();
    }
  }

  spawnBloodParticles(x, y) {
    for (let i = 0; i < 9; i++) {
      this.particles.push(
        new Particle(
          x, y,
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5,
          '#ef4444', Math.random() * 4 + 2, 22
        )
      );
    }
  }

  // --- RADAR MINI-MAP RENDERER ---
  drawMiniMap() {
    if (!this.miniMapCtx) return;
    const ctx = this.miniMapCtx;
    const mw = this.miniMapCanvas.width;
    const mh = this.miniMapCanvas.height;

    ctx.fillStyle = '#060c1c';
    ctx.fillRect(0, 0, mw, mh);

    ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, mw, mh);

    const mapCenterX = mw / 2;
    const mapCenterY = mh / 2;

    const toMapX = (wx) => mapCenterX + (wx - this.player.x) / 180;
    const toMapY = (wy) => mapCenterY + (wy - this.player.y) / 32;

    const fortMx = toMapX(40000);
    if (fortMx >= 0 && fortMx <= mw) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(fortMx - 4, mapCenterY - 10, 8, 20);
    }

    this.pickups.forEach(p => {
      const px = toMapX(p.x);
      const py = toMapY(p.y);
      if (px >= 0 && px <= mw && py >= 0 && py <= mh) {
        ctx.fillStyle = p.type === 'health' ? '#22c55e' : (p.type === 'ammo' ? '#eab308' : '#38bdf8');
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    });

    this.zombies.forEach(z => {
      const zx = toMapX(z.x);
      const zy = toMapY(z.y);
      if (zx >= 0 && zx <= mw && zy >= 0 && zy <= mh) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(zx, zy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(mapCenterX, mapCenterY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- DYNAMIC COLOR HUD UPDATE ---
  updatePlayerHUD() {
    if (!this.player) return;

    const healthPct = Math.max(0, Math.min(100, (this.player.health / this.player.maxHealth) * 100));
    const staminaPct = Math.max(0, Math.min(100, (this.player.stamina / this.player.maxStamina) * 100));

    const healthEl = document.getElementById('healthBar');
    const staminaEl = document.getElementById('staminaBar');
    const healthTextEl = document.getElementById('healthText');
    const staminaTextEl = document.getElementById('staminaText');

    if (healthEl) {
      healthEl.style.width = `${healthPct}%`;
      if (healthPct > 60) {
        healthEl.style.backgroundColor = '#22c55e';
        healthEl.style.boxShadow = '0 0 12px #22c55e';
      } else if (healthPct >= 30) {
        healthEl.style.backgroundColor = '#f97316';
        healthEl.style.boxShadow = '0 0 12px #f97316';
      } else {
        healthEl.style.backgroundColor = '#ef4444';
        healthEl.style.boxShadow = '0 0 12px #ef4444';
      }
    }

    if (staminaEl) {
      staminaEl.style.width = `${staminaPct}%`;
      if (staminaPct > 60) {
        staminaEl.style.backgroundColor = '#22c55e';
        staminaEl.style.boxShadow = '0 0 12px #22c55e';
      } else if (staminaPct >= 30) {
        staminaEl.style.backgroundColor = '#f97316';
        staminaEl.style.boxShadow = '0 0 12px #f97316';
      } else {
        staminaEl.style.backgroundColor = '#ef4444';
        staminaEl.style.boxShadow = '0 0 12px #ef4444';
      }
    }

    if (healthTextEl) healthTextEl.innerText = `${Math.ceil(this.player.health)} / 100`;
    if (staminaTextEl) staminaTextEl.innerText = `${Math.ceil(this.player.stamina)} / 100`;
  }

  // --- DYNAMIC COLOR DISTANCE HUD UPDATE ---
  updateDistanceHUD() {
    const rawPct = (this.distance / 5000) * 100;
    const barPct = Math.max(5, Math.min(100, rawPct));

    const distEl = document.getElementById('distanceBar');
    const distTextEl = document.getElementById('distanceText');

    if (distEl) {
      distEl.style.width = `${barPct}%`;
      if (rawPct > 60) {
        distEl.style.backgroundColor = '#22c55e';
        distEl.style.boxShadow = '0 0 12px #22c55e';
      } else if (rawPct >= 30) {
        distEl.style.backgroundColor = '#f97316';
        distEl.style.boxShadow = '0 0 12px #f97316';
      } else {
        distEl.style.backgroundColor = '#ef4444';
        distEl.style.boxShadow = '0 0 12px #ef4444';
      }
    }

    if (distTextEl) distTextEl.innerText = `${this.distance} / 5000m`;
  }

  // --- MAIN UPDATE LOOP ---
  update() {
    // 1. Phase 1: Driving Update
    if (this.state === STATE.DRIVING) {
      this.car.update();
      this.engine.updateCamera(this.car.x, this.car.y);

      if (this.car.x > 350 && !this.car.isBroken) {
        this.car.isBroken = true;
        this.car.speed = 0;
        audio.playEngineSputter();

        // INSTANT CAR EXIT PERMISSION
        this.canExitCar = true;
        this.exitCarPrompt.classList.remove('hidden');
        this.dialogueContainer.classList.add('hidden');
        this.currentDialogue = null;
      }
    }

    this.distance = Math.min(5000, Math.floor(this.player.distanceMeters));

    // 2. Phase 2 & 3: Walking & Zombie Outbreak Update
    if ((this.state === STATE.WALKING || this.state === STATE.AMBUSH) && !this.player.isInCar) {

      // On Mobile Touch Devices: Auto-Aim Flashlight at Nearest Zombie
      if (this.isTouchDevice && this.zombies.length > 0) {
        let nearestZ = this.zombies[0];
        let minDist = Infinity;
        for (let z of this.zombies) {
          const d = Math.hypot(z.x - this.player.x, z.y - this.player.y);
          if (d < minDist) {
            minDist = d;
            nearestZ = z;
          }
        }
        if (nearestZ && minDist < 450) {
          this.player.angle = Math.atan2(nearestZ.y - this.player.y, nearestZ.x - this.player.x);
        }
      }

      this.player.update(this.keys, this.mouse, this.engine.camera);
      this.engine.updateCamera(this.player.x, this.player.y);

      // --- ZOMBIE ARRIVAL AT 20 SECONDS AFTER CAR EXIT ---
      const walkElapsedSeconds = Math.floor((Date.now() - this.exitCarTime) / 1000);

      if (this.state === STATE.WALKING && !this.ambushTriggered) {
        if (walkElapsedSeconds >= 20) {
          this.ambushTriggered = true;
          this.state = STATE.AMBUSH;
          this.waveHud.classList.remove('hidden');

          audio.playZombieGrowl();
          audio.playWaveStart();
          this.showWaveBanner('WAVE 1 OUTBREAK STARTED!', '5 Zombies Approaching!');
          this.updateWaveHUD();

          this.showDialogue([
            "Jack: WHAT WAS THAT GROWL?! OH GOD, ZOMBIES ARE SURGING!",
            "Jack: USE PISTOL [2], SHOTGUN [3] & AK-47 [4] TO FIGHT TO MEHRANGARH FORT!"
          ]);
        }
      }

      if (this.mouse.isDown && this.player.weapons[this.player.activeWeaponIndex].name === 'AK-47') {
        this.handlePlayerAttack();
      }

      // --- 20-SECOND INTERMISSION BETWEEN WAVES ---
      if (this.isWaveResting) {
        this.showWaveBanner(
          `WAVE ${this.currentWave} CLEARED!`,
          `📦 REFILL HEALTH & AMMO ON STREET! PREPARING NEXT WAVE...`,
          0
        );

        if (Date.now() >= this.restEndTime) {
          this.isWaveResting = false;
          this.currentWave++;
          this.zombiesInWave = 5 + 5 * (this.currentWave - 1);
          this.zombiesSpawnedInWave = 0;
          this.zombiesKilledInWave = 0;

          audio.playWaveStart();
          this.showWaveBanner(`WAVE ${this.currentWave} STARTED!`, `${this.zombiesInWave} Zombies Approaching!`);
          this.updateWaveHUD();
        }
      }

      // --- CONTINUOUS ZOMBIE SPAWNING DURING WAVE ---
      if (this.state === STATE.AMBUSH && !this.player.isDead && !this.isWaveResting) {
        if (this.zombiesSpawnedInWave < this.zombiesInWave) {
          this.spawnTimer++;
          if (this.spawnTimer > 45) {
            this.spawnTimer = 0;
            this.zombiesSpawnedInWave++;

            const spawnX = this.player.x + (Math.random() < 0.5 ? 420 : -380);
            const spawnY = Math.min(650, Math.max(200, this.player.y + (Math.random() - 0.5) * 180));

            let type = 'walker';
            const r = Math.random();
            if (this.currentWave >= 2 && r < 0.35) type = 'runner';
            if (this.currentWave >= 4 && r > 0.8) type = 'tank';

            this.zombies.push(new Zombie(spawnX, spawnY, type));
            audio.playZombieGrowl();
          }
        }

        // WAVE CLEARED -> 20 SECONDS INTERMISSION REST
        if (this.zombiesKilledInWave >= this.zombiesInWave && this.zombies.length === 0) {
          if (this.currentWave < this.maxWaves) {
            audio.playWaveClear();

            this.isWaveResting = true;
            this.restEndTime = Date.now() + 20000;

            this.pickups.push(new Pickup(this.player.x + 80, 260, 'health'));
            this.pickups.push(new Pickup(this.player.x - 80, 300, 'health'));
            this.pickups.push(new Pickup(this.player.x + 130, 280, 'ammo'));
            this.pickups.push(new Pickup(this.player.x - 120, 240, 'ammo'));
            if (this.currentWave === 1) this.pickups.push(new Pickup(this.player.x + 180, 280, 'shotgun'));
            if (this.currentWave === 2) this.pickups.push(new Pickup(this.player.x + 180, 280, 'ak47'));
          } else {
            this.showWaveBanner('ALL 8 WAVES CLEARED!', 'Walk forward to Mehrangarh Fort Gate (5000m)!');
          }
        }
      }

      // Update Zombies
      this.zombies.forEach(z => {
        z.update(this.player);

        const dist = Math.hypot(z.x - this.player.x, z.y - this.player.y);
        if (dist < z.radius + this.player.radius && !this.player.isDead) {
          this.player.takeDamage(z.damage * 0.05);
          audio.playPlayerHurt();
        }
      });

      this.zombies = this.zombies.filter(z => {
        if (z.health <= 0) {
          this.kills++;
          this.zombiesKilledInWave++;
          const killsEl = document.getElementById('killsText');
          if (killsEl) killsEl.innerText = this.kills;
          this.updateWaveHUD();

          const rDrop = Math.random();
          if (rDrop < 0.25) this.pickups.push(new Pickup(z.x, z.y, 'health'));
          else if (rDrop < 0.45) this.pickups.push(new Pickup(z.x, z.y, 'ammo'));
          else if (rDrop < 0.52) this.pickups.push(new Pickup(z.x, z.y, 'shotgun'));
          else if (rDrop < 0.58) this.pickups.push(new Pickup(z.x, z.y, 'ak47'));

          return false;
        }
        return true;
      });

      this.bullets.forEach(b => b.update());
      this.bullets = this.bullets.filter(b => {
        if (b.life <= 0) return false;

        for (let z of this.zombies) {
          const dist = Math.hypot(z.x - b.x, z.y - b.y);
          if (dist < z.radius) {
            z.health -= b.damage;
            z.hitCooldown = 6;
            this.spawnBloodParticles(z.x, z.y);
            audio.playZombieHurt();
            return false;
          }
        }
        return true;
      });

      // Jack Collects Health Boxes, Ammo & Weapon Crates
      this.pickups.forEach(p => {
        p.update();
        const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
        if (dist < 34) {
          audio.playPickup();
          if (p.type === 'health') {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 50);
            this.showAmmoAlert('💊 HEALTH RECOVERED! (+50 HP)', 'refill');
          } else if (p.type === 'ammo') {
            this.player.weapons.forEach(w => {
              if (w.maxAmmo !== Infinity) w.ammo = Math.min(w.maxAmmo, w.ammo + 40);
            });
            this.showAmmoAlert('⚡ AMMO REFILLED! (+40 AMMO)', 'refill');
          } else if (p.type === 'shotgun') {
            this.player.weapons[2].unlocked = true;
            this.player.weapons[2].ammo = this.player.weapons[2].maxAmmo;
            this.player.activeWeaponIndex = 2;
            this.showAmmoAlert('💥 SHOTGUN UNLOCKED!', 'refill');
          } else if (p.type === 'ak47') {
            this.player.weapons[3].unlocked = true;
            this.player.weapons[3].ammo = this.player.weapons[3].maxAmmo;
            this.player.activeWeaponIndex = 3;
            this.showAmmoAlert('🔥 AK-47 UNLOCKED!', 'refill');
          }
          this.updateWeaponHUD();
          p.collected = true;
        }
      });
      this.pickups = this.pickups.filter(p => !p.collected);

      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => p.life > 0);

      // GAME OVER SCREEN -> APPEARS ONLY WHEN JACK DIES!
      if (this.player.isDead && this.state !== STATE.GAME_OVER) {
        this.state = STATE.GAME_OVER;
        document.getElementById('finalWave').innerText = `Wave ${this.currentWave} / 8`;
        document.getElementById('finalDistance').innerText = `${this.distance}m`;
        document.getElementById('finalKills').innerText = this.kills;
        this.gameOverScreen.classList.remove('hidden');
      }

      // VICTORY SCREEN -> TRIGGERS WHEN WALKING INTO MEHRANGARH FORT GATE AT ABSOLUTE END!
      if ((this.player.x >= 39800 || this.distance >= 5000) && this.state !== STATE.VICTORY) {
        this.state = STATE.VICTORY;
        document.getElementById('winKills').innerText = this.kills;
        this.victoryScreen.classList.remove('hidden');
      }
    }

    // ALWAYS UPDATE HUD LINES CONTINUOUSLY IN EVERY FRAME!
    this.updatePlayerHUD();
    this.updateDistanceHUD();
    this.drawMiniMap();
  }

  updateWaveHUD() {
    document.getElementById('waveText').innerText = `WAVE ${this.currentWave} / ${this.maxWaves}`;
    const left = Math.max(0, this.zombiesInWave - this.zombiesKilledInWave);
    document.getElementById('waveProgressText').innerText = `Zombies Left: ${left} / ${this.zombiesInWave}`;
  }

  updateWeaponHUD() {
    const w = this.player.weapons[this.player.activeWeaponIndex];
    document.getElementById('weaponName').innerText = w.name;
    document.getElementById('ammoText').innerText = w.ammo === Infinity ? '∞ / ∞' : `${w.ammo} / ${w.maxAmmo}`;

    for (let i = 1; i <= 4; i++) {
      const btn = document.getElementById(`w${i}`);
      const weaponObj = this.player.weapons[i - 1];
      if (!btn || !weaponObj) continue;
      if (weaponObj.unlocked) {
        btn.classList.remove('locked');
      } else {
        btn.classList.add('locked');
      }
      if (i - 1 === this.player.activeWeaponIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  // --- RENDER LOOP ---
  render() {
    this.engine.clear();
    this.engine.drawBackground(this.state, 45000);

    const ctx = this.engine.ctx;
    ctx.save();
    ctx.translate(-this.engine.camera.x, -this.engine.camera.y);

    this.pickups.forEach(p => p.draw(ctx));
    this.car.draw(ctx, this.player);

    this.bullets.forEach(b => b.draw(ctx));
    this.zombies.forEach(z => z.draw(ctx));
    this.player.draw(ctx);
    this.particles.forEach(p => p.draw(ctx));

    ctx.restore();

    this.engine.drawLightingOverlay(this.player, []);
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }
}

window.addEventListener('load', () => {
  const game = new Game();
  game.loop();
});
