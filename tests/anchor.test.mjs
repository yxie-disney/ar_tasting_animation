import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {AnchorState,targetUnitsPerMm} from '../site/anchor-state.js'
test('Requires live lock and explicit tube confirmation',()=>{const m=new AnchorState();assert.equal(m.confirm(0),false);for(let t=0;t<=400;t+=50)m.found(t);assert.equal(m.confirm(400),true);assert.equal(m.snapshot(400).playing,true)})
test('Card loss hides pose but preserves short playback permission',()=>{const m=new AnchorState();for(let t=0;t<=400;t+=50)m.found(t);m.confirm(400);m.lost();assert.equal(m.snapshot(410).visible,false);assert.equal(m.snapshot(410).confirmed,true);assert.equal(m.snapshot(410).playing,false);for(let t=500;t<=900;t+=50)m.found(t);assert.equal(m.snapshot(900).playing,true);m.lost();assert.equal(m.snapshot(2200).confirmed,false)})
test('Missing update events cannot leave stale AR displayed',()=>{const m=new AnchorState();for(let t=0;t<=400;t+=50)m.found(t);m.confirm(400);assert.equal(m.snapshot(700).visible,false);assert.equal(m.snapshot(1700).confirmed,false)})
test('Target uses portrait physical width and fixed ring offset',async()=>{const g=JSON.parse(await fs.readFile('site/geometry.json'));assert.equal(g.targetWidthMm,48);assert.equal(g.cardToTargetRotationDeg,-90);assert.equal(targetUnitsPerMm({scale:2,scaledWidth:.75},g),1.5/48);assert.ok(Math.abs(g.ringFromModuleCenterMm.y-50.95187)<.0001);assert.throws(()=>targetUnitsPerMm({scale:0,scaledWidth:1},g))})
