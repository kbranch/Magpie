#!/bin/bash

rm -rf build dist
rm a.spec

ln -s magpie-autotracker.spec a.spec
git rev-list --count HEAD > autotracking/autotracker-version

docker run -v "$(pwd):/src/" kbranch/pyinstaller-w64
docker run -v "$(pwd):/src/" kbranch/pyinstaller-l64

rm a.spec
rm autotracking/autotracker-version
