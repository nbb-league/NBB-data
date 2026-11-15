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
 const f=await fetch(L+'?view=kona_player_info',{headers:{'x-fantasy-filter':JSON.stringify({players:{filterIds:{value:[5107173,4592492]}}})}}); const fj=await f.json();
 out.w=(fj.players||[]).map(x=>({keys:Object.keys(x),status:x.status,wpd:x.waiverProcessDate,pk:Object.keys(x.player).filter(k=>/waiv|lock|process|date/i.test(k)),onTeamId:x.onTeamId}));
 const s=await J(L+'?view=mSettings'); out.waiverSettings=s.settings.acquisitionSettings; out.tradeSettings={deadline:s.settings.tradeSettings};
 fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));
}catch(e){out.err3=String(e);fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));}
