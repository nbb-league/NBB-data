# usage: python3 projlog.py <page.html>   (run on the spliced out.html, before publishing)
# Records the model's projection for today's games (from the morning refresh) in PROJLOG, and fills in actual points for earlier days this week.
# If anything fails, print the error and continue: the page works without it. Needs playwright (python) with its preinstalled chromium.
import re,sys,json,datetime
from playwright.sync_api import sync_playwright
path=sys.argv[1]; s=open(path).read()
with sync_playwright() as pw:
    br=pw.chromium.launch(); pg=br.new_page(); pg.goto('file://'+__import__('os').path.abspath(path)); pg.wait_for_timeout(800)
    res=pg.evaluate('window.__projDay()'); br.close()
m=re.search(r'const PROJLOG = (.*?);\n',s); log=json.loads(m.group(1)) if m else {}
iso=res['iso']; today=int(re.search(r'const TODAY = (\d+)',s).group(1))
if iso not in log and sum(res['p'].values())>0: log[iso]={'p':{str(k):v for k,v in res['p'].items()},'m':res['m']}   # first write of the day wins (before games)
dp=json.loads(re.search(r'const DAYPTS = (.*?);\n',s).group(1)); d0=datetime.date.fromisoformat(iso)
for i in range(today):
    k=(d0-datetime.timedelta(days=today-i)).isoformat()
    if k in log and 'a' not in log[k]:
        a={t:v[i] for t,v in dp.items() if v[i] is not None}
        if a: log[k]['a']=a
new='const PROJLOG = '+json.dumps(log,separators=(',',':'))+';\n'
s=re.sub(r'const PROJLOG = .*?;\n',lambda _:new,s,count=1) if m else s.replace('//REFRESH-DATA-END',new+'//REFRESH-DATA-END',1)
open(path,'w').write(s); print('projlog OK',iso,len(log),'days')
