#!/bin/bash

if [ -f update.zip ]
then

	unzip -o update.zip
	rm update.zip

fi

cd magpie-data/_internal
../magpie-data --local --nested $@