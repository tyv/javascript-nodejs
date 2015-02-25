#!/bin/bash


rm -rf dump &&
mongodump -d js -c tasks &&
mongodump -d js -c plunks &&
mongodump -d js -c articles &&
mongodump -d js -c references &&
ssh nightly 'rm -rf dump' &&
scp -r -C dump nightly: &&
ssh nightly 'mongorestore --drop ' &&
rsync -rlDv /js/javascript-nodejs/public/ nightly:/js/javascript-nodejs/current/public/ &&
ssh nightly 'cd /js/javascript-nodejs/current/scripts/elastic; bash db' &&
echo "Tutorial updated"
