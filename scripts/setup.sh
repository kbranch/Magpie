#!/bin/bash

cd ..
python3 -m venv .venv
. .venv/bin/activate

npm install
npm run build

pip install -r requirements.txt

cd scripts