#!/bin/bash

cd ..
python3 -m venv .venv
. .venv/bin/activate

cd magpie-vue
npm install
npm run build
cd ..

pip install -r requirements.txt

cd scripts