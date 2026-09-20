// One visible-playback timer. Brief unsafe tracking pauses retain the frame;
// terminal loss ends the session. No transitions or hidden playback interval.
export function createTargetPlayback(frames, stage, clock = globalThis) {
  if (frames.length !== 5) throw Error('Exactly five Feifei frames required');
  let timer = null, index = 0, started = false, generation = 0;
  stage.visible = false;
  frames.forEach(frame => { frame.visible = false; });
  function show(next) {
    index = next;
    frames.forEach((frame, i) => { frame.visible = i === index; });
  }
  function targetFound() {
    if (timer !== null) return;
    show(started ? index : 0);
    started = true;
    stage.visible = true;
    const token = ++generation;
    timer = clock.setInterval(() => {
      if (timer !== null && token === generation) show((index + 1) % frames.length);
    }, 1000);
  }
  function suspend() {
    generation++;
    if (timer !== null) clock.clearInterval(timer);
    timer = null;
    stage.visible = false;
    frames.forEach(frame => { frame.visible = false; });
  }
  function targetLost() { suspend(); started = false; index = 0; }
  return { targetFound, targetLost, suspend, get index() { return index; } };
}
