# Magpie
A web based tracker specifically built for [LADXR](https://github.com/daid/LADXR), a `Legend Of Zelda: Link's Awakening DX` randomizer.

The differentiating feature of Magpie compared to something like [EmoTracker](https://emotracker.net/) is the fact that it does not attempt to reimplement the randomizer's logic. Instead, it embeds a copy of the randomizer and simply asks it which locations are in logic given a set of flags and items.

The item, map and even flag layouts also include a text-based section for new items, locations and flags that were not accounted for when the layout was created.

Visit us on the [Zelda 4 Randomizer Discord server](https://discord.gg/yHxuDe3V) - tracker discussion happens in the #tracker-general channel. Suggestions and bug reports are very welcome.

Special thanks to:
 - [MuffinJets](https://twitter.com/muffinjets_) for his [EmoTracker pack](https://github.com/muffinjets/ladx_maptracker_muffinjets_wolfman2000), which this is essentially a port of, and for help with the design
 - [Daid](https://github.com/daid) for creating [LADXR](https://daid.github.io/LADXR/) and keeping it open

## Setup
### Downloading
Make sure you include submodules when cloning: `git clone --recurse-submodules https://github.com/kbranch/Magpie.git`.

If you're not familiar with Git, you can download Magpie as zip files:
 - Download the Magpie [zip file](https://github.com/kbranch/Magpie/archive/refs/heads/master.zip)
 - Download LADXR as a [separate zip](https://github.com/kbranch/LADXR/archive/refs/heads/master.zip)
 - Extract both zip files to separate folders (e.g. `Magpie-master` and `LADXR-master`
 - Copy everything from inside the `LADXR-master` folder into `Magpie-master/LADXR`

### Linux (and Mac?)
 - Run `setup.sh` to create a python virtual environment and install the required packages
 - Run `startLocal.sh` to start as a local application - a browser window should open, and the application will exit when it is closed
 
### Windows
 - Install [Python3](https://www.python.org/downloads/)
   - Make sure you check the checkbox to `Add Python 3.x to PATH`
 - Run `setup.bat`
 - Run `startLocal.bat`
 
## Usage
### Items
Items are tracked on the right side of the page. Left or right click on them to mark them as collected. Depending on the slot, right click will either mark an alternate item for that slot (e.g. red tunic, bomb capacity upgrade) or subtract one from the primary item.

If new items were added to the randomizer since Magpie was last updated, they will appear as text below the other items.

Item changes will be communicated to the randomizer and used to update the map.

### Locations
Locations are tracked on the left side of the page, either on the maps or as text below them. By default, left clicking a node on the map will toggle all checks inside it between checked and unchecked. Right clicking a node will keep the tooltip open and allow interacting with it. Left clicking an individual check inside the tooltip will toggle only that check.

Locations are also listed as text below the map, separated out by logic level. Checks can be toggled by clicking them in the text list.

If new locations were added to the randomizer since Magpie was last updated, they will appear as text below the map.

### Flags
Flags can be changed by clicking the gear icon in the upper right. These are passed to the randomizer and help determine which locations and items are shown as well as which locations are in logic.

Flags that were added to the randomizer after Magpie was last updated will appear in the list. Because flags can do a lot of different things, these may or may not be relevant or functional without an update to Magpie.

## Contributing layouts
Most of the layout definition happens in [Jinja templates](https://jinja.palletsprojects.com/en/3.1.x/). Simple changes can be done purely in the templates, but more complicated changes may involve Javascript or the item macro. Improvements and updates are always welcome.

The item layout is defined in [templates/items.html](templates/items.html). The circle of dungeon items is currently separated out into [templates/dungeonItems.html](templates/dungeonItems.html). [templates/item.html](templates/item.html) contains a macro that abstracts away some of the details.

Locations for the map are stored in [static/js/locations.js](static/js/locations.js). There is an interface at the [/mapCoords](https://magpietracker.us/mapCoords) route to help manage locations without manual JSON editing.
