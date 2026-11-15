import fs from 'node:fs';
const L='https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2027/segments/0/leagues/948';
const J=async u=>(await fetch(u)).json();
const out={};
out.at=new Date().toISOString();
const d0=Date.UTC(2026,9,26);const now=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles'}));const days=Math.round((Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())-d0)/864e5);
const cur=14+(days-7);out.cur=cur;
for (const sp of [cur]) {
  const j=await J(L+'?view=mMatchup&view=mBoxscore&view=mRoster&scoringPeriodId='+sp);
  out['sp'+sp]=(j.schedule||[]).filter(m=>m.matchupPeriodId===3).map(m=>[m.home,m.away].map(x=>{
    const pb=x.pointsByScoringPeriod||{};
    const ros=(x.rosterForCurrentScoringPeriod&&x.rosterForCurrentScoringPeriod.entries)||[];
    return {team:x.teamId,totalPoints:x.totalPoints,pbsp:pb,rosterSlotsPts:+ros.filter(e=>e.lineupSlotId<13).reduce((a,e)=>a+((e.playerPoolEntry&&e.playerPoolEntry.appliedStatTotal)||0),0).toFixed(2),n:ros.length};
  }));
}
fs.mkdirSync('out',{recursive:true});fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out).slice(0,1500));
try{
 const s=await J(L+'?view=mSettings'); const ss=s.settings.scheduleSettings||{};
 out.sched={matchupPeriodCount:ss.matchupPeriodCount,matchupPeriods:ss.matchupPeriods,playoffTeamCount:ss.playoffTeamCount,playoffMatchupPeriodLength:ss.playoffMatchupPeriodLength,playoffSeedingRule:ss.playoffSeedingRule,seedTie:ss.playoffSeedingRuleBy,regularSeasonMatchupPeriodCount:s.settings.scheduleSettings&&ss.regularSeasonMatchupPeriodCount, finalScoringPeriod:s.status&&s.status.finalScoringPeriod, firstScoringPeriod:s.status&&s.status.firstScoringPeriod};
 const B='https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2027';
 const pts=(await J(B+'?view=proTeamSchedules_wl')).settings.proTeams; const ab=t=>t.abbrev;
 out.fullsch=pts.filter(t=>t.abbrev&&t.id>0).map(t=>{const g=t.proGamesByScoringPeriod||{};const wk=[];for(let w=1;w<=30;w++){let x='';for(let i=0;i<7;i++){x+=((g[7+7*(w-1)+i]||[]).length>0)?'1':'0'}wk.push(x)}return t.abbrev+':'+wk.join('.')}).join(' ');
 fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));
}catch(e){out.err2=String(e);fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));}
