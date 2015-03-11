export SLIMERJSLAUNCHER=/Applications/Firefox.app/Contents/MacOS/firefox
export SLIMERJS_EXECUTABLE=/Users/iliakan/slimerjs-0.9.5/slimerjs

// must have npm i -g casperjs 
casperjs --engine=slimerjs --ssl-protocol=any --disk-cache=yes --max-disk-cache-size=1000000 ./spider.js

