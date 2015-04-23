#!/bin/bash

DATETIME="$(date "+%FT%H:%M:%S")"
MEMORY=`ps -e -orss=,args= | awk '/iojs/{ SUM += $1} END { print SUM }'`

echo "$DATETIME $MEMORY" >> /var/log/node/memory.log

