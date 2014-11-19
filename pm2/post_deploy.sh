#!/bin/bash

/root/.nvm/v0.11.14/bin/pm2 startOrGracefulReload ecosystem.json --env production &&
 ./gulp cache:clean &&
 ./gulp config:nginx --prefix /etc/nginx --env production &&
 /etc/init.d/nginx reload