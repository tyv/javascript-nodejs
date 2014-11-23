#!/bin/bash

node --harmony `which gulp` test | bunyan

exit ${PIPESTATUS[0]}
