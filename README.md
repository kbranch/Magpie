# Magpie
Primary hosting at [https://magpietracker.us/](https://magpietracker.us/)

A web based tracker specifically built for [LADXR](https://github.com/daid/LADXR), a `Legend Of Zelda: Link's Awakening DX` randomizer.

The differentiating feature of Magpie compared to something like [EmoTracker](https://emotracker.net/) is the fact that it does not attempt to reimplement the randomizer's logic. Instead, it embeds a copy of the randomizer and simply asks it which locations are in logic given a set of flags and items.

The item, map and even flag layouts also include a text-based section for new items, locations and flags that were not accounted for when the layout was created.

Visit us either on the [Zelda 4 Randomizer Discord server](https://discord.gg/QhAKagk84e) in `#tracker-general` or the [Magpie Discord server](https://discord.gg/YYSXW2HvT4). Suggestions and bug reports are very welcome.

Special thanks to:
 - [MuffinJets](https://twitter.com/muffinjets_) for his [EmoTracker pack](https://github.com/muffinjets/ladx_maptracker_muffinjets_wolfman2000), which this started out as a port of, and for help with the design
 - [Daid](https://github.com/daid) for creating [LADXR](https://daid.github.io/LADXR/) and keeping it open
 - [Artemis251](http://artemis251.fobby.net/zelda/index.php) for the great map resources and screenshots

## Setup
### Releases
Several packages are available:
- Local, offline version that should always match the [main site](https://magpietracker.us/)
  - [Windows](https://magpietracker.us/static/builds/magpie-local.zip)
  - [Windows with NDI support](https://magpietracker.us/static/builds/magpie-local-ndi.zip)
  - [Linux](https://magpietracker.us/static/builds/magpie-local-linux.zip)
  - [Linux with NDI support](https://magpietracker.us/static/builds/magpie-local-linux-ndi.zip)
  - [Source](https://magpietracker.us/static/builds/magpie-source.zip)
- Autotracker
  - [Windows](https://magpietracker.us/static/builds/magpie-autotracker.exe)
  - [Linux](https://magpietracker.us/static/builds/magpie-autotracker-linux)

### From Source

If pulling updates, make sure you also do a `git submodule update` to keep Magpie in sync with LADXR.

For NDI support, use `setup-ndi.(sh/bat)` instead of `setup.(sh/bat)`, below. NDI support also requires Python <=3.10 (to a point, I'm not sure how old you can go).

#### Downloading
The easiest option is to download the [source bundle](https://magpietracker.us/static/builds/magpie-source.zip).

If you're a developer or need a specific version of the source, the best option is Git. Make sure you include submodules when cloning: `git clone --recurse-submodules https://github.com/kbranch/Magpie.git`.

If you're not familiar with Git, you can download Magpie as zip files:
 - Download the Magpie [zip file](https://github.com/kbranch/Magpie/archive/refs/heads/master.zip)
 - Download LADXR as a [separate zip](https://github.com/kbranch/LADXR/archive/refs/heads/master.zip)
   - Note that it's hard to determine which branch of LADXR is required for any given version of Magpie. Use the [source bundle](https://magpietracker.us/static/builds/magpie-source.zip) to avoid that issue.
 - Extract both zip files to separate folders (e.g. `Magpie-master` and `LADXR-master`)
 - Copy everything from inside the `LADXR-master` folder into `Magpie-master/LADXR`

#### Linux (and Mac?)
 - Install [`npm`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#linux-or-other-operating-systems-node-installers)
 - Run `setup.sh` to create a python virtual environment and install the required packages
 - Run `startLocal.sh` to start as a local application - a browser window should open, and the application will exit when it is closed
   - If you're hosting your own instance without a WSGI server, just make sure `magpie.py` gets launched with the venv created above (e.g. `. .venv/bin/activate && python3 magpie.py`)
 
#### Windows
 - Install [Python3](https://www.python.org/downloads/)
   - Make sure you check the checkbox to `Add Python 3.x to PATH`
 - Install [`npm`](https://nodejs.org/en/download/prebuilt-installer)
 - If using `git clone` and you run into problems, try enabling symlinks in git before cloning. The details probably depend on your system, but [this may help](https://stackoverflow.com/a/59761201)
 - Run `setup.bat`
 - Run `startLocal.bat`

## Usage
### Items
Items are tracked on the right side of the page. Left or right click on them to mark them as collected. Depending on the slot, right click will either mark an alternate item for that slot (e.g. red tunic, bomb capacity upgrade) or subtract one from the primary item.

If new items were added to the randomizer since Magpie was last updated, they will appear as text below the other items.

Item changes will be communicated to the randomizer and used to update the map.

Check out the [custom item layout documentation](/CustomItemLayouts.md).

### Locations
Locations are tracked on the left side of the page, either on the maps or as text below them. By default, left clicking a node on the map will toggle all checks inside it between checked and unchecked. Right clicking a node will keep the tooltip open and allow interacting with it. Left clicking an individual check inside the tooltip will toggle only that check.

Locations are also listed as text below the map, separated out by logic level. Checks can be toggled by clicking them in the text list.

If new locations were added to the randomizer since Magpie was last updated, they will appear as text below the map.

### Flags
Flags can be changed by clicking the gear icon in the upper right. These are passed to the randomizer and help determine which locations and items are shown as well as which locations are in logic.

Flags that were added to the randomizer after Magpie was last updated will appear in the list. Because flags can do a lot of different things, these may or may not be relevant or functional without an update to Magpie.

### Streaming
Here's a summary of your options:
| OBS Source | Version |   |
| - | - | - |
| Browser window capture | Web | Capture the [items](https://magpietracker.us/itemsBroadcast) and [map](https://magpietracker.us/mapBroadcast) broadcast views. Will not work as a browser source in the web version |
| [Browser source](https://obsproject.com/kb/browser-source) | Offline | Same as above, but it works as a browser source in the offline version |
| [NDI](https://obsproject.com/forum/resources/obs-ndi-newtek-ndi%E2%84%A2-integration-into-obs-studio.528/) | Offline w/NDI | Can be enabled in the settings pane in the offline version. See below for limitations. |
| Non-browser window capture | Offline | Same as NDI, except the image loads into a native (non-browser) window instead |

The best option for streaming is likely to be using the web-based broadcast views ([items](https://magpietracker.us/itemsBroadcast), [map](https://magpietracker.us/mapBroadcast)) in the **offline** version as an [OBS browser source](https://obsproject.com/kb/browser-source). Note that the broadcast views can have totally different settings for layout, color, visibility, etc. than the main UI.

Check out the [custom item layout documentation](/CustomItemLayouts.md) if you want a special stream layout.

The offline version also has NDI support and can display the items and map in native (non-browser) windows, but these options have some limitations:
 - Turning the page into images takes a lot of processing time, which means that Magpie will stutter briefly when updating
 - Unlike the web-based broadcast view, the layout must match the main UI
 - NDI requires using a separate build with NDI support enabled ([Windows](https://magpietracker.us/static/builds/magpie-local-ndi.zip), [Linux](https://magpietracker.us/static/builds/magpie-local-linux-ndi.zip))

You *could* mitigate these limitations by changing the web-based broadcast views' settings so that they're responsible for the NDI/native window support, but that seems like even more of a rube goldberg machine.

### Restreaming

Magpie also has a restreaming page, where the items from multiple players are displayed and automatically updated based on those players' trackers. Each player must use the sharing button to connect to the same event name (make sure `Live Update` is checked). The sharing button also provides a link to the event page that the restreamer would capture.

## Autotracker
Magpie uses a separate autotracker program that runs locally and communicates with the site via websockets. The latest packaged autotracker is always available at [https://magpietracker.us/static/builds/magpie-autotracker.exe](https://magpietracker.us/static/builds/magpie-autotracker.exe) or from a link in the autotracker mini tab on the site.

No setup should be required beyond enabling autotracking in Magpie - just start the autotracker and a compatible emulator.

Settings are available in the main Magpie UI to control what data gets pulled from the autotracker.

Check out the [API](https://github.com/kbranch/Magpie/wiki/Autotracker-API) for 3rd party tools.

### Linux (and Mac?)
Autotracking should work on any vaguely recent version of Linux that can also run a [compatible emulator](#emulator-compatibility). Mac support is untested but probably similar.

Setup is similar to the local version of Magpie:
 - [Download the source](#downloading)
 - Run [autotracker/setup.sh](https://github.com/kbranch/Magpie/blob/master/autotracking/setup.sh) to set up the environment
 - Run [autotracker/start.sh](https://github.com/kbranch/Magpie/blob/master/autotracking/start.sh) to start the autotracker

### Emulator Compatibility
Currently, [BGB](https://bgb.bircd.org/), [RetroArch](https://www.retroarch.com/) and [Bizhawk](https://tasvideos.org/Bizhawk) are supported. BGB works under Windows and on Linux via Wine (the autotracker exe must also be run with Wine), while RetroArch works natively on both Windows and Linux. RetroArch requires the [Network Control Interface](https://docs.libretro.com/development/retroarch/network-control-interface/) to be turned on (Archipelago has a [good guide](https://archipelago.gg/tutorial/Links%20Awakening%20DX/setup/en#retroarch-1.10.3-or-newer)). Bizhawk requires a [LUA script](https://magpietracker.us/static/bizhawk-ladxr.zip) (taken from [Archipelago](https://github.com/ArchipelagoMW/Archipelago)).

The autotracker requires a copy of the ROM for some features to work. When it is not able to pull the ROM directly from the emulator, it will request a copy from the user in the main Magpie UI.

## Spoiler Log

The spoiler log minitab allows you to upload either a JSON spoiler log or a ROM itself. Once loaded, individual checks and entrances can be spoiled by right clicking on them. Hovering over an item in the item tracker will highlight its location on the map if it has been marked(/spoiled)
 
The `Spoil collected items` setting will mark checks with the item they contain as you check them off. Those items are automatically added to your inventory so you never have to interact with the item tracker. Similarly, manually spoiling visited entrances can reduce the time required to track entrances.

For a more comprehensive spoiler log tool, check out the [spoiler log viewer](https://kabarakh.github.io/ladxr-spoiler-interface/) by [Kabarakh](https://github.com/kabarakh).
