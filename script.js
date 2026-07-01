document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scrolled header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll reveals ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll-scrub sequence (only if present) ---------- */
  var scrub = document.querySelector('.scrub');
  if (scrub && !reduce) {
    var stage = scrub.querySelector('.scrub-stage');
    var canvas = scrub.querySelector('canvas');
    var poster = scrub.querySelector('img');
    if (stage && canvas && poster) {
      var ctx = canvas.getContext('2d');
      var total = parseInt(scrub.getAttribute('data-frames'), 10) || 0;
      var dir = scrub.getAttribute('data-dir') || '';
      var pad = parseInt(scrub.getAttribute('data-pad'), 10) || 3;
      var frames = [];
      var loaded = [];
      var lastDrawn = -1;

      function src(i) {
        var n = String(i).padStart(pad, '0');
        return dir + 'frame-' + n + '.jpg';
      }
      function load(i) {
        if (i < 1 || i > total || frames[i]) return;
        var im = new Image();
        im.onload = function () { loaded[i] = true; };
        im.src = src(i);
        frames[i] = im;
      }
      for (var i = 1; i <= Math.min(10, total); i++) load(i);
      setTimeout(function () { for (var j = 11; j <= total; j++) load(j); }, 200);

      function size() {
        var r = stage.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = r.width * dpr;
        canvas.height = r.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lastDrawn = -1;
      }
      function draw(idx) {
        var im = frames[idx];
        if (!im || !loaded[idx]) return;
        var cw = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        var ch = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
        var ir = im.width / im.height, cr = cw / ch, dw, dh, dx, dy;
        if (ir > cr) { dh = ch; dw = ch * ir; } else { dw = cw; dh = cw / ir; }
        dx = (cw - dw) / 2; dy = (ch - dh) / 2;
        ctx.drawImage(im, dx, dy, dw, dh);
        lastDrawn = idx;
        stage.classList.add('drawn');
      }
      var ticking = false;
      function update() {
        ticking = false;
        var rect = scrub.getBoundingClientRect();
        var prog = -rect.top / (scrub.offsetHeight - window.innerHeight);
        prog = Math.max(0, Math.min(1, prog));
        var idx = Math.max(1, Math.min(total, Math.round(prog * (total - 1)) + 1));
        if (loaded[idx]) draw(idx);
        else if (lastDrawn > 0) draw(lastDrawn);
      }
      function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
      size();
      var poll = setInterval(function () {
        if (loaded[1]) { draw(1); clearInterval(poll); }
      }, 60);
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', function () { size(); req(); });
    }
  }
})();