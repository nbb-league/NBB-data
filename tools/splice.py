# usage: python3 splice.py <page.html> <block.txt> <out.html>
# Replaces the REFRESH-DATA block in the page with a freshly extracted one, after sanity checks.
import re,sys
page=open(sys.argv[1]).read(); blk=open(sys.argv[2]).read().strip()
assert blk.startswith('//REFRESH-DATA-START') and blk.endswith('//REFRESH-DATA-END'),'bad markers'
g=lambda n:re.search(r'const '+n+r' = (.*?);\n',blk+'\n')
for n in ['WEEK_LABEL','ASOF','ASOF_LABEL','ASOF_MS','TODAY','DAYS','SCH_RAW','MATCHUPS','CUR0']: assert g(n),n
data=re.search(r'const DATA = `(.*?)`;',blk,re.S).group(1).split('\n')
lu=re.search(r'const LU_RAW = `(.*?)`;',blk,re.S).group(1).split('\n')
teams={};cur=None
for l in data:
    if l.startswith('#'): cur=int(l[1:].split('|')[0]); teams[cur]=[]; continue
    f=l.split("|"); assert len(f) in (9,10,12),('fields',l); teams[cur].append(f)
assert sorted(teams)==[0,1,2,3,4,5,6],'teams'
assert 20<=len(teams[0])<=40,'free agents %d'%len(teams[0])
for l in lu:
    t,r=l.split(':'); t=int(t); parts=r.split('/'); assert len(parts)==7
    for p in parts:
        if p!='=': assert len(p)==len(teams[t]),('lineup length',t,len(p),len(teams[t])); assert sum(c not in 'cdx' for c in p)<=14,('starters',t,p)
ld=re.search(r'const LEADERS = `(.*?)`;',blk,re.S); assert ld,'LEADERS'
L=ld.group(1).split('\n'); assert any(x.startswith('AVG|') for x in L) and any(x.startswith('TOT|') for x in L) and any(x.startswith('SUM|') for x in L),'leaders keys'
assert all(len(x.split('|')) in (4,8) for x in L),'leader fields'
assert len(re.findall(r'\d',g('SCH_RAW').group(1)))>0 and len(g('SCH_RAW').group(1).split())==30,'schedule'
# Weekly snapshot for the award-race arrows: when the week changes, last week's final ladder ranks become LSNAP.
def _ranks(txt):
    m=re.search(r'const LEADERS = `(.*?)`;',txt,re.S); out=[]
    if not m: return out
    cnt={}
    for l in m.group(1).split('\n'):
        f=l.split('|')
        if f[0] in ('MVP','ROY','PUP'): cnt[f[0]]=cnt.get(f[0],0)+1; out.append(f[0]+'|'+str(cnt[f[0]])+'|'+f[1])
    return out
_o=page[page.index('//REFRESH-DATA-START'):page.index('//REFRESH-DATA-END')] if '//REFRESH-DATA-START' in page else ''
_ow=re.search(r"const WEEK_LABEL = '(.*?)'",_o); _nw=re.search(r"const WEEK_LABEL = '(.*?)'",blk)
_os=re.search(r'const LSNAP = `(.*?)`;',_o,re.S)
if _ow and _nw and _ow.group(1)!=_nw.group(1): _snap=_ranks(_o)
else: _snap=_os.group(1).split('\n') if _os and _os.group(1) else []
blk=re.sub(r'const LSNAP = `.*?`;\n?','',blk,flags=re.S)
blk=blk[:-len('//REFRESH-DATA-END')]+'const LSNAP = `'+'\n'.join(_snap)+'`;\n//REFRESH-DATA-END'
# Snapshot of the previous refresh (scores, records, rosters as 'injury code|FP/G|games') so the page can show "what changed since the last update".
import json
def _prevsnap(o):
    try:
        g=lambda n:re.search(r'const '+n+r" = (.*?);\n",o+'\n')
        lab=re.search(r"const ASOF_LABEL = '(.*?)'",o); wk=re.search(r"const WEEK_LABEL = '(.*?)'",o)
        cur=json.loads(g('CUR0').group(1)); rc=json.loads(g('RECS').group(1))
        d=re.search(r'const DATA = `(.*?)`;',o,re.S).group(1).split('\n'); R={}; t=None
        for l in d:
            if l.startswith('#'): t=int(l[1:].split('|')[0]); R[t]={}; continue
            f=l.split('|')
            if t and len(f)>3: R[t][f[0]]=('I' if f[2]=='IR' else '')+(f[3] if f[3] in ('O','D') else '')+'|'+(f[6] or '0')+'|'+(f[7] or '0')
        R.pop(0,None)
        ms=re.search(r'const ASOF_MS = (\d+)',o)
        return {'l':lab.group(1) if lab else '','w':wk.group(1) if wk else '','ms':int(ms.group(1)) if ms else 0,'c':cur,'rc':rc,'r':R}
    except Exception as e:
        return None
blk=re.sub(r'const PREVSNAP = .*?;\n','',blk+'\n',flags=re.S).rstrip('\n')
_ps=_prevsnap(_o) if _o else None
# Same Pacific-time day as the previous refresh: keep the earlier PREVSNAP so 'Yesterday in the NBB' keeps comparing against the last day's snapshot, not an hour ago.
_oa=re.search(r"const ASOF = '(\d{4}-\d{2}-\d{2})",_o); _na=re.search(r"const ASOF = '(\d{4}-\d{2}-\d{2})",blk)
_op=re.search(r'const PREVSNAP = (.*?);\n',_o+'\n') if _o else None
if _oa and _na and _oa.group(1)==_na.group(1) and _op:
    try: _ps=json.loads(_op.group(1))
    except Exception: pass
if _ps: blk=blk[:-len('//REFRESH-DATA-END')]+'const PREVSNAP = '+json.dumps(_ps,separators=(',',':'),ensure_ascii=False)+';\n//REFRESH-DATA-END'
# Carry the daily projection log (PROJLOG) forward from the old block; projlog.py adds today's entry afterwards.
_pl=re.search(r'const PROJLOG = (.*?);\n',_o+'\n') if _o else None
blk=re.sub(r'const PROJLOG = .*?;\n','',blk+'\n',flags=re.S).rstrip('\n')
blk=blk[:-len('//REFRESH-DATA-END')]+'const PROJLOG = '+(_pl.group(1) if _pl else '{}')+';\n//REFRESH-DATA-END'
a=page.index('//REFRESH-DATA-START'); b=page.index('//REFRESH-DATA-END')+len('//REFRESH-DATA-END')
open(sys.argv[3],'w').write(page[:a]+blk+page[b:]); print('spliced OK, players',sum(len(v) for k,v in teams.items() if k),'bytes',len(blk))
