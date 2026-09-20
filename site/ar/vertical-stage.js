import {createSurfaceRelief} from './feifei-surface.js';

// Artwork space is always millimetres, independent of any printed target.
// Preserve the approved 80mm relief geometry and its <=3mm deformation.
export function stagePlacement(canvas) {
  const [w, h] = canvas;
  if (!(Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0)) {
    throw Error('Original image dimensions required');
  }
  const heightMm = 80;
  return {heightMm, widthMm: heightMm * w / h, depthMm: 3, frontMm: 3};
}

const assetURL = path => new URL(path, import.meta.url);
export async function createVerticalStage(THREE, renderer) {
  const manifest = await readJSON(assetURL('assets/relief/manifest.json'));
  const stage = new THREE.Group();
  stage.visible = false;
  const loader = new THREE.TextureLoader();
  const reliefs = await Promise.all(manifest.frames.map(async frame => {
    const base = `assets/relief/${frame.id}/`;
    const [source, raw, control] = await Promise.all([
      loader.loadAsync(assetURL(frame.source).href), readBytes(assetURL(base + 'ownership.u8')), readBytes(assetURL(base + 'control.rgba8')),
    ]);
    const canvas = [source.image.naturalWidth, source.image.naturalHeight];
    if (canvas.some((v, i) => v !== frame.canvas[i])) throw Error('Original image dimensions changed: ' + frame.id);
    const [width, height] = canvas;
    if (raw.length !== width * height || control.length !== frame.controlWidth * frame.controlHeight * 4) {
      throw Error('Incomplete relief data: ' + frame.id);
    }
    const bytes = new Uint8Array(raw.length * 4);
    for (let i = 0; i < raw.length; i++) { bytes[i * 4] = raw[i] || 1; bytes[i * 4 + 3] = 255; }
    const relief = createSurfaceRelief(THREE, {source, renderer, spec: frame.spec, parts: frame.parts,
      ownership: {bytes, width, height},
      field: {bytes: control, width: frame.controlWidth, height: frame.controlHeight}});
    const placement = stagePlacement(canvas);
    // Uniform XY scale preserves raster ratio. Z retains the proven <=3mm envelope.
    relief.group.scale.set(placement.heightMm / frame.spec.heightMm, placement.heightMm / frame.spec.heightMm, 1);
    relief.group.position.set(0, -placement.heightMm / 2, placement.frontMm);
    relief.group.name = frame.name;
    relief.group.visible = false;
    relief.materials.forEach(material => {
      material.transparent = true;
      material.opacity = .75;
      material.blending = THREE.NormalBlending;
      material.depthWrite = false;
      material.forceSinglePass = true;
    });
    return relief;
  }));
  reliefs.forEach(relief => stage.add(relief.group));
  const fill = new THREE.AmbientLight(0xffffff, 2.4);
  const key = new THREE.DirectionalLight(0xffffff, .65);
  key.position.set(-60, 100, 90);
  stage.add(fill, key, key.target);
  return {stage, reliefs};
}

async function readJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw Error('Missing asset: ' + url);
  return response.json();
}
async function readBytes(url) {
  const response = await fetch(url);
  if (!response.ok) throw Error('Missing asset: ' + url);
  return new Uint8Array(await response.arrayBuffer());
}
