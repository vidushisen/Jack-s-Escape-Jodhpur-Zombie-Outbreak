/**
 * Game Entities & Particle Systems for Jack's Escape: Jodhpur Outbreak
 * Features Slightly Increased Zombie Speeds (Walker 0.68, Runner 0.85, Tank 0.48)
 * & Extra Slow Realistic Distance Meter Progression (* 0.15)
 */

// --- PARTICLE CLASS ---
class Particle {
  constructor(x, y, vx, vy, color, size, life, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
    this.shape = shape;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.95;
    this.vy *= 0.95;
    this.life--;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    if (this.shape === 'circle') {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    } else {
      ctx.rect(this.x - this.size / 2, this.size / 2, this.size, this.size);
    }
    ctx.fill();
    ctx.restore();
  }
}

// --- PLAYER (JACK) CLASS ---
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 18;
    this.angle = 0;
    this.speed = 3.8;
    this.sprintMultiplier = 1.65;
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.isSprinting = false;
    this.isInCar = true;
    this.distanceMeters = 0;

    // Weapons Inventory
    this.activeWeaponIndex = 1;
    this.weapons = [
      { name: 'CROWBAR', type: 'melee', damage: 45, fireRate: 320, ammo: Infinity, maxAmmo: Infinity, range: 55, unlocked: true },
      { name: 'PISTOL', type: 'gun', damage: 38, fireRate: 190, ammo: 90, maxAmmo: 90, speed: 20, spread: 0.03, unlocked: true },
      { name: 'SHOTGUN', type: 'gun', damage: 26, fireRate: 550, ammo: 36, maxAmmo: 36, pellets: 8, speed: 18, spread: 0.20, unlocked: false },
      { name: 'AK-47', type: 'gun', damage: 34, fireRate: 85, ammo: 180, maxAmmo: 180, speed: 24, spread: 0.07, unlocked: false }
    ];

    this.lastShotTime = 0;
    this.walkCycle = 0;
    this.recoil = 0;
    this.isDead = false;
  }

  update(keys, mousePos, camera) {
    if (this.isDead || this.isInCar) return;

    if (!this.isSprinting && this.stamina < this.maxStamina) {
      this.stamina += 0.5;
    }

    let moveSpeed = this.speed;
    if (keys.Shift && this.stamina > 5) {
      this.isSprinting = true;
      moveSpeed *= this.sprintMultiplier;
      this.stamina -= 0.6;
    } else {
      this.isSprinting = false;
    }

    let dx = 0;
    let dy = 0;
    if (keys.w || keys.W || keys.ArrowUp) dy -= 1;
    if (keys.s || keys.S || keys.ArrowDown) dy += 1;
    if (keys.a || keys.A || keys.ArrowLeft) dx -= 1;
    if (keys.d || keys.D || keys.ArrowRight) dx += 1;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const prevX = this.x;
    this.x += dx * moveSpeed;
    this.y += dy * moveSpeed;

    if (this.x > prevX) {
      this.distanceMeters += (this.x - prevX) * 0.15; // Extra slow realistic meter progression!
    }

    // Street Y-Bounds
    const streetMinY = 185;
    const streetMaxY = 680;
    if (this.y < streetMinY) this.y = streetMinY;
    if (this.y > streetMaxY) this.y = streetMaxY;

    if (dx !== 0 || dy !== 0) {
      this.walkCycle += 0.22;
    }

    const worldMouseX = mousePos.x + camera.x;
    const worldMouseY = mousePos.y + camera.y;
    this.angle = Math.atan2(worldMouseY - this.y, worldMouseX - this.x);

    if (this.recoil > 0) this.recoil -= 0.5;
  }

  draw(ctx) {
    if (this.isDead || this.isInCar) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // SUPER-BRIGHT TORCH LIGHT BEAM
    const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, 480);
    gradient.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
    gradient.addColorStop(0.2, 'rgba(254, 240, 138, 0.65)');
    gradient.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 480, -0.65, 0.65);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Torch Lens Glow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Legs animation
    const legOffset = Math.sin(this.walkCycle) * 9;
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(-6, -14 + legOffset, 10, 6);
    ctx.fillRect(-6, 8 - legOffset, 10, 6);

    // Body (Jack wearing jacket)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(-2, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    // Weapon representation
    const activeW = this.weapons[this.activeWeaponIndex];
    if (activeW.type === 'melee') {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(8 - this.recoil, 4, 22, 5);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10 - this.recoil, 6, 20, 6);
    }

    ctx.restore();
  }

  takeDamage(amount) {
    this.health -= amount;
    this.stamina = Math.max(0, this.stamina - 4.5);
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }
  }
}

// --- CAR CLASS ---
class Car {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 115;
    this.height = 58;
    this.speed = 0;
    this.isBroken = false;
    this.smokeParticles = [];
  }

  update() {
    if (!this.isBroken) {
      this.x += this.speed;
    }
    if (this.isBroken && Math.random() < 0.7) {
      this.smokeParticles.push(
        new Particle(
          this.x + 35 + (Math.random() * 10 - 5),
          this.y - 10,
          Math.random() * -1 - 0.5,
          Math.random() * -2 - 1,
          Math.random() < 0.4 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(148, 163, 184, 0.7)',
          Math.random() * 7 + 4,
          45
        )
      );
    }
    this.smokeParticles.forEach(p => p.update());
    this.smokeParticles = this.smokeParticles.filter(p => p.life > 0);
  }

  draw(ctx, player) {
    this.smokeParticles.forEach(p => p.draw(ctx));

    ctx.save();
    ctx.translate(this.x, this.y);

    // Headlight Beams
    const headlightGrad = ctx.createLinearGradient(40, 0, 260, 0);
    headlightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    headlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = headlightGrad;
    ctx.beginPath();
    ctx.moveTo(40, -18);
    ctx.lineTo(280, -60);
    ctx.lineTo(280, 60);
    ctx.lineTo(40, 18);
    ctx.closePath();
    ctx.fill();

    // Car Body
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Windows
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-this.width / 4, -this.height / 2 + 5, this.width / 2, this.height - 10);

    // Jack Seated Inside Car
    if (player && player.isInCar) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(5, -6, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wheels
    ctx.fillStyle = '#020617';
    ctx.fillRect(-this.width / 2 + 10, -this.height / 2 - 5, 24, 9);
    ctx.fillRect(this.width / 2 - 34, -this.height / 2 - 5, 24, 9);
    ctx.fillRect(-this.width / 2 + 10, this.height / 2 - 4, 24, 9);
    ctx.fillRect(this.width / 2 - 34, this.height / 2 - 4, 24, 9);

    // Engine Hood Fire
    if (this.isBroken) {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(38, 0, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// --- VIBRANT ZOMBIE CLASS (SLIGHTLY INCREASED SPEEDS: Walker 0.68, Runner 0.85, Tank 0.48) ---
class Zombie {
  constructor(x, y, type = 'walker') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 17;
    this.angle = 0;
    this.walkCycle = Math.random() * 10;
    this.hitCooldown = 0;

    if (type === 'runner') {
      this.health = 50;
      this.maxHealth = 50;
      this.speed = 0.85; // Slightly increased from 0.65
      this.damage = 12;
      this.color = '#ff0055';
    } else if (type === 'tank') {
      this.health = 230;
      this.maxHealth = 230;
      this.speed = 0.48; // Slightly increased from 0.35
      this.damage = 28;
      this.radius = 25;
      this.color = '#10b981';
    } else {
      this.health = 75;
      this.maxHealth = 75;
      this.speed = 0.68; // Slightly increased from 0.50
      this.damage = 15;
      this.color = '#06b6d4';
    }
  }

  update(player) {
    if (this.health <= 0) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    this.angle = Math.atan2(dy, dx);

    if (dist > 15) {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.walkCycle += 0.08;
    }

    // Street Bounds
    const streetMinY = 185;
    const streetMaxY = 680;
    if (this.y < streetMinY) this.y = streetMinY;
    if (this.y > streetMaxY) this.y = streetMaxY;

    if (this.hitCooldown > 0) this.hitCooldown--;
  }

  draw(ctx) {
    if (this.health <= 0) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const armWiggle = Math.sin(this.walkCycle) * 7;
    ctx.fillStyle = '#042f2e';
    ctx.fillRect(8, -12 + armWiggle, 16, 5);
    ctx.fillRect(8, 7 - armWiggle, 16, 5);

    ctx.fillStyle = this.hitCooldown > 0 ? '#ffffff' : this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(6, -6, 3.5, 0, Math.PI * 2);
    ctx.arc(6, 6, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (this.health < this.maxHealth) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(this.x - 20, this.y - this.radius - 12, 40, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(this.x - 20, this.y - this.radius - 12, (this.health / this.maxHealth) * 40, 5);
      ctx.restore();
    }
  }
}

// --- BULLET CLASS ---
class Bullet {
  constructor(x, y, angle, speed, damage) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.life = 60;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.5, this.y - this.vy * 0.5);
    ctx.stroke();
    ctx.restore();
  }
}

// --- GLOWING WEAPON & SUPPLY PICKUP CLASS ---
class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.bob = Math.random() * Math.PI * 2;
  }

  update() {
    this.bob += 0.06;
  }

  draw(ctx) {
    ctx.save();
    const offsetY = Math.sin(this.bob) * 6;
    ctx.translate(this.x, this.y + offsetY);

    ctx.shadowBlur = 18;

    if (this.type === 'health') {
      ctx.shadowColor = '#22c55e';
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-14, -14, 28, 28);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -9, 8, 18);
      ctx.fillRect(-9, -4, 18, 8);
    } else if (this.type === 'ammo') {
      ctx.shadowColor = '#eab308';
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-14, -11, 28, 22);
      ctx.fillStyle = '#000000';
      ctx.font = '900 10px "Rajdhani", sans-serif';
      ctx.fillText('AMMO', -12, 4);
    } else if (this.type === 'shotgun') {
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-22, -12, 44, 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-22, -12, 44, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px "Rajdhani", sans-serif';
      ctx.fillText('💥 SHOTGUN', -20, 4);
    } else if (this.type === 'ak47') {
      ctx.shadowColor = '#a855f7';
      ctx.fillStyle = '#7e22ce';
      ctx.fillRect(-22, -12, 44, 24);
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(-22, -12, 44, 24);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px "Rajdhani", sans-serif';
      ctx.fillText('🔥 AK-47', -17, 4);
    }

    ctx.restore();
  }
}
