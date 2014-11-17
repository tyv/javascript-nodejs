#!/usr/bin/env bash

# echo -e 'travis_fold:start:Log'

# add credentials to .netrc for private repo access
# travis env set CI_USER_TOKEN [github API token] --private -r iliakan/javascript-nodejs
echo -e "machine github.com\nlogin $CI_USER_TOKEN\nmachine api.github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc

git submodule update --init --remote

# need latest npm (less bugs, at time of writing 2.0.0 didn't work)
npm i -g npm

# Setup ssh keys like https://gist.github.com/koter84/e46e675960d964fdb48d
echo -e "Host stage.javascript.ru\n\tStrictHostKeyChecking no" >> ~/.ssh/config


echo "decrypt private"
for i in {0..30}; do eval $(printf "echo \$id_rsa_%02d\n" $i) >> ~/.ssh/id_rsa_base64; done
base64 --decode ~/.ssh/id_rsa_base64 > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

echo "decrypt public"
for i in {0..10}; do eval $(printf "echo \$id_rsa_pub_%02d\n" $i) >> ~/.ssh/id_rsa_base64.pub; done
base64 --decode ~/.ssh/id_rsa_base64.pub > ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/id_rsa.pub

# echo -e "travis_fold:end:Log"