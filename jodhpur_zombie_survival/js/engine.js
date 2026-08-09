/**
 * Graphics Engine & World Renderer for Jodhpur - The Blue City
 * 100% Unobstructed Continuous Cobblestone Street with ZERO Arches or Gates in the Middle
 */
class GraphicsEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.camera = { x: 0, y: 0 };
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  updateCamera(targetX, targetY) {
    this.camera.x += (targetX - this.width / 2 - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.height / 2 - this.camera.y) * 0.1;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // --- DRAW ENVIRONMENT ---
  drawBackground(gameState, worldWidth = 45000) {
    const ctx = this.ctx;
    const camX = this.camera.x;
    const camY = this.camera.y;

    // 1. Rajasthan Sunset Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#0a0f24');
    skyGrad.addColorStop(0.3, '#1e3a8a');
    skyGrad.addColorStop(0.55, '#2563eb');
    skyGrad.addColorStop(0.8, '#f59e0b');
    skyGrad.addColorStop(1, '#d97706');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. GRAND MEHRANGARH FORT SILHOUETTE (IN TOP SKY BACKDROP)
    ctx.save();
    const fortParallax = -camX * 0.12;

    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(fortParallax - 300, 220);
    ctx.lineTo(fortParallax + 300, 80);
    ctx.lineTo(fortParallax + 700, 30);
    ctx.lineTo(fortParallax + 1100, 30);
    ctx.lineTo(fortParallax + 1350, 5);
    ctx.lineTo(fortParallax + 2000, 5);
    ctx.lineTo(fortParallax + 2400, 45);
    ctx.lineTo(fortParallax + 3200, 20);
    ctx.lineTo(fortParallax + 4200, 90);
    ctx.lineTo(fortParallax + 10000, 220);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Flag atop Fort Peak
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(fortParallax + 1650, -20, 4, 30);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(fortParallax + 1654, -20, 22, 14);
    ctx.restore();

    // 3. TOP BLUE CITY SKYLINE WALL
    ctx.save();
    const startSkylineX = Math.floor((camX - 600) / 210) * 210;
    const endSkylineX = Math.ceil((camX + this.width + 600) / 210) * 210;

    for (let houseX = startSkylineX; houseX <= endSkylineX; houseX += 210) {
      const screenHouseX = houseX - camX;
      const houseWidth = 195;
      const houseHeight = 90;
      const topY = 75;

      const houseGrad = ctx.createLinearGradient(screenHouseX, topY, screenHouseX + houseWidth, topY + houseHeight);
      houseGrad.addColorStop(0, '#0284c7');
      houseGrad.addColorStop(1, '#1d4ed8');
      ctx.fillStyle = houseGrad;
      ctx.fillRect(screenHouseX, topY, houseWidth, houseHeight);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(screenHouseX + 3, topY + 3, houseWidth - 6, houseHeight - 6);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(screenHouseX + houseWidth / 2, topY, 24, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      for (let w = 0; w < 2; w++) {
        const winX = screenHouseX + 28 + w * 92;
        const winY = topY + 25;
        ctx.fillStyle = '#090d16';
        ctx.fillRect(winX, winY, 40, 45);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(winX - 2, winY - 4, 44, 53);
      }
    }
    ctx.restore();

    // 4. 100% PERFECTLY SEAMLESS CONTINUOUS COBBLESTONE BRICK GRID (GRID-SNAPPED TO 45px)
    ctx.save();
    ctx.translate(-camX, -camY);

    const startStreetX = Math.floor((camX - 600) / 45) * 45; // Snapped to exact brick width!
    const endStreetX = Math.ceil((camX + this.width + 600) / 45) * 45;

    // Infinite Road Pavement Base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startStreetX, 165, (endStreetX - startStreetX) + 400, 3000);

    // Sidewalk Curb Line
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(startStreetX, 160, (endStreetX - startStreetX) + 400, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startStreetX, 172, (endStreetX - startStreetX) + 400, 4);

    // Perfectly Seamless Continuous Brick Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    for (let cx = startStreetX; cx < endStreetX + 400; cx += 45) {
      for (let cy = 180; cy < 1200; cy += 30) {
        const offsetX = (cy % 60 === 0) ? 20 : 0;
        ctx.strokeRect(cx + offsetX, cy, 40, 26);
      }
    }

    // Abandoned Blue Auto-Rickshaws Props
    const startRickshawX = Math.floor((camX - 600) / 700) * 700;
    const endRickshawX = Math.ceil((camX + this.width + 600) / 700) * 700;

    for (let rx = startRickshawX + 350; rx <= endRickshawX; rx += 700) {
      if (rx >= 39000) continue;

      ctx.save();
      ctx.translate(rx, 155);

      ctx.fillStyle = '#facc15';
      ctx.fillRect(-25, -20, 50, 12);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-25, -8, 50, 25);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-20, -6, 20, 12);
      ctx.fillRect(4, -6, 18, 12);

      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(-15, 18, 8, 0, Math.PI * 2);
      ctx.arc(15, 18, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Street Lamp Posts
    const startLampX = Math.floor((camX - 600) / 380) * 380;
    const endLampX = Math.ceil((camX + this.width + 600) / 380) * 380;

    for (let lx = startLampX; lx <= endLampX; lx += 380) {
      if (lx >= 39000) continue;

      ctx.fillStyle = '#475569';
      ctx.fillRect(lx, 110, 9, 60);

      const lampGrad = ctx.createRadialGradient(lx + 4, 105, 2, lx + 4, 105, 55);
      lampGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lampGrad;
      ctx.beginPath();
      ctx.arc(lx + 4, 105, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(lx + 4, 105, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 5. PHYSICAL MEHRANGARH FORT MAIN GATEWAY ONLY AT ABSOLUTE END (X = 40000) ---
    const gateX = 40000;
    
    // Render Gate ONLY when Jack approaches the end of 5000m destination!
    if (camX > 37000) {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(gateX, 40, 480, 480);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 6;
      ctx.strokeRect(gateX, 40, 480, 480);

      for (let bw = 0; bw < 11; bw++) {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(gateX + bw * 44, 10, 24, 30);
      }

      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(gateX + 240, 310, 115, Math.PI, 0);
      ctx.fillRect(gateX + 125, 310, 230, 210);
      ctx.fill();

      ctx.fillStyle = '#451a03';
      ctx.fillRect(gateX + 130, 310, 90, 210);
      ctx.fillRect(gateX + 260, 310, 90, 210);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 4;
      ctx.strokeRect(gateX + 130, 310, 90, 210);
      ctx.strokeRect(gateX + 260, 310, 90, 210);

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(gateX + 90, 280, 18, 0, Math.PI * 2);
      ctx.arc(gateX + 390, 280, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.font = '900 24px "Rajdhani", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏰 MEHRANGARH FORT MAIN ENTRANCE', gateX + 240, 110);
      ctx.fillStyle = '#00d4ff';
      ctx.font = '700 16px "Rajdhani", sans-serif';
      ctx.fillText('WALK THROUGH GATE TO ESCAPE!', gateX + 240, 140);
    }

    ctx.restore();
  }

  // --- DYNAMIC LIGHTING OVERLAY ---
  drawLightingOverlay(player, lights = []) {
    const ctx = this.ctx;

    const darkCanvas = document.createElement('canvas');
    darkCanvas.width = this.width;
    darkCanvas.height = this.height;
    const darkCtx = darkCanvas.getContext('2d');

    darkCtx.fillStyle = 'rgba(6, 12, 28, 0.50)';
    darkCtx.fillRect(0, 0, this.width, this.height);

    darkCtx.globalCompositeOperation = 'destination-out';

    if (player && !player.isDead && !player.isInCar) {
      const screenPx = player.x - this.camera.x;
      const screenPy = player.y - this.camera.y;

      const flashGrad = darkCtx.createRadialGradient(
        screenPx, screenPy, 20,
        screenPx + Math.cos(player.angle) * 220,
        screenPy + Math.sin(player.angle) * 220,
        480
      );
      flashGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      flashGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.95)');
      flashGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.6)');
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      darkCtx.fillStyle = flashGrad;
      darkCtx.beginPath();
      darkCtx.moveTo(screenPx, screenPy);
      darkCtx.arc(screenPx, screenPy, 480, player.angle - 0.65, player.angle + 0.65);
      darkCtx.closePath();
      darkCtx.fill();

      const bodyAura = darkCtx.createRadialGradient(screenPx, screenPy, 5, screenPx, screenPy, 110);
      bodyAura.addColorStop(0, 'rgba(0, 0, 0, 1)');
      bodyAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      darkCtx.fillStyle = bodyAura;
      darkCtx.beginPath();
      darkCtx.arc(screenPx, screenPy, 110, 0, Math.PI * 2);
      darkCtx.fill();
    }

    lights.forEach(light => {
      const lx = light.x - this.camera.x;
      const ly = light.y - this.camera.y;
      const grad = darkCtx.createRadialGradient(lx, ly, 0, lx, ly, light.radius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      darkCtx.fillStyle = grad;
      darkCtx.beginPath();
      darkCtx.arc(lx, ly, light.radius, 0, Math.PI * 2);
      darkCtx.fill();
    });

    ctx.drawImage(darkCanvas, 0, 0);
  }
}
