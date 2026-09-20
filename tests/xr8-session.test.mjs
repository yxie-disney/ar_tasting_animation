import test from 'node:test';
import assert from 'node:assert/strict';
import {startXR8Session} from '../site/ar/xr8-session.js';
function fixture(mobile,errors=[]){
 const modes=[],configs=[];let runs=0,stops=0,clears=0;
 const XR8={XrDevice:{isDeviceBrowserCompatible:()=>mobile},XrConfig:{device:()=>({MOBILE:'mobile',ANY:'any'}),camera:()=>({BACK:'back'})},
 XrController:{configure:c=>configs.push(c)},addCameraPipelineModules:()=>{},
 run:async()=>{const e=errors[runs++];if(e)throw e;},stop:()=>stops++,clearCameraPipelineModules:()=>clears++};
 const options={canvas:{},targets:[{name:'tie-label'}],modules:mode=>{modes.push(mode);return[];}};
 return {XR8,options,modes,configs,get runs(){return runs;},get stops(){return stops;},get clears(){return clears;}};
}
test('mobile enables world tracking; desktop retains the proven image-only camera pipeline',async()=>{
 for(const mobile of [true,false]){const f=fixture(mobile);await startXR8Session(f.XR8,f.options);assert.deepEqual(f.modes,[mobile]);assert.equal(f.configs[0].disableWorldTracking,!mobile);assert.equal(f.runs,1);}
});
test('motion/session unavailability falls back once, clearing the old pipeline',async()=>{
 const f=fixture(true,[Error('MISSING_DEVICE_ORIENTATION')]);await startXR8Session(f.XR8,f.options);
 assert.deepEqual(f.modes,[true,false]);assert.equal(f.runs,2);assert.equal(f.stops,1);assert.equal(f.clears,1);
});
test('camera denial, arbitrary errors and failed fallback are never retried indefinitely',async()=>{
 for(const errors of [[Error('NotAllowedError: camera denied')],[Error('Shader compile error')],[Error('No valid session manager'),Error('No valid session manager')]]){
 const f=fixture(true,errors);await assert.rejects(startXR8Session(f.XR8,f.options));assert.equal(f.runs,errors.length);}
});
test('page exit prevents a new camera session',async()=>{
 const f=fixture(true);f.options.isStopped=()=>true;await startXR8Session(f.XR8,f.options);assert.equal(f.runs,0);
});
