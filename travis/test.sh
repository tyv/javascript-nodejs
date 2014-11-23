#!/bin/bash

echo $DISPLAY
set -o pipefail

node --harmony `which gulp` test | bunyan