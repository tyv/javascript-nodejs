#!/bin/bash

#   rm -rf node_modules && npm i && find node_modules -name .git -delete && git add --force node_modules
git pull origin master &&
  NODE_ENV=production node --harmony `which gulp` build &&
  git add --force public manifest &&
  # git push gives exit code 1 if nothing is pushed, so I push only if changes exist
  (git diff-index --quiet HEAD || git commit -a -m deploy && git push origin production)
