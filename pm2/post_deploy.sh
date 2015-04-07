#!/bin/bash

# stop
# migrations
# start


/usr/local/bin/pm2 updatePM2
  # fixme: switch to startOrGracefulReload with 2 processes, with 1 process it doesn't actually restart the process
/usr/local/bin/pm2 startOrRestart ecosystem.json --env production &&
  gulp cache:clean &&
  gulp config:nginx --prefix /etc/nginx --env production --root /js/javascript-nodejs/current --sslEnabled &&
  /etc/init.d/nginx reload
