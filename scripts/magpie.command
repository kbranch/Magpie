#!/bin/bash

fileDir=$(dirname $0)
cd $fileDir

if [ $(which python3) == "/usr/bin/python3" ]; then

	echo "Magpie likely will not work correctly with macOS's built in Python version. Please install Python from https://www.python.org/downloads/macos/ and try again."
	read -n 1 -p "Press enter to continue anyway" "input"

fi

if [ -f update.zip ]
then

	unzip -o update.zip
	rm update.zip

fi

if [ ! -d magpie-source/.vemv ]
then

	cd magpie-source/scripts
	bash setup.sh
	cd $fileDir

fi

cd magpie-source
. .venv/bin/activate
open "http://0.0.0.0:16114/"
python3 magpie.py --local --nested --no-gui $@
