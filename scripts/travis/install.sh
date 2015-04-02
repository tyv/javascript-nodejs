#!/usr/bin/env bash


# ==== Sudo =======
# default travis /etc/sudoers does env_reset and secure_path
# it leads to "sudo gulp" => command not found (wrong path)
# so I use my own sudoers
sudo cp ./scripts/travis/sudoers /etc

sudo mkdir /js
sudo chown travis /js

# Debug info
ls
pwd
echo $HOME
which node
node -v

# Move the repo to /js/javascript-nodejs (usual location, secrey & tutorial will be siblings)
cd ..
mv javascript-nodejs /js/
cd /js/javascript-nodejs

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

  # no questions please when ssh to remote test machine
  echo -e "Host stage.javascript.ru\n\tStrictHostKeyChecking no" >> ~/.ssh/config

  # ===== Add token for https://github.com/my/repo access ======
  # add credentials to .netrc for private github repo access
  # travis env set CI_USER_TOKEN [github API token] --private -r iliakan/javascript-nodejs
  echo -e "machine github.com\nlogin $CI_USER_TOKEN" >> ~/.netrc


  # ==== Allow to ssh TO travis@stage.javascript.ru -p 2222 =========
  # used for debugging purposes only
  # 1) store travis key in KeyChain
  #   ssh-add -K ~/.ssh/travis_key
  # 2) ssh
  #  ssh -p 2222 travis@stage.javascript.ru
  # OR just add ssh_config to ~/.ssh/config and ssh travis
  if [[ ! -z $TRAVIS_DEBUG ]]; then
    # allow to SSH to travis via stage.javascript.ru:2222 port forwarding
    cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys

    cat ~/.ssh/authorized_keys
    # 'GatewayPorts yes' in sshd_config on stage, 2222 will be open to the world on stage
    ssh -fnNR 2222:localhost:22 travis@stage.javascript.ru

    echo "Ready for SSH"
  fi


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
# install global packages 1-by-1 for less bugs too
npm i -g npm
npm i -g mocha
npm i -g bunyan
npm i -g gulp


# Turn off unneeded services to free some memory
sudo service mysql stop
sudo service memcached stop
sudo service postgresql stop

# for node "gm" module
sudo apt-get install graphicsmagick imagemagick

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
sudo /etc/init.d/mongodb restart

npm install

# deploy nginx config
sudo gulp config:nginx --prefix /etc/nginx --root /js/javascript-nodejs --env test --clear

sudo /etc/init.d/nginx restart

gulp build

if [ -d /js/javascript-tutorial ]; then
  gulp tutorial:import --root /js/javascript-tutorial
fi

echo "Install finished"

if [[ ! -z $TRAVIS_DEBUG ]]; then

  # more output for Travis to keep the job running
  while :
  do
    echo "."
    sleep 60
  done

fi
