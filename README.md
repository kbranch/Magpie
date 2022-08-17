# LADXR-Tracker
A web based tracker specifically built for LADXR. Logic and available items and checks for a given set of flags are all supplied by an embedded copy of LADXR.

Thanks to:
 - [MuffinJets](https://www.twitch.tv/muffinjets) for his EmoTracker pack, which this is heavily based on
 - [Daid](https://github.com/daid) for creating LADXR and keeping it open

## Contributing layouts
The item layout is defined by the [Jinja template](https://jinja.palletsprojects.com/en/3.1.x/) [templates/items.html](templates/items.html). The circle of dungeon items is currently separated out into [templates/dungeonItems.html](templates/dungeonItems.html). [templates/item.html](templates/item.html) contains a macro that abstracts away some of the details.

The map layout is currently incomplete, but defined in [templates/map.html](templates/map.html).

Simple changes can be done purely in the templates, but more complicated changes may involve Javascript or the item macro.

## Setup
Make sure you include submodules when cloning: `git clone --recurse-submodules https://github.com/kbranch/LADXR-Tracker.git`. If downloading a zip from GitHub, you'll also need to download a [separate zip for LADXR](https://github.com/kbranch/LADXR-Tracker/archive/refs/heads/master.zip) and extract it to the LADXR folder.
### Linux (and Mac?)
 - Run `setup.sh` to create a python virtual environment and install the required packages
 - Run `startLocal.sh` to start as a local application - a browser window should open, and the application will exit when it is closed
 
### Windows
 - Install [Python3](https://www.python.org/downloads/)
   - Make sure you check the checkbox to `Add Python 3.x to PATH`
 - Run `setup.bat`
 - Run `startLocal.bat`
