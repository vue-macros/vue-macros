#!/bin/bash

CWD=$(pwd)
if [[ ! $CWD =~ "renovate" ]]; then
  pnpm nuxt prepare
else
  echo "Skipping postinstall for renovate"
  echo "pwd: $CWD"
fi
