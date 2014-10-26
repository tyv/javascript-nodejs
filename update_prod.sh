#!/bin/bash

git pull origin master &&
  rm -rf node_modules &&
  npm i &&
  find node_modules -name .git -delete &&
  NODE_ENV=production node --harmony `which gulp` build &&
  git add --force node_modules public manifest &&
  git commit -a -m "update node_modules & rebuild" &&
  git push origin production
