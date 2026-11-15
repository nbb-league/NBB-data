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
// Goodwin / trade lookup
try{
 const r=await J(L+'?view=mRoster&view=mTeam');
 out.goodwin_roster=[]; (r.teams||[]).forEach(t=>(t.roster.entries||[]).forEach(e=>{const p=e.playerPoolEntry.player; if(/goodwin|markkanen|fox|davion/i.test(p.fullName))out.goodwin_roster.push([t.id,p.fullName,e.lineupSlotId,e.status])}));
 const k=await J(L+'?view=kona_player_info&scoringPeriodId='+cur);
 const f=await fetch(L+'?view=kona_player_info',{headers:{'x-fantasy-filter':JSON.stringify({players:{filterName:{value:'Goodwin'},limit:10}})}}); const fj=await f.json();
 out.goodwin_search=(fj.players||[]).map(x=>[x.player.fullName,x.status,x.onTeamId,x.player.proTeamId,x.player.injuryStatus,x.player.defaultPositionId]);
 const tr=await J(L+'?view=mTransactions2'); out.tx=(tr.transactions||[]).slice(-8).map(t=>[t.type,t.status,t.teamId,new Date(t.proposedDate).toISOString(),(t.items||[]).map(i=>[i.type,i.playerId,i.fromTeamId,i.toTeamId])]);
 fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));
}catch(e){out.err=String(e);fs.writeFileSync('out/diag.json',JSON.stringify(out,null,1));}
