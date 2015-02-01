#!/bin/bash

gulp test --harmony | bunyan

exit ${PIPESTATUS[0]}
