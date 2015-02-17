#!/bin/bash
rm -rf /usr/local/lib/node_modules ~/.npm ~/.node-gyp /tmp/npm*
curl -L https://npmjs.com/install.sh | sh
npm i -g bunyan
npm i -g gist-cli
npm i -g gulp
npm i -g mocha
npm i -g node-static
npm i -g pm2
npm i -g svgo
npm i -g webpack
rm -rf node_modules
npm i
