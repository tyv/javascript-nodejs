#!/bin/bash

# Hard upgrade:
# stop
# migrations
# start

# Regular upgrade (this script):
# reload

# this causes several seconds downtime, uncomment when the upgrade is required
#/usr/local/bin/pm2 updatePM2

  # fixme: switch to startOrGracefulReload with 2 processes, with 1 process it doesn't actually restart the process
/usr/local/bin/pm2 startOrGracefulReload ecosystem.json --env production --log /var/log/node &&
  gulp cache:clean &&
  gulp config:nginx --prefix /etc/nginx --env production --root /js/javascript-nodejs/current --sslEnabled &&
  /etc/init.d/nginx reload
