import { AppsInTossBundle } from '@apps-in-toss/ait-format';
import { PlatformType } from '@apps-in-toss/ait-format-proto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const DIST_DIR = 'dist';
const OUTPUT = 'aissam-v1.0.0.ait';
const APP_NAME = 'aissam';

// app.json: granite.config.ts 의 값을 그대로 반영
const APP_JSON = {
  appName: APP_NAME,
  displayName: 'AI쌤',
  primaryColor: '#3182f6',
  version: '1.0.0',
  platform: 'WEB',
  entryPage: 'index.html',
  permissions: [],
};

function collectFiles(dir, base = dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel  = relative(base, full).replace(/\\/g, '/');
    if (statSync(full).isDirectory()) {
      result.push(...collectFiles(full, base));
    } else {
      result.push({ path: rel, data: readFileSync(full) });
    }
  }
  return result;
}

const files = collectFiles(DIST_DIR);

const writer = AppsInTossBundle.writer({
  appName: APP_NAME,
  createdBy: 'aissam-build/1.0.0',
});

writer.setMetadata({
  isGame: false,
  platform: PlatformType.WEB,
  sdkVersion: '2.0.0',
  bundleFiles: files.map(f => f.path),
  packageJson: APP_JSON,
});

// app.json 포함
writer.addFile('app.json', new TextEncoder().encode(JSON.stringify(APP_JSON, null, 2)));

// dist 내 모든 파일 추가
for (const { path, data } of files) {
  writer.addFile(path, new Uint8Array(data), { compress: true });
  console.log(`  + ${path} (${(data.length / 1024).toFixed(1)} KB)`);
}

const buffer = await writer.toBuffer();
writeFileSync(OUTPUT, buffer);

const sizeKB = (buffer.length / 1024).toFixed(1);
console.log(`\n✓ ${OUTPUT} 생성 완료 (${sizeKB} KB)`);
console.log(`  포함 파일: ${files.length + 1}개 (app.json 포함)`);
