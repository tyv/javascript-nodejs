#!/bin/bash

# Pull all changes from the master branch and build the artifact
# Then commit to production branch
#
# rm -rf node_modules to reinstall them


git pull origin master &&
  # Install node_modules if absent
  ([ -d node_modules ] ||
    npm i &&
    find node_modules -name .git -delete &&
    git add --force node_modules
  ) &&
  # rebuild the artifact and add prod. files to the branch
  NODE_ENV=production gulp build --harmony &&
  git add --force public manifest &&
  # if there's nothing to commit,
  # `git commit` would exit with status 1, stopping the deploy
  # so I commit only if there are changes
  (git diff-index --quiet HEAD || git commit -a -m deploy) &&
  git push origin production

