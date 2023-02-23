#!/bin/bash

rm -rf build dist

rm a.spec
ln -s magpie-data.spec a.spec

docker run -v "$(pwd):/src/" kbranch/pyinstaller-w32
docker run -v "$(pwd):/src/" kbranch/pyinstaller-l64

rm a.spec

cp magpie.bat dist/windows
cp magpie.sh dist/linux

cd dist/windows
zip -r magpie-local.zip magpie-data magpie.bat

cd ../linux
zip -r magpie-local-linux.zip magpie-data magpie.sh

cd ../../
zip -r dist/magpie-source.zip autotracking LADXR static templates *.*
