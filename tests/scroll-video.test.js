/* Run against the exported controller; no browser or network is required. */
async function testScrollVideo(FoldtypeScrubber) {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
  function fixture() {
    let time = 0, next = 0;
    const timers = new Map(), listeners = new Map();
    const video = {
      readyState:0, duration:NaN, seeking:false, paused:true, position:0,
      seeks:[], loads:0, plays:0, denied:false,
      addEventListener(name, callback) { listeners.set(name, [...(listeners.get(name) || []),callback]); },
      emit(name) { (listeners.get(name) || []).forEach(callback => callback()); },
      load() { this.loads++; this.readyState = 0; this.seeking = false; this.position = 0; },
      play() {
        this.plays++;
        if (this.denied) return Promise.reject({name:'NotAllowedError'});
        this.paused = false; return Promise.resolve();
      },
      pause() { this.paused = true; },
      get currentTime() { return this.position; },
      set currentTime(value) { this.position = value; this.seeks.push(value); this.seeking = true; },
      ready() { this.readyState = 2; this.duration = 10; this.emit('canplay'); },
      finishSeek(emit = true) { this.seeking = false; if (emit) this.emit('seeked'); }
    };
    let blocked = 0;
    const controller = new FoldtypeScrubber(video, {
      now:() => time,
      schedule:callback => { const id = ++next; timers.set(id,callback); return id; },
      cancel:id => timers.delete(id),
      onBlocked:() => blocked++
    });
    return {video,controller,blocked:() => blocked,timers,
      tick(ms = 150) { time += ms; const batch = [...timers.values()]; timers.clear(); batch.forEach(callback => callback()); }
    };
  }
  {
    const f = fixture();
    f.controller.setProgress(.5); f.controller.setActive(true);
    assert(f.video.seeks.length === 0, 'Must wait for decoded video data');
    f.video.ready(); await flush();
    assert(f.video.plays === 1 && f.video.paused, 'Initialize decoder once, then pause');
    assert(Math.abs(f.video.currentTime - 4.9665) < .001, 'Resume at current scroll position after late canplay');
    f.controller.setProgress(.9); f.controller.setProgress(.2);
    assert(f.video.seeks.length === 1, 'Do not interrupt an in-flight seek on every scroll event');
    f.video.finishSeek();
    assert(Math.abs(f.video.currentTime - 1.9866) < .001, 'After seeking, use the latest scroll target');
    f.video.finishSeek();
    assert(f.timers.size === 0, 'No idle polling once the target is displayed');
  }
  {
    const f = fixture(); f.controller.setActive(true); f.video.ready(); await flush();
    f.controller.setProgress(.5); f.video.finishSeek(false); // Browser completes without dispatching seeked.
    f.controller.setProgress(.8); f.tick();
    assert(f.video.seeks.length === 2, 'Recover when the seeked event is missing');
    f.video.readyState = 1; // Buffered data can disappear while a seek is stalled.
    f.tick(1700);
    assert(f.video.seeks.length === 3, 'Retry a seek that stays stuck');
    f.controller.setActive(false);
    assert(f.timers.size === 0 && f.video.paused, 'Cancel recovery while offscreen');
  }
  {
    const f = fixture(); f.controller.setActive(true); f.video.ready(); await flush();
    f.controller.setProgress(.5);
    for (let i = 0; i < 3; i++) f.tick(1600);
    assert(f.video.loads === 2, 'Reload the decoder once if seek retries fail');
    f.video.ready(); await flush();
    for (let i = 0; i < 3; i++) f.tick(1600);
    assert(f.blocked() === 1 && f.timers.size === 0, 'Offer a user action instead of retrying forever');
  }
  {
    const f = fixture(); f.video.denied = true; f.controller.setActive(true); f.video.ready(); await flush();
    assert(f.blocked() === 1, 'Expose an explicit action when playback requires a gesture');
    f.controller.setProgress(.7);
    assert(f.video.plays === 1, 'Do not repeatedly request blocked playback');
    f.video.denied = false; f.controller.prime(true); await flush();
    assert(f.controller.primed && !f.controller.blocked, 'A user gesture enables scroll playback');
    assert(Math.abs(f.video.currentTime - 6.9531) < .001, 'Use latest scroll position after unlocking');
    f.controller.setManual(true); const count = f.video.seeks.length;
    f.controller.setProgress(.1); f.video.finishSeek();
    assert(f.video.seeks.length === count, 'Native playback must not fight scroll seeks');
  }
  return 'PASS: loading race, decoding startup, latest-target seeking, missing/stuck seek recovery, offscreen cleanup, gesture blocking and manual playback.';
}

if (typeof module !== 'undefined' && module.exports) {
  const fs = require('node:fs');
  const path = require('node:path');
  const scope = {};
  new Function('window', fs.readFileSync(path.join(__dirname, '../scroll-video.js'), 'utf8'))(scope);
  testScrollVideo(scope.FoldtypeScrubber).then(console.log).catch(error => {
    console.error(error); process.exitCode = 1;
  });
}
