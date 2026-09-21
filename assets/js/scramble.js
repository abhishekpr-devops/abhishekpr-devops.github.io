/* ============================================================
   ScrambleText — GSAP-driven multi-scanner text reveal
   No plugins required. Free to use.
   ============================================================ */

(function () {
  const SCRAMBLE_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  function randChar() {
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }

  /**
   * Scramble a paragraph and progressively resolve it with
   * multiple "scanners".
   *
   * @param {HTMLElement} el       - Target paragraph
   * @param {Object}      options
   *   @param {number}  duration     - Total reveal time (ms)
   *   @param {number}  scanners     - Number of concurrent scanners
   *   @param {number}  tickMs       - Ms between letter resolves per scanner
   *   @param {boolean} respectMotion- Honor prefers-reduced-motion
   */
  function scrambleText(el, options = {}) {
    const {
      duration = 3200,
      scanners = 3,
      tickMs = 28,
      respectMotion = true,
    } = options;

    if (respectMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Leave text as-is
    }

    const original = el.textContent;         // Real target text
    const chars = original.split('');         // Target chars
    const length = chars.length;

    // Live buffer we mutate as scanners advance
    const buffer = chars.map(c => (c === ' ' ? ' ' : randChar()));

    // Current DOM rendering (monospace to prevent reflow jitter)
    el.style.fontVariantNumeric = 'tabular-nums';
    el.textContent = buffer.join('');

    // Track per-index resolution
    const resolved = new Array(length).fill(false);

    // Indices of real (non-space) characters — the "resolve targets"
    const targetIndices = [];
    for (let i = 0; i < length; i++) {
      if (chars[i] !== ' ') targetIndices.push(i);
    }

    // Shuffle a copy so scanners pick random words/positions
    const shuffled = [...targetIndices].sort(() => Math.random() - 0.5);

    // Split the shuffled indices across N scanners
    const perScanner = Math.ceil(shuffled.length / scanners);
    const scannerQueues = [];
    for (let s = 0; s < scanners; s++) {
      scannerQueues.push(shuffled.slice(s * perScanner, (s + 1) * perScanner));
    }

    // Render loop — updates DOM at a throttled rate
    let dirty = true;
    let lastRender = 0;
    const renderInterval = 40; // ms — cap DOM writes

    function flush(now) {
      if (dirty && now - lastRender > renderInterval) {
        el.textContent = buffer.join('');
        dirty = false;
        lastRender = now;
      }
    }

    // Each scanner independently advances through its queue
    function runScanner(queue) {
      if (queue.length === 0) return;

      let i = 0;
      const startTime = performance.now();

      function step() {
        const elapsed = performance.now() - startTime;

        // Resolve N letters this tick, where N scales with elapsed time
        const targetResolved = Math.floor((elapsed / duration) * queue.length);
        while (i < targetResolved && i < queue.length) {
          const idx = queue[i];
          buffer[idx] = chars[idx];
          resolved[idx] = true;
          i++;
          dirty = true;
        }

        if (i < queue.length) {
          setTimeout(step, tickMs);
        } else {
          // Final: ensure every char in this queue is resolved
          for (let j = 0; j < queue.length; j++) {
            const idx = queue[j];
            buffer[idx] = chars[idx];
          }
          dirty = true;
        }
      }

      step();
    }

    // Kick off all scanners at once
    scannerQueues.forEach(q => runScanner(q));

    // Continuous render tick via requestAnimationFrame
    function raf(now) {
      flush(now);
      if (resolved.includes(false)) {
        requestAnimationFrame(raf);
      } else {
        // Guarantee final exact text
        el.textContent = original;
      }
    }
    requestAnimationFrame(raf);
  }

  // Public API
  window.ScrambleText = { scrambleText };
})();
