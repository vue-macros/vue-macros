#!/bin/bash

if which pnpm >/dev/null; then
  pnpm nuxt prepare
fi
