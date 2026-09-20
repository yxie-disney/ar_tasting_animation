import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const target = JSON.parse(await fs.readFile('site/ar/image-targets/vertical-label.json'));
if (target.status !== 'compiled' || !(target.widthMm > 0 && target.widthPx > 0 && target.heightPx > 0)) {
 throw Error('RELEASE BLOCKED: exact vertical tie-label source and physical width are not confirmed. Do not deploy the obsolete target.');
}
for (const [file, expected] of [[target.source,target.sourceSha256],[target.compiled,target.compiledSha256]]) {
 const bytes = await fs.readFile('site/ar/' + file);
 if (createHash('sha256').update(bytes).digest('hex') !== expected) throw Error('Target checksum mismatch: ' + file);
}
console.log('Vertical target source and compiled data match recorded hashes.');
