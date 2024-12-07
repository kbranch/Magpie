#!/bin/bash

if [ -f update.zip ]
then

	unzip -o update.zip
	rm update.zip

fi

cd magpie-data
./magpie-data --local --nested