/* A paused-video timeline with explicit decoding startup and bounded seek recovery. */
(() => {
  'use strict';
  class FoldtypeScrubber {
    constructor(video, {onBlocked = () => {}, onReady = () => {}, now = () => performance.now(), schedule = setTimeout, cancel = clearTimeout} = {}) {
      Object.assign(this, {video, onBlocked, onReady, now, schedule, cancel});
      this.active = false; this.manual = false; this.loaded = false;
      this.primed = false; this.priming = false; this.blocked = false;
      this.progress = 0; this.pending = false; this.started = 0;
      this.retries = 0; this.reloads = 0; this.timer = null;
      video.muted = true; video.defaultMuted = true; video.playsInline = true;
      ['loadedmetadata', 'loadeddata', 'canplay', 'progress', 'durationchange'].forEach(event => {
        video.addEventListener(event, () => this.sync());
      });
      video.addEventListener('seeked', () => {
        this.pending = false; this.retries = 0; this.clearTimer(); this.sync();
      });
    }
    clearTimer() {
      if (this.timer !== null) this.cancel(this.timer);
      this.timer = null;
    }
    retrySoon() {
      if (this.timer !== null || !this.active || this.manual || this.blocked) return;
      this.timer = this.schedule(() => { this.timer = null; this.sync(); }, 150);
    }
    load() {
      if (this.loaded) return;
      this.loaded = true; this.video.preload = 'auto'; this.video.load();
    }
    setActive(active) {
      this.active = active;
      if (!active) { this.clearTimer(); this.video.pause(); }
      else this.sync();
    }
    setProgress(progress) {
      this.progress = Math.max(0, Math.min(1, progress));
      this.sync();
    }
    setManual(manual) {
      this.manual = manual; this.clearTimer();
      if (!manual) { this.video.pause(); this.sync(); }
    }
    prime(fromGesture = false) {
      if (fromGesture) {
        this.primed = false; this.blocked = false; this.pending = false;
        this.retries = 0; this.reloads = 0;
      }
      if (this.priming || this.primed || this.manual || (this.blocked && !fromGesture)) return;
      this.load(); this.blocked = false; this.priming = true;
      let playback;
      try { playback = this.video.play(); }
      catch (error) { playback = Promise.reject(error); }
      Promise.resolve(playback).then(() => {
        this.priming = false; this.primed = true;
        if (!this.manual || !this.active) this.video.pause();
        this.onReady(); this.sync();
      }).catch(error => {
        this.priming = false;
        if (!this.active || this.manual) return;
        if (error?.name === 'AbortError') this.retrySoon();
        else { this.blocked = true; this.clearTimer(); this.onBlocked(); }
      });
    }
    sync() {
      if (!this.active || this.manual || this.blocked) return;
      this.load();
      if (!Number.isFinite(this.video.duration) || (!this.primed && this.video.readyState < 2)) {
        this.retrySoon(); return;
      }
      if (!this.primed) { this.prime(); return; }
      const target = this.progress * Math.max(0, this.video.duration - .067);
      if (this.pending || this.video.seeking) {
        // A lost seeked event must not permanently lock the timeline.
        if (!this.video.seeking) this.pending = false;
        else if (this.now() - this.started < 1500) { this.retrySoon(); return; }
        else if (++this.retries > 2) {
          if (this.reloads++ === 0) {
            this.pending = false; this.loaded = false; this.primed = false;
            this.retries = 0; this.load(); this.retrySoon();
          } else {
            this.blocked = true; this.clearTimer(); this.onBlocked();
          }
          return;
        }
      }
      if (Math.abs(this.video.currentTime - target) < 1 / 30 && !this.video.seeking) {
        this.clearTimer(); return;
      }
      this.started = this.now(); this.pending = true;
      try { this.video.currentTime = target; }
      catch { this.pending = false; }
      this.retrySoon();
    }
  }
  window.FoldtypeScrubber = FoldtypeScrubber;
})();
