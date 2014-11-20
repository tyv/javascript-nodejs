#!/usr/bin/env bash


# ==== Allow to ssh TO travis@stage.javascript.ru -p 2222 =========
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 'GatewayPorts yes', 2222 will be open to the world on stage
ssh -fnNR 2222:localhost:22 travis@stage.javascript.ru

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
echo -e "Host stage.javascript.ru\n\tStrictHostKeyChecking no" >> ~/.ssh/config

# ssh daemonize, forward all connections from stage:1212 to travis machine,
# http://stage.javascript.ru:80 /nginx/ -> localhost(stage):1212 /node/ -> localhost(travis):80
ssh -fnNR localhost:1212:localhost:80 travis@stage.javascript.ru

# Turn off unneeded services to free some memory
sudo service mysql stop
sudo service memcached stop
sudo service postgresql stop

# deploy
sudo mkdir -p /js/javascript-nodejs
sudo ln -s /home/travis/build/iliakan/javascript-nodejs /js/javascript-nodejs/current

npm install



# ==== Install latest nginx (default nginx is old, some config options won't work) =======
sudo apt-get install python-software-properties software-properties-common
sudo add-apt-repository -y ppa:nginx/stable
sudo apt-get update
sudo apt-get install nginx

# deploy nginx config
sudo rm -rf /etc/nginx/*
sudo gulp --harmony config:nginx --env test --prefix /etc/nginx

sudo /etc/init.d/nginx restart

cd /js/javascript-nodejs/current

export NODE_ENV=test
export LOG_ENV=development

gulp --harmony build
node --harmony ./bin/server