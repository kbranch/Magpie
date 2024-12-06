#!/bin/bash

cd ..

rm -rf build dist

rm a.spec
ln -s magpie-data.spec a.spec
cp requirements-ndi.txt requirements.txt

git rev-list --count HEAD > version

npm install
npm run build

docker run -v "$(pwd):/src/" kbranch/pyinstaller-w64
docker run -v "$(pwd):/src/" kbranch/pyinstaller-l64

rm a.spec

cp scripts/magpie.bat dist/windows
cp scripts/magpie.sh dist/linux

cd dist/windows
zip -x \*__pycache__\* -r magpie-local-ndi.zip magpie-data magpie.bat

cd ../linux
zip -x \*__pycache__\* -r magpie-local-linux-ndi.zip magpie-data magpie.sh

cd ../../
rm version
cp requirements-no-ndi.txt requirements.txt