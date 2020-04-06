#!/usr/bin/env bash

pegjs --optimize size \
  --output build/template.js \
  --format globals \
  --export-var Template \
  template.pegjs
