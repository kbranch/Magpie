#!/bin/bash

rm -rf build dist
rm a.spec

ln -s magpie-autotracker.spec a.spec

docker run -v "$(pwd):/src/" kbranch/pyinstaller-w32
docker run -v "$(pwd):/src/" kbranch/pyinstaller-l64

rm a.spec