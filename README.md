# LADXR-Tracker
A web based tracker specifically built for [LADXR](https://github.com/daid/LADXR), a Legend Of Zelda: Link's Awakening DX randomizer. Logic and available items and checks for a given set of flags are all supplied by an embedded copy of LADXR.

Visit us on the [Zelda 4 Randomizer Discord server](https://discord.gg/XTw7X2G) - tracker discussion happens in the #tracker-general channel. Suggestions and bug reports are very welcome.

Thanks to:
 - [MuffinJets](https://www.twitch.tv/muffinjets) for his [EmoTracker pack](https://github.com/muffinjets/ladx_maptracker_muffinjets_wolfman2000), which this is heavily based on
 - [Daid](https://github.com/daid) for creating [LADXR](https://github.com/daid/LADXR) and keeping it open

## Setup
Make sure you include submodules when cloning: `git clone --recurse-submodules https://github.com/kbranch/LADXR-Tracker.git`.

If you're not familiar with Git, you can download the tracker as a [zip file](https://github.com/kbranch/LADXR-Tracker/archive/refs/heads/master.zip). You'll also need to download a [separate zip for LADXR](https://github.com/kbranch/LADXR/archive/refs/heads/master.zip) and extract it to the LADXR folder.

**Note that the LADXR files should not be in a subfolder like `LADXR-master`** - its Python files (`worldSetup.py`, `checkMetadata.py`, etc.) should be in `LADXR-Tracker/LADXR/`, NOT in `LADXR-Tracker/LADXR/LADXR-master`.

### Linux (and Mac?)
 - Run `setup.sh` to create a python virtual environment and install the required packages
 - Run `startLocal.sh` to start as a local application - a browser window should open, and the application will exit when it is closed
 
### Windows
 - Install [Python3](https://www.python.org/downloads/)
   - Make sure you check the checkbox to `Add Python 3.x to PATH`
 - Run `setup.bat`
 - Run `startLocal.bat`

## Contributing layouts
Most of the layout definition happens in [Jinja templates](https://jinja.palletsprojects.com/en/3.1.x/). Simple changes can be done purely in the templates, but more complicated changes may involve Javascript or the item macro. Improvements and updates are always welcome.

The item layout is defined in [templates/items.html](templates/items.html). The circle of dungeon items is currently separated out into [templates/dungeonItems.html](templates/dungeonItems.html). [templates/item.html](templates/item.html) contains a macro that abstracts away some of the details.

The map layout is currently incomplete, but defined in [templates/map.html](templates/map.html).
