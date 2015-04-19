#!/bin/bash

# Hard upgrade sequence:
# stop
# migrations
# start

# Regular upgrade (this script) sequence:
# reload (no downtime)

# this would cause several seconds downtime, run when PM2 upgrade is required
#/usr/local/bin/pm2 updatePM2

/usr/local/bin/pm2 startOrGracefulReload ecosystem.json --env production &&
  gulp cache:clean &&
  gulp cloudflare:clean &&
  gulp config:nginx --prefix /etc/nginx --env production --root /js/javascript-nodejs/current --sslEnabled &&
  /etc/init.d/nginx reload
