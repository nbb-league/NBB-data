// Pulls player birth dates from ESPN's public NBA rosters and merges them into data/ages.json ({normalized name: "YYYY-MM-DD"}).
// Keeps old entries when ESPN does not return a player, and never overwrites the file with an empty result.
import fs from 'node:fs';
const OUT = new URL('../data/ages.json', import.meta.url), asof = new Date().toISOString().slice(0, 10);
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s*\(from [^)]*\)\s*$/, '').toLowerCase().replace(/[.']/g, '').replace(/\s+/g, ' ').trim();
let old = {}; try { old = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {}
const got = {}; let teams = 0;
const walk = (a, f) => { (Array.isArray(a) ? a : []).forEach(x => { if (x && Array.isArray(x.items)) walk(x.items, f); else if (x) f(x); }); };
async function team(id) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/' + id + '/roster', { headers: { 'user-agent': 'Mozilla/5.0' } });
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); let n = 0;
      walk(j.athletes, x => {
        const name = x.fullName || x.displayName; if (!name) return;
        const dob = x.dateOfBirth ? String(x.dateOfBirth).slice(0, 10) : null;
        if (dob && /^\d{4}-\d\d-\d\d$/.test(dob)) { got[norm(name)] = dob; n++; }
        else if (typeof x.age === 'number') { const d = new Date(); d.setUTCFullYear(d.getUTCFullYear() - x.age); got[norm(name)] = x.age; n++; }
      });
      if (n) teams++; return;
    } catch (e) { await new Promise(r => setTimeout(r, 1500)); }
  }
}
for (let id = 1; id <= 30; id++) await team(id);
console.log('teams with players:', teams, 'players:', Object.keys(got).length);
if (Object.keys(got).length < 150) { console.log('too few players; leaving data/ages.json untouched'); process.exit(0); }
const out = Object.assign({}, old, got);
// Numeric entries are ages as of the file's asof date (used only when ESPN gave no birth date).
fs.writeFileSync(OUT, JSON.stringify(out, Object.keys(out).sort()) + '\n');
console.log('wrote', Object.keys(out).length);
