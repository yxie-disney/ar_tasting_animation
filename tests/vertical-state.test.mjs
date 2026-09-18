import {test} from 'node:test'
import assert from 'node:assert/strict'
import {TrackingState,scaleFromTarget} from '../site/v3/state.js'
import {fitTube} from '../site/v3/registration.js'
test('registration supports tube below the printed card',()=>{const r=fitTube([0,-160,14.5],[0,55,14.5]);assert.deepEqual(r.base,[0,-160,14.5]);assert.deepEqual(r.cap,[0,55,14.5])})
test('registration supports lateral shift and in-plane lean without rescaling tube',()=>{const r=fitTube([20,-170,14.5],[35,44,14.5]);assert.ok(Math.abs(Math.hypot(...r.cap.map((x,i)=>x-r.base[i]))-215)<1e-8);assert.equal(r.base[2],14.5)})
test('gross misclicks and reversed ends do not establish registration',()=>{assert.throws(()=>fitTube([0,0,14.5],[0,5,14.5]));assert.throws(()=>fitTube([0,100,14.5],[0,-115,14.5]));assert.throws(()=>fitTube([NaN,0,14.5],[0,215,14.5]))})
test('card acquisition and physical scale',()=>{const s=new TrackingState();s.found(10);assert.equal(s.snapshot(100).source,'card');assert.equal(scaleFromTarget({scale:2,scaledWidth:1},180),1/90)})
test('image loss does not terminate a healthy world anchor',()=>{const s=new TrackingState();s.found(10);s.world('NORMAL',5000);s.lost();assert.equal(s.snapshot(5100).source,'world');assert.equal(s.snapshot(5100).visible,true)})
test('no world anchor fabricated before first card acquisition',()=>{const s=new TrackingState();s.world('NORMAL',10);assert.equal(s.snapshot(100).visible,false)})
test('stale or limited world pose hides, reacquisition recovers',()=>{const s=new TrackingState();s.found(10);s.lost();s.world('LIMITED',30);assert.equal(s.snapshot(40).visible,false);s.found(50);assert.equal(s.snapshot(60).visible,true);s.lost();s.world('NORMAL',100);assert.equal(s.snapshot(601).visible,false)})
