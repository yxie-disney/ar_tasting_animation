import test from 'node:test';
import assert from 'node:assert/strict';
import {createXR8Anchor} from '../site/ar/xr8-anchor.js';
import {createTargetPlayback} from '../site/ar/vertical-playback.js';

function fixture() {
  const jobs = new Map(); let id = 0;
  const frames = Array.from({length:5}, () => ({visible:false}));
  const stage = {visible:false};
  const playback = createTargetPlayback(frames, stage, {
    setInterval(fn, ms) { assert.equal(ms,1000); jobs.set(++id,fn); return id; },
    clearInterval(key) { jobs.delete(key); },
  });
  const vector = () => ({set(...values) { this.values = values; }});
  const anchor = {visible:false,position:vector(),quaternion:vector(),scale:{setScalar(value){this.value=value;}}};
  const tracker = createXR8Anchor(anchor,[{name:'label',widthMm:50}],playback);
  const event = {detail:{name:'label',position:{x:1,y:2,z:3},rotation:{x:0,y:0,z:0,w:1},scale:2,scaledWidth:.025}};
  return {tracker,event,anchor,stage,jobs,frames};
}

test('XR8 width calibration makes local 0.015 metres equal 15mm, without changing the content transform', () => {
  const f=fixture();f.tracker.found(f.event);
  assert.equal(f.anchor.scale.value,1);
  assert.deepEqual(f.anchor.position.values,[1,2,3]);
  assert.deepEqual(f.anchor.quaternion.values,[0,0,0,1]);
  assert.equal(f.stage.visible,true);assert.equal(f.jobs.size,1);
});
test('XR8 updates never start playback; found is idempotent; lost hides and clears immediately', () => {
  const f=fixture();f.tracker.updated(f.event);assert.equal(f.jobs.size,0);
  f.tracker.found(f.event);f.tracker.found(f.event);f.tracker.updated(f.event);
  assert.equal(f.jobs.size,1);
  f.tracker.lost({detail:{name:'other'}});assert.equal(f.jobs.size,1);
  f.tracker.lost(f.event);
  assert.equal(f.jobs.size,0);assert.equal(f.anchor.visible,false);assert.equal(f.stage.visible,false);
  assert.ok(f.frames.every(frame=>!frame.visible));
  f.tracker.updated(f.event);assert.equal(f.jobs.size,0);
});
test('unknown and invalid XR8 poses cannot start content; backgrounding clears active state', () => {
  const f=fixture();f.tracker.found({detail:{...f.event.detail,name:'other'}});
  f.tracker.found({detail:{...f.event.detail,scale:NaN}});assert.equal(f.jobs.size,0);
  f.tracker.found(f.event);f.tracker.reset();assert.equal(f.jobs.size,0);
  f.tracker.found(f.event);assert.equal(f.jobs.size,1);
});
