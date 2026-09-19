import test from 'node:test';
import assert from 'node:assert/strict';
import {ExperienceState,classifyOccupancy,scaleFromTarget,occupancyEvidence} from '../site/v3/tracking.js';
test('empty card never starts',()=>{const s=new ExperienceState();for(let t=0;t<3000;t+=150){s.image(t);s.evidence(false,t);assert.equal(s.tick(t).visible,false);}});
test('persistent broad tube evidence starts without a click',()=>{const s=new ExperienceState();for(let t=0;t<=600;t+=150){s.image(t);s.evidence(true,t);s.tick(t);}assert.equal(s.tick(610).visible,true);});
test('brief evidence loss retains timeline; extended removal stops',()=>{const s=new ExperienceState();for(let t=0;t<=750;t+=150){s.image(t);s.evidence(true,t);s.tick(t);}s.image(1200);s.evidence(false,1200);assert.equal(s.tick(1200).visible,true);s.image(2600);s.evidence(false,2600);assert.equal(s.tick(2600).visible,false);});
test('lost image hides untracked scene without restarting its timeline',()=>{const s=new ExperienceState();for(let t=0;t<=600;t+=150){s.image(t);s.evidence(true,t);s.tick(t);}const before=s.progressMs;s.lost();assert.equal(s.tick(750).visible,false);s.image(850);s.evidence(true,850);assert.equal(s.tick(850).visible,true);assert.ok(s.progressMs>=before);});
test('missing or tiny occupancy is rejected',()=>{const rows=Array.from({length:33},(_,i)=>({y:-120+i*6,valid:9,dark:0}));assert.equal(classifyOccupancy(rows).present,false);rows.slice(2,6).forEach(r=>r.dark=8);assert.equal(classifyOccupancy(rows).present,false);assert.equal(classifyOccupancy(rows.slice(0,4)).present,false);});
test('separated dark tube ends with a light label are accepted',()=>{const rows=Array.from({length:33},(_,i)=>({y:-120+i*6,valid:9,dark:i<7||i>25?7:0}));assert.equal(classifyOccupancy(rows).present,true);});
test('physical scale rejects malformed tracking events',()=>{assert.equal(scaleFromTarget({scale:1,scaledWidth:1.8}),.01);assert.equal(scaleFromTarget({}),null);});

function armed(worldEnabled=true){const s=new ExperienceState({worldEnabled});for(let t=0;t<=600;t+=150){s.image(t);s.world('NORMAL',t);s.evidence(true,t);s.tick(t);}return s;}
test('valid world tracking carries a confirmed card for a full reading interval after marker loss',()=>{
 const s=armed();s.lost();
 for(let t=750;t<60750;t+=150){s.world('NORMAL',t);s.evidence(null,t);const result=s.tick(t);assert.equal(result.image,false);assert.equal(result.world,true);assert.equal(result.visible,true);}
});
test('world tracking alone can never start empty-card content or establish a missing image anchor',()=>{
 const s=new ExperienceState({worldEnabled:true});for(let t=0;t<3000;t+=150){s.world('NORMAL',t);s.evidence(null,t);assert.equal(s.tick(t).visible,false);}
 const empty=new ExperienceState({worldEnabled:true});for(let t=0;t<3000;t+=150){empty.image(t);empty.world('NORMAL',t);empty.evidence(false,t);assert.equal(empty.tick(t).visible,false);}
});
test('out-of-frame evidence is unknown, while observable removal still stops world-anchored content',()=>{
 assert.equal(occupancyEvidence({present:false,reason:'out-of-frame'}),null);
 assert.equal(occupancyEvidence({present:false,reason:'too-dark'}),null);
 assert.equal(occupancyEvidence({present:false,reason:'no-tube-evidence'}),false);
 const s=armed();s.lost();for(let t=750;t<3000;t+=150){s.world('NORMAL',t);s.evidence(false,t);s.tick(t);}assert.equal(s.tick(3000).visible,false);
});
test('lost or stale world tracking hides content; NORMAL alone cannot revive an invalidated anchor',()=>{
 const s=armed();s.lost();s.world('LIMITED',800);assert.equal(s.tick(800).visible,false);
 s.world('NORMAL',900);assert.equal(s.tick(900).visible,false);
 s.image(1000);s.world('NORMAL',1000);assert.equal(s.tick(1000).visible,true);
 s.lost();assert.equal(s.tick(1600).visible,false);
 s.world('NORMAL',1700);assert.equal(s.tick(1700).visible,false);
});
test('image-only compatibility fallback does not pretend to have persistent world tracking',()=>{
 const s=armed(false);s.lost();s.world('NORMAL',800);assert.equal(s.tick(800).visible,false);
});
test('a pre-loss image still inside the freshness window cannot re-seed a recovered world map',()=>{
 const s=armed();s.world('LIMITED',650);s.tick(650);s.world('NORMAL',700);
 assert.equal(s.tick(700).world,false);
 s.image(720);s.world('NORMAL',720);assert.equal(s.tick(720).world,true);
});
