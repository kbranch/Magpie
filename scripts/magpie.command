#!/bin/bash

fileDir="$(cd "$(dirname "$0")"; pwd)"
cd $fileDir

if [ $(which python3) == "/usr/bin/python3" ]; then

	echo "Magpie likely will not work correctly with macOS's built in Python version. Please install Python from https://www.python.org/downloads/macos/ and try again."
	read -n 1 -p "Press enter to continue anyway" "input"

fi

if [ -f update.zip ]
then

	echo Extracting update
	unzip -o update.zip
	rm update.zip

fi

if [ ! -d magpie-source/.venv ]
then

	echo Setting up environment
	cd magpie-source/scripts
	bash setup.sh

fi

echo Activating environment
cd $fileDir/magpie-source

. .venv/bin/activate

if [ "$1" != "--no-gui" ]; then

	echo Opening browser
	open "http://0.0.0.0:16114/"

fi

echo Staring Magpie
python3 magpie.py --local --nested --no-gui $@
