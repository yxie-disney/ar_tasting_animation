import {createVerticalStage} from './vertical-stage.js';
import {createTargetPlayback} from './vertical-playback.js';
import {createXR8Anchor} from './xr8-anchor.js';

const THREE = window.THREE;
let playback, tracker, content, stopped = false;
const canvas = document.querySelector('#camera');
function resizeCanvas() {
  canvas.width = Math.max(1, Math.round(canvas.clientWidth));
  canvas.height = Math.max(1, Math.round(canvas.clientHeight));
}

function stop() {
  stopped = true;
  playback?.targetLost();
  window.removeEventListener('resize', resizeCanvas);
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
  anchor.name = 'feifei-anchor';
  content.stage.name = 'feifei-stage';
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
        const {scene, camera, renderer} = XR8.Threejs.xrScene();
        // XR8 owns the drawing buffer, viewport and projection together.
        // Do not overwrite its dimensions or DPR after pipeline initialization.
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        scene.add(anchor);
        // XR8 responsive scale uses origin.y; zero collapses image poses.
        camera.position.set(0, 2, 0);
        XR8.XrController.updateCameraProjectionMatrix({origin:camera.position, facing:camera.quaternion});
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
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
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
