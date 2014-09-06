#!/bin/bash

git pull origin master &&
  rm -rf node_modules &&
  npm i &&
  find node_modules -name .git -delete

git add --force node_modules
git commit -a -m "update node_modules"
git push origin production
