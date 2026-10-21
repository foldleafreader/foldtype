/* Adapted from Foldleaf's reveal, scroll-linked statement and gallery controls. */
(() => {
  'use strict';
  const config = window.FOLDTYPE || {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('[data-copy]').forEach(el => {
    const copy = config.copy?.[el.dataset.copy];
    if (typeof copy === 'string') el.innerHTML = copy;
  });
  if (config.logo) document.querySelectorAll('[data-brand-image]').forEach(image => { image.src = config.logo; image.alt = ''; });
  if (/^https:\/\/apps\.apple\.com\//.test(config.appStoreUrl || '')) {
    document.querySelectorAll('[data-store-link]').forEach(link => {
      link.href = config.appStoreUrl;
      link.textContent = link.classList.contains('pill') ? 'Get the app' : 'Download on the App Store';
    });
    document.querySelectorAll('[data-coming-soon]').forEach(el => { el.hidden = true; });
  }
  if (/^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(config.supportEmail || '')) {
    document.querySelectorAll('[data-support-email]').forEach(el => {
      const link = document.createElement('a'); link.href = 'mailto:' + config.supportEmail;
      link.textContent = config.supportEmail; el.replaceChildren(link);
    });
    document.querySelectorAll('[data-support-pending]').forEach(el => { el.hidden = true; });
  }
  const makeMedia = (media, videoAllowed) => {
    if (!media?.src) return null;
    const video = videoAllowed && /\.(mp4|webm)(?:[?#]|$)/i.test(media.src);
    const el = document.createElement(video ? 'video' : 'img');
    el.src = media.src;
    if (video) {
      el.controls = true; el.playsInline = true; el.preload = 'none';
      el.className = 'media-video'; el.setAttribute('aria-label', media.alt || 'Foldtype preview');
      if (media.poster) el.poster = media.poster;
    } else {
      el.alt = media.alt || 'Foldtype'; el.loading = 'lazy'; el.decoding = 'async'; el.className = 'media-image';
    }
    return el;
  };
  [['[data-hero-media]', config.hero], ['[data-animation-slot]', config.animation]].forEach(([selector, media]) => {
    const slot = document.querySelector(selector); const element = makeMedia(media, true);
    if (slot && element) { slot.replaceChildren(element); slot.classList.add('has-media'); slot.removeAttribute('aria-label'); }
  });
  document.querySelectorAll('[data-screenshot-slot]').forEach(slot => {
    const media = config.screenshots?.[slot.dataset.screenshotSlot]; const image = makeMedia(media, false);
    if (!image) return;
    const caption = slot.querySelector('figcaption');
    slot.replaceChildren(image);
    if (caption) { caption.textContent = media.caption || media.alt || 'Foldtype'; slot.append(caption); }
    slot.classList.add('has-media');
  });
  const statement = document.querySelector('[data-statement]');
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.replaceChildren();
    words.forEach((word, i) => {
      if (i) statement.append(document.createTextNode(' '));
      const span = document.createElement('span'); span.className = 'w'; span.textContent = word; statement.append(span);
    });
  }
  // Enable animation styling only after content setup succeeds. Without JS, all content stays visible.
  document.documentElement.classList.add('js');
  const pieces = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) pieces.forEach(el => el.classList.add('in'));
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
      });
    }, {rootMargin:'0px 0px -5% 0px', threshold:0.05});
    pieces.forEach(el => observer.observe(el));
  }
  document.querySelectorAll('.paddles button').forEach(button => button.addEventListener('click', () => {
    const gallery = document.getElementById(button.dataset.for);
    if (!gallery) return;
    const start = gallery.getBoundingClientRect().left + (parseFloat(getComputedStyle(gallery).scrollPaddingLeft) || 0);
    const positions = [...gallery.children].map(child => child.getBoundingClientRect().left - start);
    const next = Number(button.dataset.dir) > 0 ? positions.find(x => x > 2) : positions.reverse().find(x => x < -2);
    if (next !== undefined) gallery.scrollBy({left:next,behavior:reduced ? 'auto' : 'smooth'});
  }));
  const fitted = () => document.querySelectorAll('.paddles').forEach(paddles => {
    const gallery = document.getElementById(paddles.querySelector('button').dataset.for);
    paddles.hidden = !gallery || gallery.scrollWidth <= gallery.clientWidth + 1;
  });
  fitted(); addEventListener('resize', fitted);
  document.querySelectorAll('.gallery img').forEach(image => image.addEventListener('load', fitted));
  if (reduced || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.statement .w').forEach(word => word.classList.add('lit')); return;
  }
  const words = [...document.querySelectorAll('.statement .w')];
  const sentence = document.querySelector('.statement');
  const scene = document.querySelector('.typewriter-scene');
  const clamp = value => Math.min(1, Math.max(0, value));
  let queued = false;
  const frame = () => {
    queued = false;
    if (scene) {
      const progress = clamp(1 - (scene.parentElement.getBoundingClientRect().top - innerHeight * .1) / (innerHeight * .65));
      scene.style.transform = `rotateX(${(1-progress)*8}deg) scale(${.96+.04*progress})`;
    }
    if (sentence) {
      const bounds = sentence.getBoundingClientRect();
      const progress = clamp((innerHeight * .78 - bounds.top) / (bounds.height * .75));
      const count = Math.round(progress * words.length);
      words.forEach((word,i) => word.classList.toggle('lit',i < count));
    }
  };
  const ask = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener('scroll',ask,{passive:true}); addEventListener('resize',ask); frame();
})();
