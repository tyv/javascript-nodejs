#!/bin/bash

# stop
# migrations
# start

/root/.nvm/v0.11.15/bin/pm2 startOrGracefulReload ecosystem.json --env production &&
 ./gulp cache:clean &&
 ./gulp config:nginx --prefix /etc/nginx --env production --root /js/javascript-nodejs/current &&
 /etc/init.d/nginx reload