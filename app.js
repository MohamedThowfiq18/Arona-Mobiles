/**
 * AuraBloom - Application Controller & Interactive Studio Handler
 * Manages UI events, live customizer controls, color theme switching, and snippet code exporting.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Theme Color Mappings (RGB)
  const themeColors = {
    'theme-neon': { primary: { r: 168, g: 85, b: 247 }, secondary: { r: 6, g: 182, b: 212 }, name: 'Neon Ether' },
    'theme-solar': { primary: { r: 245, g: 158, b: 11 }, secondary: { r: 239, g: 68, b: 68 }, name: 'Solar Flare' },
    'theme-emerald': { primary: { r: 16, g: 185, b: 129 }, secondary: { r: 20, g: 184, b: 166 }, name: 'Emerald Myst' },
    'theme-cyber': { primary: { r: 59, g: 130, b: 246 }, secondary: { r: 99, g: 102, b: 241 }, name: 'Cyber Dusk' },
    'theme-gold': { primary: { r: 234, g: 179, b: 8 }, secondary: { r: 217, g: 119, b: 6 }, name: 'Obsidian Gold' }
  };

  // 1. Theme Switcher Handlers
  const paletteBtns = document.querySelectorAll('.palette-btn');
  paletteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      paletteBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const themeClass = btn.getAttribute('data-theme');
      document.body.className = themeClass;

      const themeData = themeColors[themeClass];
      if (themeData && window.bloomEngine) {
        window.bloomEngine.primaryColor = themeData.primary;
        window.bloomEngine.secondaryColor = themeData.secondary;

        const lblTheme = document.getElementById('lbl-curr-theme');
        if (lblTheme) lblTheme.textContent = themeData.name;
      }
    });
  });

  // 2. Range Sliders Controller
  const rangeRadius = document.getElementById('range-radius');
  const rangeIntensity = document.getElementById('range-intensity');
  const rangeParticles = document.getElementById('range-particles');
  const rangeSmoothing = document.getElementById('range-smoothing');

  const valRadius = document.getElementById('val-radius');
  const valIntensity = document.getElementById('val-intensity');
  const valParticles = document.getElementById('val-particles');
  const valSmoothing = document.getElementById('val-smoothing');

  if (rangeRadius) {
    rangeRadius.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      valRadius.textContent = `${val}px`;
      document.documentElement.style.setProperty('--bloom-radius', `${val}px`);
      if (window.bloomEngine) window.bloomEngine.bloomRadius = val;
    });
  }

  if (rangeIntensity) {
    rangeIntensity.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valIntensity.textContent = `${val.toFixed(1)}x`;
      document.documentElement.style.setProperty('--bloom-intensity', val);
      if (window.bloomEngine) window.bloomEngine.bloomIntensity = val;
    });
  }

  if (rangeParticles) {
    rangeParticles.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      valParticles.textContent = `${val} Particles`;
      if (window.bloomEngine) {
        window.bloomEngine.emberCount = val;
        window.bloomEngine.setupEmbers();
      }
    });
  }

  if (rangeSmoothing) {
    rangeSmoothing.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      valSmoothing.textContent = `${val} (${val < 0.06 ? 'Ultra Smooth' : 'Responsive'})`;
      if (window.bloomEngine) window.bloomEngine.lerpSmoothing = val;
    });
  }

  // Reset Studio Defaults
  const btnReset = document.getElementById('btn-reset-studio');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (rangeRadius) { rangeRadius.value = 220; rangeRadius.dispatchEvent(new Event('input')); }
      if (rangeIntensity) { rangeIntensity.value = 1.2; rangeIntensity.dispatchEvent(new Event('input')); }
      if (rangeParticles) { rangeParticles.value = 35; rangeParticles.dispatchEvent(new Event('input')); }
      if (rangeSmoothing) { rangeSmoothing.value = 0.08; rangeSmoothing.dispatchEvent(new Event('input')); }
      document.querySelector('.palette-btn[data-theme="theme-neon"]')?.click();
    });
  }

  // 3. Velocity Burst CTA Button
  const btnBurst = document.getElementById('btn-trigger-burst');
  if (btnBurst) {
    btnBurst.addEventListener('click', () => {
      if (window.bloomEngine) {
        window.bloomEngine.triggerVelocityBurst();
      }
    });
  }

  // Open Studio Smooth Scroll Button
  const btnOpenStudio = document.getElementById('btn-open-studio');
  if (btnOpenStudio) {
    btnOpenStudio.addEventListener('click', () => {
      document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 4. Interactive Studio Playground Orb Tracking
  const studioCanvas = document.querySelector('.studio-interactive-canvas');
  const studioOrb = document.getElementById('studio-bloom-orb');
  if (studioCanvas && studioOrb) {
    studioCanvas.addEventListener('mousemove', (e) => {
      const rect = studioCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      studioOrb.style.left = `${x - studioOrb.offsetWidth / 2}px`;
      studioOrb.style.top = `${y - studioOrb.offsetHeight / 2}px`;
    });
  }

  // 5. Code Export Tab Switching & Copy to Clipboard
  const codeSnippets = {
    vanilla: `<!-- Step 1: Add Canvas Element -->
<canvas id="scroll-bloom-canvas" style="position:fixed; top:0; left:0; width:100vw; height:100vh; pointer-events:none; z-index:-1;"></canvas>

<!-- Step 2: Include Lightweight Bloom Engine -->
<script>
  (function initScrollBloom() {
    const canvas = document.getElementById('scroll-bloom-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let scrollY = window.scrollY;
    let velocity = 0;
    let lastScrollY = window.scrollY;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      velocity = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
    });

    function draw() {
      ctx.clearRect(0, 0, width, height);
      velocity *= 0.92; // smooth decay
      
      const bloomRadius = 250 + Math.min(velocity * 4, 150);
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 10,
        width / 2, height / 2, bloomRadius
      );
      
      gradient.addColorStop(0, 'rgba(168, 85, 247, ' + (0.15 + velocity * 0.005) + ')');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.08)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      requestAnimationFrame(draw);
    }
    draw();
  })();
</script>`,
    css: `/* AuraBloom Utility Classes & Theme Tokens */
:root {
  --primary-bloom: #a855f7;
  --secondary-bloom: #06b6d4;
  --bloom-intensity: 1.2;
}

/* Scroll Bloom Card Reveal */
.bloom-card-scroll {
  opacity: 0;
  transform: translateY(40px) scale(0.96);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), 
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.bloom-card-scroll.bloom-in-view {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Text Glow Bloom */
.bloom-text-glow {
  text-shadow: 0 0 35px rgba(168, 85, 247, 0.6);
}`,
    react: `import { useEffect, useRef } from 'react';

export default function useScrollBloom() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let velocity = 0;
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      velocity = Math.abs(currentY - lastY);
      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      velocity *= 0.92;
      // Drawing logic...
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}`
  };

  const codeTabs = document.querySelectorAll('.code-tab');
  const codeDisplay = document.getElementById('code-display');

  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const tabKey = tab.getAttribute('data-tab');
      if (codeDisplay && codeSnippets[tabKey]) {
        codeDisplay.textContent = codeSnippets[tabKey];
      }
    });
  });

  // Copy Code Button
  const btnCopyCode = document.getElementById('btn-copy-code');
  const copyBtnText = document.getElementById('copy-btn-text');

  if (btnCopyCode) {
    btnCopyCode.addEventListener('click', () => {
      if (codeDisplay) {
        navigator.clipboard.writeText(codeDisplay.textContent).then(() => {
          copyBtnText.textContent = 'Copied!';
          btnCopyCode.style.background = 'rgba(16, 185, 129, 0.2)';
          btnCopyCode.style.borderColor = '#10b981';

          setTimeout(() => {
            copyBtnText.textContent = 'Copy Code';
            btnCopyCode.style.background = '';
            btnCopyCode.style.borderColor = '';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy code snippet:', err);
        });
      }
    });
  }

  // 6. Navbar Sticky Scroll Observer
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
});
