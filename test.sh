#!/usr/bin/env bash

env TESTBUILD=1 npx webpack --mode development
npx mocha test-dist/main.js
