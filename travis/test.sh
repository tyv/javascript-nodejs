#!/bin/bash

echo $DISPLAY
set -o pipefail

./gulp test | bunyan