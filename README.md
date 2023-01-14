# Magpie
A web based tracker specifically built for [LADXR](https://github.com/daid/LADXR), a `Legend Of Zelda: Link's Awakening DX` randomizer.

The differentiating feature of Magpie compared to something like [EmoTracker](https://emotracker.net/) is the fact that it does not attempt to reimplement the randomizer's logic. Instead, it embeds a copy of the randomizer and simply asks it which locations are in logic given a set of flags and items.

The item, map and even flag layouts also include a text-based section for new items, locations and flags that were not accounted for when the layout was created.

Visit us on the [Zelda 4 Randomizer Discord server](https://discord.gg/QhAKagk84e) - tracker discussion happens in the #tracker-general channel. Suggestions and bug reports are very welcome.

Special thanks to:
 - [MuffinJets](https://twitter.com/muffinjets_) for his [EmoTracker pack](https://github.com/muffinjets/ladx_maptracker_muffinjets_wolfman2000), which this is essentially a port of, and for help with the design
 - [Daid](https://github.com/daid) for creating [LADXR](https://daid.github.io/LADXR/) and keeping it open
 - [Artemis251](http://artemis251.fobby.net/zelda/index.php) for the great map resources and screenshots

## Setup
### Releases
The latest version of the compiled local version is always available at [https://magpietracker.us/static/Magpie-local.zip](https://magpietracker.us/static/Magpie-local.zip). This should always match the [main site](https://magpietracker.us/).
### From Source
#### Downloading
Make sure you include submodules when cloning: `git clone --recurse-submodules https://github.com/kbranch/Magpie.git`.

If you're not familiar with Git, you can download Magpie as zip files:
 - Download the Magpie [zip file](https://github.com/kbranch/Magpie/archive/refs/heads/master.zip)
 - Download LADXR as a [separate zip](https://github.com/kbranch/LADXR/archive/refs/heads/master.zip)
 - Extract both zip files to separate folders (e.g. `Magpie-master` and `LADXR-master`
 - Copy everything from inside the `LADXR-master` folder into `Magpie-master/LADXR`

#### Linux (and Mac?)
 - Run `setup.sh` to create a python virtual environment and install the required packages
 - Run `startLocal.sh` to start as a local application - a browser window should open, and the application will exit when it is closed
 
#### Windows
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

### Autotracker
Magpie uses a separate autotracker program that runs locally and communicates with the wite via websockets. The latest compiled autotracker is always availabe at [https://magpietracker.us/static/magpie-autotracker.exe](https://magpietracker.us/static/magpie-autotracker.exe) or from a link in the autotracker mini tab on the site.

No setup should be required beyond enabling autotracking in Magpie - just start the autotracker and a compatible emulator.

Settings are available in the main Magpie UI to control what data gets pulled from the autotracker.

#### Compatibility
Currently, [BGB](https://bgb.bircd.org/) and [RetroArch](https://www.retroarch.com/) are supported. BGB works under Windows and on Linux via Wine (the autotracker exe must also be run with Wine), while RetroArch works natively on both Windows and Linux. RetroArch requires the [Network Control Interface](https://docs.libretro.com/development/retroarch/network-control-interface/) to be turned on.

The autotracker requires a copy of the ROM for some features to work. When it is not able to pull the ROM directly from the emulator, it will request a copy from the user in the main Magpie UI.

### Spoiler Log

The spoiler log minitab allows you to upload either a JSON spoiler log or a ROM itself. Once loaded, individual checks and entrances can be spoiled by right clicking on them. Hovering over an item in the item tracker will highlight its location on the map if it has been marked(/spoiled)
 
The `Spoil collected items` setting will mark checks with the item they contain as you check them off. Those items are automatically added to your inventory so you never have to interact with the item tracker. Similarly, manually spoiling visited entrances can reduce the time required to track entrances.

For a more comprehensive spoiler log tool, check out the [spoiler log viewer](https://kabarakh.github.io/ladxr-spoiler-interface/) by [Kabarakh](https://github.com/kabarakh).

## Contributing layouts
Most of the layout definition happens in [Jinja templates](https://jinja.palletsprojects.com/en/3.1.x/). Simple changes can be done purely in the templates, but more complicated changes may involve Javascript or the item macro. Improvements and updates are always welcome.

The item layouts are defined in [templates/mainitems](templates/mainitems) and [templates/dungeonitems](templates/dungeonitems). Each file is selectable from a dropdown in the settings pane. Contributions are welcome - send me a new template or make a pull request and I'll get it added!

[templates/item.html](templates/item.html) contains a macro that abstracts away most of the details.

Check locations for the map are stored in [static/js/checkMetadata.js](static/js/checkMetadata.js), entrances are in [static/js/entranceMetadata.js](static/js/entranceMetadata.js), and connectors are in [static/js/connectorMetadata.js](static/js/connectorMetadata.js). There is an interface at the [/mapCoords](https://magpietracker.us/mapCoords) route to help manage locations without manual JSON editing, although it's often broken - I generally tweak it to do exactly what I need at the time.
