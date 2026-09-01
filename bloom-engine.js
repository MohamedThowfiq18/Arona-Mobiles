/**
 * AuraBloom Engine - Core HTML5 Canvas & Scroll Physics
 * High-performance 60 FPS ambient light bloom, velocity tracking, and scroll observers.
 */
class BloomEngine {
  constructor() {
    this.canvas = document.getElementById('bloom-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    // Physics & Settings
    this.scrollY = window.scrollY;
    this.lastScrollY = window.scrollY;
    this.scrollVelocity = 0;
    this.maxVelocity = 120;
    this.lerpSmoothing = 0.08;
    this.bloomRadius = 220;
    this.bloomIntensity = 1.2;
    this.emberCount = 35;

    // Color Palette Defaults (Neon Ether)
    this.primaryColor = { r: 168, g: 85, b: 247 };
    this.secondaryColor = { r: 6, g: 182, b: 212 };

    // Mouse & Touch Interaction
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Particle & Light Orbs
    this.orbs = [];
    this.embers = [];

    // Performance Telemetry
    this.frameCount = 0;
    this.fps = 60;
    this.lastFpsUpdate = performance.now();

    this.init();
  }

  init() {
    this.handleResize();
    this.setupOrbs();
    this.setupEmbers();
    this.bindEvents();
    this.setupIntersectionObservers();
    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setupOrbs() {
    this.orbs = [
      { x: this.width * 0.2, y: this.height * 0.3, radius: 260, speedX: 0.4, speedY: 0.3, offset: 0 },
      { x: this.width * 0.8, y: this.height * 0.2, radius: 300, speedX: -0.3, speedY: 0.5, offset: Math.PI / 2 },
      { x: this.width * 0.5, y: this.height * 0.7, radius: 350, speedX: 0.5, speedY: -0.4, offset: Math.PI },
      { x: this.width * 0.15, y: this.height * 0.8, radius: 240, speedX: -0.4, speedY: -0.3, offset: Math.PI * 1.5 },
      { x: this.width * 0.85, y: this.height * 0.75, radius: 280, speedX: 0.3, speedY: 0.4, offset: Math.PI * 0.5 },
    ];
  }

  setupEmbers() {
    this.embers = [];
    for (let i = 0; i < this.emberCount; i++) {
      this.embers.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 1.2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.handleResize());

    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - this.lastScrollY);
      this.scrollVelocity = Math.min(delta * 1.8, this.maxVelocity);
      this.lastScrollY = currentY;
      this.scrollY = currentY;
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = e.clientX;
      this.targetMouse.y = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouse.x = e.touches[0].clientX;
        this.targetMouse.y = e.touches[0].clientY;
      }
    }, { passive: true });
  }

  setupIntersectionObservers() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('bloom-in-view');
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.bloom-card-scroll').forEach(el => observer.observe(el));
  }

  updatePhysics() {
    // Lerp mouse position
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * this.lerpSmoothing;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * this.lerpSmoothing;

    // Decay scroll velocity smoothly
    this.scrollVelocity *= (1 - this.lerpSmoothing);

    // Update Orbs motion
    const time = performance.now() * 0.001;
    this.orbs.forEach(orb => {
      orb.x += Math.sin(time * orb.speedX + orb.offset) * 0.8;
      orb.y += Math.cos(time * orb.speedY + orb.offset) * 0.8;
    });

    // Update Embers
    const velBoost = this.scrollVelocity * 0.05;
    this.embers.forEach(ember => {
      ember.y -= (ember.speedY + velBoost);
      ember.x += ember.speedX + Math.sin(ember.pulse) * 0.3;
      ember.pulse += 0.03;

      if (ember.y < -10) {
        ember.y = this.height + 10;
        ember.x = Math.random() * this.width;
      }
    });
  }

  render() {
    this.updatePhysics();

    this.ctx.clearRect(0, 0, this.width, this.height);

    // Global Composite Operations for Glowing Lights
    this.ctx.globalCompositeOperation = 'screen';

    const velRatio = this.scrollVelocity / this.maxVelocity;
    const currentIntensity = this.bloomIntensity * (1 + velRatio * 0.8);

    // Render Ambient Orbs Bloom
    this.orbs.forEach((orb, idx) => {
      const isPrimary = idx % 2 === 0;
      const color = isPrimary ? this.primaryColor : this.secondaryColor;
      const radius = (this.bloomRadius * (orb.radius / 250)) * (1 + velRatio * 0.3);

      const grad = this.ctx.createRadialGradient(
        orb.x, orb.y, 0,
        orb.x, orb.y, radius
      );

      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.25 * currentIntensity})`);
      grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.08 * currentIntensity})`);
      grad.addColorStop(1, `rgba(0, 0, 0, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Render Interactive Mouse Spotlight Bloom
    const mouseRadius = this.bloomRadius * 1.3;
    const mouseGrad = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, mouseRadius
    );
    mouseGrad.addColorStop(0, `rgba(${this.primaryColor.r}, ${this.primaryColor.g}, ${this.primaryColor.b}, ${0.3 * currentIntensity})`);
    mouseGrad.addColorStop(0.6, `rgba(${this.secondaryColor.r}, ${this.secondaryColor.g}, ${this.secondaryColor.b}, ${0.1 * currentIntensity})`);
    mouseGrad.addColorStop(1, `rgba(0, 0, 0, 0)`);

    this.ctx.fillStyle = mouseGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, mouseRadius, 0, Math.PI * 2);
    this.ctx.fill();

    // Render Embers
    this.ctx.globalCompositeOperation = 'lighter';
    this.embers.forEach(ember => {
      this.ctx.fillStyle = `rgba(${this.secondaryColor.r}, ${this.secondaryColor.g}, ${this.secondaryColor.b}, ${ember.alpha * (0.8 + velRatio * 0.4)})`;
      this.ctx.beginPath();
      this.ctx.arc(ember.x, ember.y, ember.size * (1 + velRatio * 0.5), 0, Math.PI * 2);
      this.ctx.fill();
    });

    // Reset Composite
    this.ctx.globalCompositeOperation = 'source-over';

    // Telemetry & FPS Tracking
    this.updateTelemetry();

    requestAnimationFrame(this.render);
  }

  updateTelemetry() {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      const fpsEl = document.getElementById('fps-counter');
      if (fpsEl) fpsEl.textContent = `${this.fps} FPS`;
    }

    const telVel = document.getElementById('tel-velocity');
    const telInt = document.getElementById('tel-intensity');
    const telProg = document.getElementById('tel-progress');

    if (telVel) telVel.textContent = `${Math.round(this.scrollVelocity * 10)} px/s`;
    if (telInt) telInt.textContent = `${(this.bloomIntensity * (1 + (this.scrollVelocity / this.maxVelocity) * 0.8)).toFixed(2)}x`;
    if (telProg) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
      telProg.style.width = `${pct}%`;
    }
  }

  triggerVelocityBurst() {
    this.scrollVelocity = this.maxVelocity;
  }
}

// Global Engine Instance
window.bloomEngine = null;
window.addEventListener('DOMContentLoaded', () => {
  window.bloomEngine = new BloomEngine();
});
