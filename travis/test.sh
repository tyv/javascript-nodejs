#!/bin/bash

set -o pipefail

sleep 1000000

node --harmony `which gulp` test | bunyan

