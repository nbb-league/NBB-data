# NBB data and site

Nice Boys Basketball (ESPN league 948). A GitHub Action pulls the league's public ESPN data several times a day, rebuilds the site and publishes it with GitHub Pages. No computer needs to be on.

- `site/template.html`: the page (data block and logos are filled in at build time)
- `data/block.txt`: the latest data block (committed by the refresh)
- `tools/`: the extractor (`extract.js` run by `extract.mjs`), `splice.py` (sanity checks and carry-forward history), `projlog.py` (projected vs actual log), `build.py`
- `out/test-result.txt`: the original ESPN reachability test
