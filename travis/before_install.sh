#!/usr/bin/env bash

# echo -e 'travis_fold:start:Log'

# add credentials to .netrc for private repo access
# travis env set CI_USER_TOKEN [github API token] --private -r iliakan/javascript-nodejs

echo -e "machine github.com\nlogin $CI_USER_TOKEN\nmachine api.github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc

git submodule update --init --remote &&
npm i -g npm # need latest npm (less bugs, at time of writing 2.0.0 didn't work)




# echo -e "travis_fold:end:Log"