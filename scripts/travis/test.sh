#!/bin/bash

gulp test | bunyan

exit ${PIPESTATUS[0]}
