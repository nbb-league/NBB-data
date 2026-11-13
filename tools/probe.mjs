const B='https://lm-api-reads.fantasy.espn.com/apis/v3/games/fba/seasons/2027', L=B+'/segments/0/leagues/948';
const J=async(u,h)=>(await fetch(u,{headers:h||{}})).json();
const fa=await J(L+'?view=kona_player_info',{'x-fantasy-filter':JSON.stringify({players:{filterStatus:{value:['FREEAGENT','WAIVERS']},limit:6,sortPercOwned:{sortPriority:1,sortAsc:false}}})});
const ps=(fa.players||[]);console.log('FA count',ps.length,ps.map(x=>x.player&&x.player.fullName).join(', '));
const ids=ps.slice(0,3).map(x=>x.id);
const pc=await J(L+'?view=kona_playercard',{'x-fantasy-filter':JSON.stringify({players:{filterIds:{value:ids},filterStatsForTopScoringPeriodIds:{value:12,additionalValue:['002027','102027','002026']}}})});
for(const x of (pc.players||[]).slice(0,2)){const p=x.player||x;console.log('PLAYER',p.fullName,'proTeamId',p.proTeamId,'statKeys',Object.keys(p));
 const st=p.stats||[];console.log('stats entries',st.length);
 st.slice(0,40).forEach(s=>console.log(JSON.stringify({id:s.id,split:s.statSplitTypeId,src:s.statSourceId,sp:s.scoringPeriodId,season:s.seasonId,applied:s.appliedTotal,avg:s.appliedAverage,keys:Object.keys(s),nstats:s.stats?Object.keys(s.stats).length:0,sample:s.stats?JSON.stringify(s.stats).slice(0,160):''})))}
