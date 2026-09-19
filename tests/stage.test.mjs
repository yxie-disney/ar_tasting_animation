import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGE} from '../site/ar/stage.js';
import {CARD_SPEC} from '../site/ar/tasting-card.js';

test('approved stage is locked for the current card and future animation',()=>{
 assert.deepEqual(STAGE,{
  widthMm:144,heightMm:144*2480/1122,baseHeightMm:35,centerX:55,centerY:-18,
  tubeLengthMm:215,tubeRadiusMm:14.5,right:[0,-1,0],up:[0,0,1],front:[-1,0,0]
 });
 assert.ok(Object.isFrozen(STAGE));
 for(const axis of ['right','up','front'])assert.ok(Object.isFrozen(STAGE[axis]));
 for(const [key,value] of Object.entries(STAGE))assert.deepEqual(CARD_SPEC[key],value);
});
