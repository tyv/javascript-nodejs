#!/usr/bin/env bash


# ==== Sudo =======
# default travis /etc/sudoers does env_reset and secure_path
# it leads to "sudo gulp" => command not found (wrong path)
# so I use my own sudoers
sudo cp ./travis/sudoers /etc


# ==== Allow travis to ssh (add keys) ==========
# Setup ssh keys like https://gist.github.com/koter84/e46e675960d964fdb48d
echo "decrypt private"
for i in {0..30}; do eval $(printf "echo \$id_rsa_%02d\n" $i) >> ~/.ssh/id_rsa_base64; done
base64 --decode ~/.ssh/id_rsa_base64 > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa

echo "decrypt public"
for i in {0..10}; do eval $(printf "echo \$id_rsa_pub_%02d\n" $i) >> ~/.ssh/id_rsa_base64.pub; done
base64 --decode ~/.ssh/id_rsa_base64.pub > ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/id_rsa.pub

# ==== Allow to ssh TO travis@stage.javascript.ru -p 2222 =========
# used for debugging purposes only
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# no questions please
echo -e "Host stage.javascript.ru\n\tStrictHostKeyChecking no" >> ~/.ssh/config

# 'GatewayPorts yes', 2222 will be open to the world on stage
ssh -fnNR 2222:localhost:22 travis@stage.javascript.ru

# ===== Add token for https://github.com/my/repo access ======
# add credentials to .netrc for private github repo access
# travis env set CI_USER_TOKEN [github API token] --private -r iliakan/javascript-nodejs
echo -e "machine github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc

# ===== Clone helper repo ============
# will use login from .netrc for private repo
# not using submodules here, because both repos need each other for testing
git clone --depth=50 https://github.com/iliakan/javascript-tutorial.git

# ===== Latest npm ==========
# need latest npm (less bugs, at time of writing 2.0.0 didn't work)
npm i -g npm
npm up -g

# ==== Setup stage(localhost):1212 -> localhost:80 tunnel ====
# ssh daemonize, forward all connections from stage:1212 to travis machine,
# http://stage.javascript.ru:80 /nginx/ -> localhost(stage):1212 /node/ -> localhost(travis):80

PORT_BUSY=`ssh travis@stage.javascript.ru lsof -i TCP:1212`
if [ ! -z "$PORT_BUSY" ]
then
  echo "Remote port 1212 is busy, can't setup forwarding";
  exit 1;
fi
ssh -fnNR localhost:1212:localhost:80 travis@stage.javascript.ru

# Turn off unneeded services to free some memory
sudo service mysql stop
sudo service memcached stop
sudo service postgresql stop

# for node "gm" module
sudo apt-get install graphicsmagick imagemagick

npm install

# ==== Install latest nginx (default nginx is old, some config options won't work) =======
sudo apt-get install python-software-properties software-properties-common
sudo add-apt-repository -y ppa:nginx/stable
sudo apt-get update
sudo apt-get install nginx

# deploy nginx config
sudo ./gulp config:nginx --prefix /etc/nginx --root `pwd` --env test --clear

sudo /etc/init.d/nginx restart

# For firefox
export DISPLAY=:99.0
sudo sh -e /etc/init.d/xvfb start
sleep 3 # give xvfb some time to start

# For npm test | bunyan
# pipefail: the return value of a pipeline is the status of the last command to exit with a non-zero status,
# or zero if no command exited with a non-zero status
set -o pipefail

NODE_ENV=production node --harmony `which gulp` build
./gulp tutorial:import --root ./javascript-tutorial
