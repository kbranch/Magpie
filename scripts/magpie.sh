#!/bin/bash

if [ -f magpie-data/update.zip ]
then

	mv magpie-data/update.zip .

fi

if [ -f update.zip ]
then

	echo Extracting update
	unzip -o update.zip
	rm update.zip

fi

cd magpie-data/_internal
../magpie-data --local --double-nested $@