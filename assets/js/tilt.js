/* ============================================================
   3D Tilt Cards — GSAP-powered mouse-reactive perspective
   Zero dependencies beyond GSAP (already loaded via CDN).
   Auto-disables on touch devices and prefers-reduced-motion.
   ============================================================ */

(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced || !hasHover) return;

  const MAX_TILT = 8;        // degrees — keep it subtle
  const SCALE = 1.015;       // slight lift
  const GLARE_OPACITY = 0.12;
  const SETTLE_MS = 500;     // spring-back duration

  function attachTilt(card) {
    if (!card.querySelector('.tilt-glare')) {
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
    }
    const glare = card.querySelector('.tilt-glare');

    let raf = null;
    let targetX = 0;
    let targetY = 0;

    function update() {
      raf = null;
      gsap.to(card, {
        rotationY: targetX,
        rotationX: -targetY,
        scale: SCALE,
        transformPerspective: 900,
        transformOrigin: 'center',
        duration: 0.5,
        ease: 'power2.out',
      });
    }

    function onMove(e) {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);   // -1 .. 1
      const dy = (e.clientY - cy) / (rect.height / 2);  // -1 .. 1

      targetX = dx * MAX_TILT;
      targetY = dy * MAX_TILT;

      const gx = ((e.clientX - rect.left) / rect.width) * 100;
      const gy = ((e.clientY - rect.top) / rect.height) * 100;
      glare.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${GLARE_OPACITY}), transparent 55%)`;

      if (!raf) raf = requestAnimationFrame(update);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        duration: SETTLE_MS / 1000,
        ease: 'elastic.out(1, 0.6)',
      });
      glare.style.background = 'transparent';
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
  }

  function initTilt() {
    document.querySelectorAll('.project-card, .skill-card, .info-block').forEach(attachTilt);
  }

  window.addEventListener('content-ready', initTilt);
  if (document.readyState === 'complete') {
    setTimeout(initTilt, 400);
  }
})();
