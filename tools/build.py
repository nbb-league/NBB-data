# usage: python3 tools/build.py <block.txt> <out.html>   Assembles the page from the template, logos and a data block.
import sys
t=open('site/template.html').read()
t=t.replace('/*__LOGOS__*/',open('site/logos.js').read()).replace('/*__REFRESH__*/',open(sys.argv[1]).read().strip())
open(sys.argv[2],'w').write(t); print('built',sys.argv[2],len(t))
