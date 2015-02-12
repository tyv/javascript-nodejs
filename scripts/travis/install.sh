#!/usr/bin/env bash


# ==== Sudo =======
# default travis /etc/sudoers does env_reset and secure_path
# it leads to "sudo gulp" => command not found (wrong path)
# so I use my own sudoers
sudo cp ./scripts/travis/sudoers /etc

sudo mkdir /js
sudo chown travis /js
mv ~/javascript-nodejs /js/

# ==== Allow travis to ssh (add keys) ==========
# Setup ssh keys like https://gist.github.com/koter84/e46e675960d964fdb48d

if [ "$TRAVIS_SECURE_ENV_VARS" = "true" ]; then
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

  # no questions please when ssh to remote test machine
  echo -e "Host stage.javascript.ru\n\tStrictHostKeyChecking no" >> ~/.ssh/config

  # ===== Add token for https://github.com/my/repo access ======
  # add credentials to .netrc for private github repo access
  # travis env set CI_USER_TOKEN [github API token] --private -r iliakan/javascript-nodejs
  echo -e "machine github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc

  # ===== Clone helper repo ============
  # will use login from .netrc for private repo
  # not using submodules here, because both repos need each other for testing
  git clone --depth=10 https://github.com/iliakan/javascript-tutorial.git /js/javascript-tutorial

  # ===== Get access to secret data =====
  scp -r travis@stage.javascript.ru:/js/secret .
  sudo mv secret /js/

fi

# ===== Latest npm ==========
# need latest npm (less bugs)
#npm i -g npm
#npm up -g
#npm i -g mocha
#npm i -g bunyan
#npm i -g gulp


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

# ==== Install latest mongo (mongoose bugs otherwise) =======
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo /etc/init.d/mongodb start

# deploy nginx config
sudo gulp config:nginx --prefix /etc/nginx --root /js/javascript-nodejs --env test --clear --harmony

sudo /etc/init.d/nginx restart

gulp build --harmony

if [ -d /js/javascript-tutorial ]; then
  gulp build tutorial:import --harmony --root /js/javascript-tutorial
fi

if [[ ! -z $TRAVIS_DEBUG ]]; then
  # allow to SSH to travis via stage.javascript.ru:2222 port forwarding
  cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys

  # 'GatewayPorts yes', 2222 will be open to the world on stage
  ssh -fnNR 2222:localhost:22 travis@stage.javascript.ru

  # now sleep and let me SSH to travis and do the stuff manually
  while :
  do
    echo "."
    sleep 60
  done

fi
