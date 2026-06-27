import { AppsInTossBundle } from '@apps-in-toss/ait-format';
import { readFileSync } from 'fs';

const buf = readFileSync('aissam-v1.0.0.ait');
const u8  = new Uint8Array(buf);

const fmt = AppsInTossBundle.detect(u8);
console.log('포맷:', AppsInTossBundle.isAIT(u8) ? 'AIT ✓' : 'ZIP (구버전)');

const reader = AppsInTossBundle.reader(u8);
console.log('appName   :', reader.appName);
console.log('deployId  :', reader.deploymentId);

console.log('\n번들 내 파일 목록:');
const entryNames = reader.entryNames ?? reader.fileNames ?? Object.keys(reader);
console.log(JSON.stringify(Object.keys(Object.getPrototypeOf(reader)), null, 2));

const appJsonBytes = await reader.readEntry('app.json');
console.log('\napp.json 내용:');
console.log(new TextDecoder().decode(appJsonBytes));
