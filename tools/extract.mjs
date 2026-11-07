// Runs the same ESPN extraction the browser used to run, in Node. Usage: node tools/extract.mjs <out.txt>
import fs from 'node:fs';
globalThis.window = {};
const src = fs.readFileSync(new URL('./extract.js', import.meta.url), 'utf8').replace(/^\s*await\s+/, '');
const res = await (0, eval)(src);
if (!window.__blob || !window.__blob.startsWith('//REFRESH-DATA-START')) throw new Error('no blob');
fs.writeFileSync(process.argv[2], window.__blob);
console.log(res);
