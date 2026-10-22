/* Shared page setup, with scroll-linked films and text on the home page. */
(() => {
  'use strict';
  const config = window.FOLDTYPE || {};
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = motionQuery.matches;
  const savingData = navigator.connection?.saveData === true;
  const canObserve = 'IntersectionObserver' in window;
  const scrollFilms = !reduced && !savingData && canObserve && typeof window.FoldtypeScrubber === 'function';
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  if (config.logo) document.querySelectorAll('[data-brand-image]').forEach(image => { image.src = config.logo; });
  if (/^https:\/\/apps\.apple\.com\//.test(config.appStoreUrl || '')) {
    document.querySelectorAll('[data-store-link]').forEach(link => {
      link.href = config.appStoreUrl;
      link.textContent = link.classList.contains('pill') ? 'Get the app' : 'Download on the App Store';
    });
    document.querySelectorAll('[data-coming-soon]').forEach(el => { el.hidden = true; });
  }
  if (/^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(config.supportEmail || '')) {
    document.querySelectorAll('[data-support-email]').forEach(el => {
      const link = document.createElement('a');
      link.href = 'mailto:' + config.supportEmail;
      link.textContent = config.supportEmail;
      el.replaceChildren(link);
    });
    document.querySelectorAll('[data-support-pending]').forEach(el => { el.hidden = true; });
  }

  const pieces = document.querySelectorAll('.reveal');
  if (reduced || !canObserve) pieces.forEach(el => el.classList.add('in'));
  else {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); reveal.unobserve(entry.target); }
    }), {rootMargin:'0px 0px -4% 0px', threshold:0.05});
    pieces.forEach(el => reveal.observe(el));
  }
  document.documentElement.classList.add('js');
  if (!document.body.classList.contains('scroll-home')) return;

  const clamp = value => Math.max(0, Math.min(1, value));
  const inkBlocks = [];
  if (!reduced && canObserve) document.querySelectorAll('[data-ink]').forEach(element => {
    // Walk text nodes so line breaks and any inline markup retain their meaning.
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const words = [];
    nodes.forEach(node => {
      const fragment = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).filter(Boolean).forEach(part => {
        if (/^\s+$/.test(part)) fragment.append(document.createTextNode(part));
        else {
          const word = document.createElement('span');
          word.className = 'scroll-word'; word.textContent = part;
          fragment.append(word); words.push(word);
        }
      });
      node.replaceWith(fragment);
    });
    inkBlocks.push({element, words});
  });

  let queued = false;
  const measureHeader = () => document.querySelector('.topbar')?.getBoundingClientRect().height || 64;
  let headerHeight = measureHeader();
  const requestFrame = () => {
    if (!queued) { queued = true; requestAnimationFrame(frame); }
  };
  const films = [...document.querySelectorAll('[data-film]')].map(section => {
    const video = section.querySelector('video');
    const button = section.querySelector('[data-film-toggle]');
    const view = section.querySelector('.film-view');
    section.style.setProperty('--film-travel', `${Number(section.dataset.travel) || 160}svh`);
    const state = {section, video, button, view, manual:!scrollFilms, visible:false, needsGesture:false};
    video.muted = true;
    video.controls = !scrollFilms;
    button.hidden = !scrollFilms;
    if (!scrollFilms) section.classList.add('manual-film');
    state.scrubber = typeof window.FoldtypeScrubber === 'function' ? new window.FoldtypeScrubber(video, {
      onBlocked: () => {
        state.needsGesture = true; button.hidden = false; button.textContent = 'Enable animation';
      },
      onReady: () => {
        state.needsGesture = false;
        button.textContent = state.manual ? 'Use scroll animation' : 'Play video';
        requestFrame();
      }
    }) : null;
    state.scrubber?.setManual(state.manual);
    state.load = () => state.scrubber?.load();
    video.addEventListener('error', () => {
      // Native playback exposes any media error and avoids a trapped, empty scroll track.
      state.manual = true; video.controls = true; button.hidden = true;
      state.scrubber?.setManual(true);
      section.classList.add('manual-film');
      view.style.transform = ''; view.style.opacity = '';
    });
    button.addEventListener('click', () => {
      if (state.needsGesture) { state.scrubber?.prime(true); return; }
      state.manual = !state.manual;
      state.scrubber?.setManual(state.manual);
      video.controls = state.manual;
      view.classList.toggle('is-playing', state.manual);
      button.textContent = state.manual ? 'Use scroll animation' : 'Play video';
      if (state.manual) {
        state.load();
        video.play().catch(() => { /* The visible native play control remains available. */ });
      } else {
        video.pause(); requestFrame();
      }
    });
    return state;
  });
  document.body.classList.add(scrollFilms ? 'has-scroll-films' : 'static-films');
  if (scrollFilms) {
    const nearby = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      films.find(state => state.section === entry.target)?.load();
      nearby.unobserve(entry.target);
    }), {rootMargin:'100% 0px',threshold:0});
    films.forEach(state => nearby.observe(state.section));
  }

  function frame() {
    queued = false;
    const viewport = innerHeight;
    inkBlocks.forEach(({element,words}) => {
      const rect = element.getBoundingClientRect();
      const progress = clamp((viewport * .84 - rect.top) / Math.max(rect.height + viewport * .25, 1));
      words.forEach((word,index) => {
        const amount = clamp(progress * (words.length + 1) - index);
        word.style.setProperty('--word-opacity', String(.18 + .82 * amount));
      });
    });
    films.forEach(state => {
      const rect = state.section.getBoundingClientRect();
      state.visible = rect.top < viewport && rect.bottom > headerHeight;
      const progress = clamp((headerHeight - rect.top) / Math.max(1, rect.height - viewport + headerHeight));
      state.scrubber?.setProgress(progress);
      state.scrubber?.setActive(state.visible && !document.hidden);
      if (!state.visible && !state.video.paused) state.video.pause();
      if (!scrollFilms || state.section.classList.contains('manual-film')) return;
      if (state.visible) {
        const entry = clamp((viewport - rect.top) / (viewport - headerHeight));
        const exit = clamp((rect.bottom - headerHeight) / (viewport - headerHeight));
        const exposure = Math.min(entry,exit);
        state.view.style.transform = `translateY(${(1-exposure)*20}px) scale(${.96+.04*exposure})`;
        state.view.style.opacity = String(.25+.75*exposure);
      }
    });
  }
  addEventListener('scroll', requestFrame, {passive:true});
  addEventListener('resize', () => {
    headerHeight = measureHeader();
    requestFrame();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) films.forEach(state => { state.scrubber?.setActive(false); state.video.pause(); });
    else requestFrame();
  });
  motionQuery.addEventListener('change', event => {
    if (!event.matches) return; // Re-enabling motion takes effect on the next visit.
    document.body.classList.remove('has-scroll-films');
    document.body.classList.add('static-films');
    films.forEach(state => {
      state.manual = true; state.video.pause(); state.video.controls = true;
      state.scrubber?.setManual(true);
      state.section.classList.add('manual-film'); state.button.hidden = true;
      state.view.style.transform = ''; state.view.style.opacity = '';
    });
    inkBlocks.forEach(({words}) => words.forEach(word => word.style.setProperty('--word-opacity','1')));
    inkBlocks.length = 0;
    pieces.forEach(el => el.classList.add('in'));
  });
  addEventListener('pageshow', requestFrame);
  document.fonts?.ready.then(requestFrame);
  frame();
})();
