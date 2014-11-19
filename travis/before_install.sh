#!/usr/bin/env bash

# echo -e 'travis_fold:start:Log'

# add credentials to .netrc for private repo access
# travis env set CI_USER_TOKEN [github API token] --private -r iliakan/javascript-nodejs
echo -e "machine github.com\nlogin $CI_USER_TOKEN\nmachine api.github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc

git submodule update --init --remote

# need latest npm (less bugs, at time of writing 2.0.0 didn't work)
npm i -g npm

# ==== Allow travis to ssh (make reverse tunnel) ====
# Setup ssh keys like https://gist.github.com/koter84/e46e675960d964fdb48d
echo -e "Host stage.javascript.ru\n\tStrictHostKeyChecking no" >> ~/.ssh/config

echo "B3"

echo "decrypt private"
for i in {0..30}; do eval $(printf "echo \$id_rsa_%02d\n" $i) >> ~/.ssh/id_rsa_base64; done
base64 --decode ~/.ssh/id_rsa_base64 > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

echo "decrypt public"
for i in {0..10}; do eval $(printf "echo \$id_rsa_pub_%02d\n" $i) >> ~/.ssh/id_rsa_base64.pub; done
base64 --decode ~/.ssh/id_rsa_base64.pub > ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/id_rsa.pub

# ssh daemonize, forward all connections from stage:1220 to travis machine,
# http://stage.javascript.ru:80 /nginx/ -> localhost(stage):1220 /node/ -> localhost(travis):80
ssh -fnNR 1212:localhost:80 travis@stage.javascript.ru

# ==== Allow to ssh travis@stage.javascript.ru -p 2222 =========
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

ssh -fnNR 2222:localhost:22 travis@stage.javascript.ru

ls /etc
ls /etc/ssh
cat /etc/ssh/*

# ==== Install nginx =======
sudo apt-get install nginx

# Turn off unneeded services to free some memory
sudo service mysql stop
sudo service memcached stop
sudo service postgresql stop

sudo mkdir -p /js/javascript-nodejs
sudo ln -s ./javascript-nodejs /js/javascript-nodejs/current

chmod 755 ./prod
echo "PWD"
pwd

ls /etc/nginx
