#!/bin/bash

echo "This script makes NVM-installed node system-wide"
echo "Copy $(which node) to /usr/local"

nvm use iojs

n=$(which node);
n=${n%/bin/node};

chmod -R 755 $n/bin/*; sudo cp -rv $n/{bin,lib,share} /usr/local
