import {createVerticalStage} from './vertical-stage.js';
import {createTargetPlayback} from './vertical-playback.js';
import {createXR8Anchor} from './xr8-anchor.js';

const THREE = window.THREE;
let playback, tracker, content, stopped = false;

function stop() {
  stopped = true;
  playback?.targetLost();
  window.XR8?.stop();
}

async function start() {
  await new Promise(resolve => {
    if (window.XR8?.XrController) resolve();
    else window.addEventListener('xrloaded', resolve, {once: true});
  });
  const specsResponse = await fetch('targets.json');
  if (!specsResponse.ok) throw Error('Missing XR8 target configuration');
  const specs = await specsResponse.json();
  const targets = await Promise.all(specs.map(async spec => {
    const response = await fetch(spec.file);
    if (!response.ok) throw Error('Missing XR8 target: ' + spec.file);
    const target = await response.json();
    target.imagePath = new URL(target.imagePath, document.baseURI).href;
    return target;
  }));
  content = await createVerticalStage(THREE);
  if (stopped) return;
  playback = createTargetPlayback(content.reliefs.map(r => r.group), content.stage);
  // Keep original relief geometry in millimetres; the stage uses metres.
  const millimetres = new THREE.Group();
  millimetres.scale.setScalar(.001);
  millimetres.add(content.stage);
  const slideshow = new THREE.Group();
  slideshow.position.set(0, 0, 0.015);
  slideshow.add(millimetres);
  const anchor = new THREE.Group();
  anchor.visible = false;
  anchor.add(slideshow);
  tracker = createXR8Anchor(anchor, specs, playback);

  // Image-only tracking: no world-persistence or additional motion permission.
  XR8.XrController.configure({disableWorldTracking: true, imageTargetData: targets});
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
    {
      name: 'noterday-feifei',
      onStart: () => {
        const {scene, renderer} = XR8.Threejs.xrScene();
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        scene.add(anchor);
      },
      onUpdate: () => {
        if (content.stage.visible) content.reliefs[playback.index].update(performance.now() / 1000);
      },
      onException: error => { stop(); console.error(error); },
      listeners: [
        {event: 'reality.imagefound', process: tracker.found},
        {event: 'reality.imageupdated', process: tracker.updated},
        {event: 'reality.imagelost', process: tracker.lost},
      ],
    },
  ]);
  const canvas = document.querySelector('#camera');
  await XR8.run({canvas, allowedDevices: XR8.XrConfig.device().ANY,
    cameraConfig: {direction: XR8.XrConfig.camera().BACK}});
}

start().catch(error => { stop(); console.error(error); });
window.addEventListener('pagehide', stop);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    tracker?.reset();
    window.XR8?.pause();
  } else if (!stopped) window.XR8?.resume();
});
