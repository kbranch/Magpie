#!/bin/bash

cd ..

rm -rf build dist

rm a.spec
ln -s magpie-data.spec a.spec

git rev-list --count HEAD > version

docker run -v "$(pwd):/src/" kbranch/pyinstaller-w64
docker run -v "$(pwd):/src/" kbranch/pyinstaller-l64

rm version
rm a.spec

cp scripts/magpie.bat dist/windows
cp scripts/magpie.sh dist/linux
cp settings.json dist/windows
cp settings.json dist/linux

cd dist/windows
zip -x \*__pycache__\* -r magpie-local.zip magpie-data magpie.bat

cd ../linux
zip -x \*__pycache__\* -r magpie-local-linux.zip magpie-data magpie.sh

cd ../../
zip -x static/images/temp/\* -x \*__pycache__\* -x \*.gbc -x \*.venv/\* -r dist/magpie-source.zip autotracking LADXR static scripts templates *.*
