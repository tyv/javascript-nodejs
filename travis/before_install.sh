#!/usr/bin/env bash

# echo -e 'travis_fold:start:Log'


echo -e "machine github.com\nlogin $CI_USER_TOKEN\nmachine api.github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc

git submodule update --init --recursive

# need latest npm (less bugs, at time of writing 2.0.0 didn't work)
npm i -g npm



# echo -e "travis_fold:end:Log"