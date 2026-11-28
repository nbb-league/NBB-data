// Prints "<games in progress> <games starting within 10 min>" from ESPN's NBA scoreboard; "-1 0" when ESPN can't be read.
const U = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
for (let i = 0; i < 3; i++) {
  try {
    const r = await fetch(U, { headers: { 'user-agent': 'Mozilla/5.0' } }); if (!r.ok) throw new Error(r.status);
    const ev = (await r.json()).events || []; let live = 0, soon = 0; const now = Date.now();
    for (const e of ev) {
      const st = e.status && e.status.type && e.status.type.state;
      if (st === 'in') live++; else if (st === 'pre') { const t = Date.parse(e.date); if (t - now < 10 * 60e3 && t - now > -3600e3) soon++; }
    }
    console.log(live + ' ' + soon); process.exit(0);
  } catch (e) { await new Promise(r => setTimeout(r, 2000)); }
}
console.log('-1 0');
