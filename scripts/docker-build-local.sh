#!/bin/bash

cd ..

rm -rf build dist

rm a.spec
ln -s magpie-data.spec a.spec

git rev-list --count HEAD > version

npm install
npm run build

docker run -v "$(pwd):/src/" kbranch/pyinstaller-w64
docker run -v "$(pwd):/src/" kbranch/pyinstaller-l64

rm a.spec

cp scripts/magpie.bat dist/windows
cp scripts/magpie.sh dist/linux

cd dist/windows
zip -x \*__pycache__\* -r magpie-local.zip magpie-data magpie.bat

cd ../linux
zip -x \*__pycache__\* -r magpie-local-linux.zip magpie-data magpie.sh

cd ../../
zip -x \*node_modules\* -x static/images/temp/\* -x \*__pycache__\* -x \*.gbc -x \*.venv/\* -r dist/magpie-source.zip autotracking LADXR static scripts templates src version vue-dist/assets vue-dist/index.html .env *.*

rm version