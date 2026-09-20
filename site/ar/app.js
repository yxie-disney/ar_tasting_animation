import * as THREE from 'three';
import {MindARThree} from 'mindar-image-three';
import {createVerticalStage} from './vertical-stage.js';
import {createTargetPlayback} from './vertical-playback.js';

const entry = document.querySelector('#entry');
const message = document.querySelector('#entry-message');
const startButton = document.querySelector('#start');
let ar, playback, anchor, targetURL;

function stop() {
  playback?.targetLost();
  if (anchor) { anchor.onTargetFound = null; anchor.onTargetLost = null; }
  if (targetURL) { URL.revokeObjectURL(targetURL); targetURL = null; }
  if (!ar) return;
  ar.renderer.setAnimationLoop(null);
  ar.controller?.stopProcessVideo();
  ar.video?.srcObject?.getTracks().forEach(track => track.stop());
}

try {
  const response = await fetch('image-targets/vertical-label.json');
  if (!response.ok) throw Error('吊牌定位文件缺失');
  const target = await response.json();
  if (target.status !== 'compiled' || !(target.widthMm > 0)) {
    throw Error('竖直吊牌原图与实测宽度尚待确认，本地版本未开放识别。');
  }
  const compiled = await fetch(target.compiled);
  if (!compiled.ok) throw Error('吊牌定位数据尚未生成');
  targetURL = URL.createObjectURL(await compiled.blob());
  ar = new MindARThree({container: document.querySelector('#camera'), imageTargetSrc: targetURL,
    maxTrack: 1, warmupTolerance: 1, missTolerance: 0,
    uiLoading: 'no', uiScanning: 'no', uiError: 'no'});
  ar.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  ar.renderer.outputColorSpace = THREE.SRGBColorSpace;
  anchor = ar.addAnchor(0);
  const {stage, reliefs} = await createVerticalStage(THREE, ar.renderer);
  // Tracking-unit conversion belongs to the adapter, NEVER to artwork sizing.
  const millimetres = new THREE.Group();
  millimetres.scale.setScalar(1 / target.widthMm);
  millimetres.add(stage);
  anchor.group.add(millimetres);
  playback = createTargetPlayback(reliefs.map(relief => relief.group), stage);
  anchor.onTargetFound = playback.targetFound;
  anchor.onTargetLost = playback.targetLost;
  await ar.start();
  URL.revokeObjectURL(targetURL);
  targetURL = null;
  entry.hidden = true;
  ar.renderer.setAnimationLoop(time => {
    if (stage.visible) reliefs[playback.index].update(time / 1000);
    ar.renderer.render(ar.scene, ar.camera);
  });
} catch (error) {
  stop();
  message.textContent = error?.message || '相机未能开启，请允许相机权限后重新打开。';
  if (ar) { startButton.hidden = false; startButton.onclick = () => location.reload(); }
}
window.addEventListener('pagehide', stop);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
  else if (ar) location.reload();
});
