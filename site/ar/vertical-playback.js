// One timer, owned only by a currently visible image target. No transitions.
export function createTargetPlayback(frames, stage, clock = globalThis) {
  if (frames.length !== 5) throw Error('Exactly five Feifei frames required');
  let timer = null, index = 0;
  stage.visible = false;
  frames.forEach(frame => { frame.visible = false; });
  function show(next) {
    index = next;
    frames.forEach((frame, i) => { frame.visible = i === index; });
  }
  function targetFound() {
    if (timer !== null) return;
    show(0);
    stage.visible = true;
    timer = clock.setInterval(() => {
      if (timer !== null) show((index + 1) % frames.length);
    }, 1000);
  }
  function targetLost() {
    if (timer !== null) clock.clearInterval(timer);
    timer = null;
    stage.visible = false;
    frames.forEach(frame => { frame.visible = false; });
  }
  return { targetFound, targetLost, get index() { return index; } };
}
