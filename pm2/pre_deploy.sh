#!/bin/bash

#   rm -rf node_modules && npm i && find node_modules -name .git -delete && git add --force node_modules
git pull origin master &&
  NODE_ENV=production node --harmony `which gulp` build &&
  git add --force public manifest &&
  # if there's nothing to commit,
  # `git commit` would exit with status 1, stopping the deploy
  # so I commit only if there are changes
  (git diff-index --quiet HEAD || git commit -a -m deploy) &&
  git push origin production

