#!/bin/bash
rm -rf dump &&
mongodump -d js -c tasks &&
mongodump -d js -c plunks &&
mongodump -d js -c articles &&
ssh nightly 'rm -rf dump' &&
scp -r -C dump nightly: &&
ssh nightly 'mongorestore --drop' &&
echo "Tutorial updated"
