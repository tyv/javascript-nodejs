#!/bin/bash

ssh-keygen -t rsa -N "" -C travis -f ./travis_key

# i only tested the encrypting on Linux.
# on mac you need gsplit instead of split, but the rest should be mostly the same
# 
# decryption works on both linux and mac travis-workers

echo "    # id_rsa"
gbase64 --wrap=0 ./travis_key > ./travis_key_base64
ENCRYPTION_FILTER="echo \$(echo \"    - secure: \")\$(travis encrypt \"\$FILE='\`cat $FILE\`'\" -r iliakan/javascript-nodejs)"
gsplit --bytes=100 --numeric-suffixes --suffix-length=2 --filter="$ENCRYPTION_FILTER" ./travis_key_base64 id_rsa_
rm ./travis_key_base64

echo "    # id_rsa.pub"
gbase64 --wrap=0 ./travis_key.pub > ./travis_key_base64.pub
ENCRYPTION_FILTER="echo \$(echo \"    - secure: \")\$(travis encrypt \"\$FILE='\`cat $FILE\`'\" -r iliakan/javascript-nodejs)"
gsplit --bytes=100 --numeric-suffixes --suffix-length=2 --filter="$ENCRYPTION_FILTER" ./travis_key_base64.pub id_rsa_pub_
rm ./travis_key_base64.pub
