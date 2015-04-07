#!/bin/bash

# stop
# migrations
# start

/usr/local/bin/pm2 updatePM2
/usr/local/bin/pm2 startOrGracefulReload ecosystem.json --env production &&
 gulp cache:clean &&
 gulp config:nginx --prefix /etc/nginx --env production --root /js/javascript-nodejs/current --sslEnabled &&
 /etc/init.d/nginx reload
