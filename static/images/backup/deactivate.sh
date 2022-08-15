#!/bin/bash

rm *.png
cp ../*_1.png ./
rename 's/_1.png/_0.png/' *
find . -iname "*_0.png" -exec convert {} -colorspace Gray {} \;
find . -iname "*_0.png" -exec convert -brightness-contrast -15 {} {} \;

cp ../blank.png ../MAX_ARROWS_UPGRADE_0.png
cp ../blank.png ../MAX_BOMBS_UPGRADE_0.png
cp ../blank.png ../MAX_POWDER_UPGRADE_0.png
