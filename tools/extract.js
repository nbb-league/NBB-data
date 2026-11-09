await (async()=>{
const B='https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2027', L=B+'/segments/0/leagues/948';
const T={1:'ATL',2:'BOS',3:'NO',4:'CHI',5:'CLE',6:'DAL',7:'DEN',8:'DET',9:'GS',10:'HOU',11:'IND',12:'LAC',13:'LAL',14:'MIA',15:'MIL',16:'MIN',17:'BKN',18:'NY',19:'ORL',20:'PHI',21:'PHX',22:'POR',23:'SAC',24:'SA',25:'OKC',26:'UTA',27:'WAS',28:'TOR',29:'MEM',30:'CHA'};
const J=async(u,h)=>(await fetch(u,{credentials:'include',headers:h||{}})).json();
const ptf=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date()).reduce((a,x)=>(a[x.type]=x.value,a),{});
const d0=Date.UTC(2026,9,26), days=Math.round((Date.UTC(+ptf.year,+ptf.month-1,+ptf.day)-d0)/864e5);
const wk=Math.floor(days/7)+1, spStart=7+(wk-1)*7, today=days-(wk-1)*7;
const WD=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAYS=WD.map((w,i)=>{const d=new Date(d0+((wk-1)*7+i)*864e5);return [w,(d.getUTCMonth()+1)+'/'+d.getUTCDate()]});
const j0=await J(L+'?view=mRoster&view=mTeam&view=mMatchup&view=mSettings');
const mem={};(j0.members||[]).forEach(m=>mem[m.id]=((m.firstName||'')+' '+(m.lastName||'')).trim());
const IJ={};try{const ids=[];j0.teams.forEach(t=>t.roster.entries.forEach(e=>{const s=e.playerPoolEntry.player.injuryStatus;if(s&&s!=='ACTIVE')ids.push(e.playerId)}));
 if(ids.length){const jj=await J(L+'?view=kona_playercard',{'x-fantasy-filter':JSON.stringify({players:{filterIds:{value:ids}}})});
 (jj.players||[]).forEach(x=>{const p=x.player||x,d=p.injuryDetails&&p.injuryDetails.expectedReturnDate;if(d&&d.length===3)IJ[p.fullName]=d[0]+'-'+String(d[1]).padStart(2,'0')+'-'+String(d[2]).padStart(2,'0')})}}catch(e){}
const pts=(await J(B+'?view=proTeamSchedules_wl')).settings.proTeams;
const SCH=pts.filter(t=>T[t.id]).map(t=>T[t.id]+':'+[0,1,2,3,4,5,6].map(i=>((t.proGamesByScoringPeriod||{})[spStart+i]||[]).length>0?1:0).join('')).join(' ');
const f2=v=>v&&v.appliedAverage>0?+v.appliedAverage.toFixed(2):'';
const inj=s=>s==='ACTIVE'||!s?'H':s==='DAY_TO_DAY'?'D':'O';
const el=p=>p.eligibleSlots.filter(s=>s<=10&&s!==7&&s!==9).join('');
const line=(p,slot)=>{const st=p.stats||[],g=id=>st.find(q=>q.id===id),cu=g('002027');
 return [p.fullName,T[p.proTeamId]||'',slot,inj(p.injuryStatus),f2(g('102027')),f2(g('002026')),f2(cu),cu&&cu.stats?(cu.stats['42']||0):0,el(p),f2(g('022027')),f2(g('012027')),(g('012027')&&g('012027').stats)?(g('012027').stats['42']||0):0].join('|')};
let data='';const order=[];
for(const t of j0.teams){data+='#'+t.id+'|'+t.name+'|'+(mem[t.primaryOwner]||'')+'\n';
 order.push(t.roster.entries.map(e=>e.playerId));
 t.roster.entries.forEach(e=>{const s=e.lineupSlotId;data+=line(e.playerPoolEntry.player,s===13?'IR':s===12?'BE':'ST')+'\n'})}
const fa=await J(L+'?view=kona_player_info',{'x-fantasy-filter':JSON.stringify({players:{filterStatus:{value:['FREEAGENT','WAIVERS']},filterSlotIds:{value:[0,1,2,3,4,5,6,8,10,11]},limit:250,sortPercOwned:{sortPriority:1,sortAsc:false},sortDraftRanks:{sortPriority:100,sortAsc:true,value:'STANDARD'}}})});
data+='#0|Free agents|\n';
const l7=p=>{const s=(p.stats||[]).find(q=>q.id==='012027');return {a:s&&s.appliedAverage>0?+s.appliedAverage.toFixed(2):0,g:s&&s.stats?(s.stats['42']||0):0}};
fa.players.filter(x=>T[x.player.proTeamId]&&x.player.injuryStatus!=='OUT').map(x=>({p:x.player,r:l7(x.player)})).filter(o=>o.r.g>=2).sort((a,b)=>b.r.a-a.r.a).slice(0,40).forEach(o=>{data+=line(o.p,'FA')+'\n'});
const LUr=[];
const per=[];
for(let i=0;i<7;i++){const j=await J(L+'?view=mRoster&scoringPeriodId='+(spStart+i));
 per.push(j.teams.map((t,ti)=>{const m={};t.roster.entries.forEach(e=>m[e.playerId]=e.lineupSlotId);return order[ti].map(id=>m[id]==null?'x':m[id].toString(16)).join('')}))}
j0.teams.forEach((t,ti)=>{LUr.push(t.id+':'+[0,1,2,3,4,5,6].map(i=>(i!==today&&per[i][ti]===per[today][ti])?'=':per[i][ti]).join('/'))});
const left=[1,6];
const mu=j0.schedule.filter(m=>m.matchupPeriodId===wk+1&&!/CONSOL|LOSERS/.test(m.playoffTierType||"")).map(m=>{let a=m.home.teamId,b=m.away.teamId;if(left.includes(b)&&!left.includes(a)){[a,b]=[b,a]}return {a,b,pa:m.home.teamId===a?m.home.totalPoints:m.away.totalPoints,pb:m.home.teamId===a?m.away.totalPoints:m.home.totalPoints}}).sort((x,y)=>(left.includes(y.a)?1:0)-(left.includes(x.a)?1:0));
const cur={};mu.forEach(m=>{cur[m.a]=+(m.pa||0).toFixed(2);cur[m.b]=+(m.pb||0).toFixed(2)});
// LIVE SCORES: ESPN only rolls a day's points into the matchup totals after the day's games end, but each roster shows live points for the current scoring period. Add those (only for a scoring period whose points are not in the totals yet) so scores move during games.
const livePts={};
try{
 const sps=[];const spT=spStart+today; if(today>0)sps.push(spT-1); sps.push(spT);
 for(const sp of sps){
  const jj=await J(L+'?view=mMatchup&view=mBoxscore&scoringPeriodId='+sp);
  (jj.schedule||[]).filter(m=>m.matchupPeriodId===wk+1).forEach(m=>{[m.home,m.away].forEach(x=>{
   if(!x||x.teamId==null)return;
   const pb=x.pointsByScoringPeriod||{};
   if(pb[sp]!=null)return;
   const ent=(x.rosterForCurrentScoringPeriod&&x.rosterForCurrentScoringPeriod.entries)||[];
   const v=ent.filter(e=>e.lineupSlotId<12).reduce((a,e)=>a+((e.playerPoolEntry&&e.playerPoolEntry.appliedStatTotal)||0),0);
   livePts[x.teamId]=(livePts[x.teamId]||0)+v;
  })});
 }
}catch(e){}
mu.forEach(m=>{[m.a,m.b].forEach(id=>{if(livePts[id])cur[id]=+((+cur[id]||0)+livePts[id]).toFixed(2)})});
// How much of each NBA game is already played today (0 = not started, 1 = final) so the projection only counts what is left.
const LIVEFRAC={};const TIPS=[];
try{
 const AL={UTAH:'UTA',WSH:'WAS'};
 const dd=''+ptf.year+ptf.month+ptf.day;
 const nd=new Date(Date.UTC(+ptf.year,+ptf.month-1,+ptf.day+1)),dd2=''+nd.getUTCFullYear()+String(nd.getUTCMonth()+1).padStart(2,'0')+String(nd.getUTCDate()).padStart(2,'0');
 try{const sj2=await (await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates='+dd2)).json();(sj2.events||[]).forEach(ev=>{const cs=((ev.competitions||[])[0]||{competitors:[]}).competitors;const hm=cs.find(c=>c.homeAway==='home'),aw=cs.find(c=>c.homeAway==='away');if(hm&&aw)TIPS.push({t:ev.date,h:AL[hm.team.abbreviation]||hm.team.abbreviation,a:AL[aw.team.abbreviation]||aw.team.abbreviation,s:'pre'})})}catch(e){}
 const sj=await (await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates='+dd)).json();
 (sj.events||[]).forEach(ev=>{const cs=((ev.competitions||[])[0]||{competitors:[]}).competitors;const hm=cs.find(c=>c.homeAway==='home'),aw=cs.find(c=>c.homeAway==='away');if(hm&&aw)TIPS.push({t:ev.date,h:AL[hm.team.abbreviation]||hm.team.abbreviation,a:AL[aw.team.abbreviation]||aw.team.abbreviation,s:(ev.status&&ev.status.type&&ev.status.type.state)||'pre'})});
 (sj.events||[]).forEach(ev=>{
  const st=ev.status||{},ty=st.type||{};let f=0;
  if(ty.state==='post')f=1;
  else if(ty.state==='in'){
   const per=st.period||1,mm=String(st.displayClock||'0:00').split(':'),mins=(+mm[0]||0)+((+mm[1]||0)/60);
   const el=per<=4?(per-1)*12+(12-mins):48+(per-5)*5+(5-mins), tot=per<=4?48:48+(per-4)*5;
   f=Math.max(0.01,Math.min(0.99,el/tot));
  }
  ((ev.competitions||[])[0]||{competitors:[]}).competitors.forEach(c=>{const a=c.team&&c.team.abbreviation;if(a)LIVEFRAC[AL[a]||a]=+f.toFixed(3)});
 });
}catch(e){}
const LJ=await J(L+'?view=kona_player_info',{'x-fantasy-filter':JSON.stringify({players:{filterSlotIds:{value:[0,1,2,3,4,5,6,8,10,11]},limit:800,sortAppliedStatTotal:{sortAsc:false,sortPriority:1,value:'002027'}}})});
const AP=LJ.players.map(x=>{const c=(x.player.stats||[]).find(s=>s.id==='002027'),s=c&&c.stats||{},ls=(x.player.stats||[]).find(s=>s.id==='002026');return {id:x.player.id,lgp:ls&&ls.stats?(ls.stats['42']||0):0,n:x.player.fullName,pt:T[x.player.proTeamId]||'',tid:x.status==='ONTEAM'?x.onTeamId:0,gp:s['42']||0,avg:c&&c.appliedAverage||0,tot:c&&c.appliedTotal||0,s}}).filter(a=>a.gp>0);
const r2=v=>+(+v).toFixed(2);
const mk=(key,arr,n,vf)=>arr.slice(0,n).map(a=>[key,a.n,a.pt,a.tid,a.gp,r2(a.avg),r2(a.tot),vf?vf(a):''].join('|')).join('\n');
const by=f=>AP.filter(a=>f(a)>0).sort((a,b)=>f(b)-f(a)||b.tot-a.tot);
const FAP=AP.filter(a=>a.tid===0);
const lead=[mk('AVG',by(a=>a.avg),20),mk('TOT',by(a=>a.tot),20),mk('FAAVG',FAP.slice().sort((a,b)=>b.avg-a.avg),15),mk('FATOT',FAP.slice().sort((a,b)=>b.tot-a.tot),15)];
[['DD','37'],['TD','38'],['AST','3'],['REB','6'],['TPM','17'],['BLK','1'],['STL','2']].forEach(([k,id])=>{const m=mk(k,by(a=>a.s[id]||0),10,a=>a.s[id]||0);if(m)lead.push(m)});
let DS=null;try{const dr=await J(L+'?view=mDraftDetail');DS=new Set(dr.draftDetail.picks.map(p=>p.playerId))}catch(e){}
const NOT_ROOKIE=['Tyrese Haliburton','Fred VanVleet','Kyrie Irving','Mario Hezonja','Trey Lyles','Georges Niang','Alpha Diallo','Trevon Brazile'];
const blend=pool=>{const mt=Math.max(...pool.map(a=>a.tot),0.01),ma=Math.max(...pool.map(a=>a.avg),0.01);return pool.map(a=>({...a,sc:100*(0.6*a.tot/mt+0.4*a.avg/ma)})).sort((a,b)=>b.sc-a.sc)};
const ladder=(key,pool)=>blend(pool).slice(0,10).map(a=>[key,a.n,a.pt,a.tid,a.gp,r2(a.avg),r2(a.tot),r2(a.sc)].join('|')).join('\n');
lead.push(ladder('MVP',AP));
lead.push(ladder('ROY',AP.filter(a=>a.lgp===0&&!NOT_ROOKIE.includes(a.n))));
const spNow=spStart+today,ADDS=new Set();let bad=0;
for(let a=4;a<=spNow;a+=12){await Promise.all(Array.from({length:Math.min(12,spNow-a+1)},(_,k)=>J(L+'?view=mTransactions2&scoringPeriodId='+(a+k)).then(tx=>{if(!tx.transactions&&!tx.hasOwnProperty('teams')&&!tx.status)bad++;(tx.transactions||[]).forEach(q=>{if(q.type==='FREEAGENT'||q.type==='WAIVER')(q.items||[]).forEach(i=>{if(i.type==='ADD')ADDS.add(i.playerId)})})}).catch(()=>{bad++})))}
if(bad)throw new Error('transactions failed '+bad);
if(DS)lead.push(ladder('PUP',AP.filter(a=>ADDS.has(a.id)&&!DS.has(a.id))));
lead.push('SUM|'+AP.reduce((q,a)=>q+(a.s['37']||0),0)+'|'+AP.reduce((q,a)=>q+(a.s['38']||0),0)+'|'+AP.length);
const jm=await J(L+'?view=mMatchup&view=mTeam&view=mBoxscore&scoringPeriodId='+spStart);
const RECS={};jm.teams.forEach(t=>{const o=t.record.overall;RECS[t.id]=o.wins+'-'+o.losses+(o.ties?'-'+o.ties:'')});
const DP={};jm.schedule.filter(m=>m.matchupPeriodId===wk+1&&!/CONSOL|LOSERS/.test(m.playoffTierType||"")).forEach(m=>[m.home,m.away].forEach(x=>{DP[x.teamId]=[0,1,2,3,4,5,6].map(i=>{const v=(x.pointsByScoringPeriod||{})[spStart+i];return v==null?null:+(+v).toFixed(2)})}));
const prev=j0.schedule.filter(m=>m.matchupPeriodId===wk&&!/CONSOL|LOSERS/.test(m.playoffTierType||"")).map(m=>[m.home.teamId,m.away.teamId,+(m.home.totalPoints||0).toFixed(2),+(m.away.totalPoints||0).toFixed(2)]);
const FIN={};j0.schedule.filter(m=>m.matchupPeriodId<=wk&&m.away&&m.home&&m.winner&&m.winner!=='UNDECIDED'&&!/CONSOL|LOSERS/.test(m.playoffTierType||"")).forEach(m=>{if(m.matchupPeriodId<2)return;const nw=m.matchupPeriodId-1;(FIN[nw]=FIN[nw]||[]).push([m.home.teamId,m.away.teamId,+(m.home.totalPoints||0).toFixed(2),+(m.away.totalPoints||0).toFixed(2)])});
const label=ptf.month.replace(/^0/,'')+'/'+ptf.day.replace(/^0/,'');
const nowLabel=new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' PT';
const out=`//REFRESH-DATA-START
const WEEK_LABEL = 'Week ${wk}';
const ASOF = '${ptf.year}-${ptf.month}-${ptf.day}T${ptf.hour}:${ptf.minute}';
const ASOF_LABEL = '${nowLabel}';
const ASOF_MS = ${Date.now()};
const TODAY = ${today};
const DAYS = ${JSON.stringify(DAYS)};
const SCH_RAW = '${SCH}';
const MATCHUPS = ${JSON.stringify(mu.map(m=>[m.a,m.b]))};
const CUR0 = ${JSON.stringify(cur)};
const LIVEFRAC = ${JSON.stringify(LIVEFRAC)};
// NBA tip times (UTC ISO) for today and tomorrow, Pacific dates: t = tip-off, h = home team, a = away team, s = pre/in/post
const TIPS = ${JSON.stringify(TIPS.sort((x,y)=>x.t<y.t?-1:1))};
const LU_RAW = \`${LUr.join('\n')}\`;
const DATA = \`${data.trimEnd()}\`;
const LEADERS = \`${lead.join('\n')}\`;
const RECS = ${JSON.stringify(RECS)};
const DAYPTS = ${JSON.stringify(DP)};
const PREVWK = ${JSON.stringify(prev)};
const RESLIVE = ${JSON.stringify(FIN)};
const INJ = ${JSON.stringify(IJ)};
//REFRESH-DATA-END`;
window.__blob=out;
let h=5381;for(const c of out)h=((h<<5)+h+c.charCodeAt(0))>>>0;window.__sum=h;return JSON.stringify({len:out.length,sum:h,wk,today,spStart,matchups:mu.length,nowLabel})
})()
