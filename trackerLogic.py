import os
import bdb
import sys

sys.path.append(os.path.abspath('LADXR/'))

import logic
from checkMetadata import checkMetadataTable, CheckMetadata
from logic.location import Location
from logic.requirements import AND, OR, COUNT, COUNTS, FOUND, RequirementsSettings
from locations.itemInfo import ItemInfo

from locations.items import *

class VanillaItem(ItemInfo):
    def __init__(self, room):
        super().__init__(room)

class Debug(bdb.Bdb):
    def user_line(self, frame):
        for k, v in frame.f_locals.items():
            if isinstance(v, Location) and k not in {"self", "location", "                                                                                                             other", "connection"}:
                v.local_name = k

vanillaBySetting = {
    'heartpiece': {'0x000', '0x2A4', '0x044', '0x2AB', '0x2DF', '0x2E5', '0x078', '0x2E6', '0x1E8', '0x1F2', '0x2BA', '0x2B1'},
    'seashells': {'0x0A3', '0x0D2', '0x2B2', '0x1E3', '0x074', '0x0A5', '0x0A6', '0x08B', '0x0A4', '0x0B9', '0x0E9', '0x0F8', '0x0A8', '0x0DA', '0x0FF', '0x00C'},
    'heartcontainers': {'0x106', '0x12B', '0x15A', '0x166', '0x185', '0x1BC', '0x223', '0x234'},
    'instruments': {'0x102', '0x12A', '0x159', '0x162', '0x182', '0x1B5', '0x22C', '0x230'},
    'tradequest': {'0x2A0-Trade', '0x2A6-Trade', '0x2B2-Trade', '0x2FE-Trade', '0x07B-Trade', '0x087-Trade', '0x2D7-Trade', '0x019-Trade', '0x2D9-Trade', '0x2A8-Trade', '0x0CD-Trade', '0x2F5-Trade', '0x0C9-Trade', '0x297-Trade'},
    'witch': {'0x2A2', '0x050'},
    # 'rooster': {'0x1E4'},
}

vanillaContents = {
    '0x102': 'INSTRUMENT1',
    '0x12A': 'INSTRUMENT2',
    '0x159': 'INSTRUMENT3',
    '0x162': 'INSTRUMENT4',
    '0x182': 'INSTRUMENT5',
    '0x1B5': 'INSTRUMENT6',
    '0x22C': 'INSTRUMENT7',
    '0x230': 'INSTRUMENT8',
    '0x0A3': 'SEASHELL',
    '0x0D2': 'SEASHELL',
    '0x2B2': 'SEASHELL',
    '0x1E3': 'SEASHELL',
    '0x074': 'SEASHELL',
    '0x0A5': 'SEASHELL',
    '0x0A6': 'SEASHELL',
    '0x08B': 'SEASHELL',
    '0x0A4': 'SEASHELL',
    '0x0B9': 'SEASHELL',
    '0x0E9': 'SEASHELL',
    '0x0F8': 'SEASHELL',
    '0x0A8': 'SEASHELL',
    '0x0DA': 'SEASHELL',
    '0x0FF': 'SEASHELL',
    '0x00C': 'SEASHELL',
}

vanillaIds = set()

fishing_item = '0x2B1'
trendy = 'Trendy Shop'
witch = "Witch's Hut"
raft_game = '0x05C'
d0_entrance = 'D0 Entrance'
d2_pit_chest = '0x139'
d2_outside_boo = '0x126'
d8_pot = 'D8 Entrance'
d8_cracked_floor = '0x23E'
d8_lava_ledge = '0x235'

def updateVanilla(args):
    global vanillaIds

    vanillaIds.clear()

    for flag in args.flags:
        if flag.name in vanillaBySetting and not flag.value:
            vanillaIds = vanillaIds.union(vanillaBySetting[flag.name])

    if not args.instruments and args.goal == 'seashells':
        vanillaIds -= vanillaBySetting['instruments']

def applyTrackerLogic(log):
    # Bomb as bush breaker
    log.requirements_settings.bush._OR__items.append(BOMB)

    locs = {}

    for loc in log.location_list:
        locs[loc.friendlyName()] = loc
    
    if fishing_item in locs: # Fishing game without bush
        locs[fishing_item].connect(locs['Mabe Village'], COUNT('RUPEES', 20))

    # A bunch of powder pickups
    if trendy in locs:
        locs[trendy].connect(Location().add(VanillaItem(0x2A0)), COUNT('RUPEES', 10))
    if witch in locs:
        locs[witch].connect(Location().add(VanillaItem(0x2A22)), POWER_BRACELET)
    if raft_game in locs:
        locs[raft_game].connect(Location().add(VanillaItem(0x07F)), OR(FEATHER, ROOSTER))
    if d0_entrance in locs:
        locs[d0_entrance].connect(Location(dungeon=0).add(VanillaItem(0x30E)), POWER_BRACELET)
    if d2_pit_chest in locs:
        locs[d2_pit_chest].connect(Location(dungeon=2).add(VanillaItem(0x1392)), FEATHER)
    if d2_outside_boo in locs:
        locs[d2_outside_boo].connect(Location(dungeon=2).add(VanillaItem(0x1212)), FEATHER)
    if d8_pot in locs:
        locs[d8_pot].connect(Location(dungeon=8).add(VanillaItem(0x258)), AND(POWER_BRACELET, FEATHER))
    if d8_cracked_floor in locs:
        locs[d8_cracked_floor].connect(Location(dungeon=8).add(VanillaItem(0x23E2)), FEATHER)
    if d8_lava_ledge in locs:
        locs[d8_lava_ledge].connect(Location(dungeon=8).add(VanillaItem(0x2352)), FEATHER)

def updateMetadata(table):
    table['0x2A0'] = CheckMetadata('Trendy Powder', 'Mabe Village')
    table['0x2A22'] = CheckMetadata('Witch Powder', 'Koholint Prairie')
    table['0x07F'] = CheckMetadata('Raft Powder', 'Rapids Ride')
    table['0x30E'] = CheckMetadata('Pot Powder', 'Color Dungeon')
    table['0x1392'] = CheckMetadata('Pit Flying Powder', 'Bottle Grotto')
    table['0x1212'] = CheckMetadata('Outside Boo Buddies Flying Powder', 'Bottle Grotto')
    table['0x258'] = CheckMetadata('Pot Flying Powder', 'Turtle Rock')
    table['0x23E2'] = CheckMetadata('Cracked Floor Flying Powder', 'Turtle Rock')
    table['0x2352'] = CheckMetadata('Lava Ledge Flying Powder', 'Turtle Rock')
    table['egg'] = CheckMetadata('Nightmare', 'Tal Tal Mountains')

def buildLogic(args, worldSetup, requirements=None):
    if worldSetup.goal == 'open':
        worldSetup.goal = -1

    log = logic.Logic(args, world_setup=worldSetup, requirements_settings=requirements)

    for loc in log.location_list:
        for ii in [x for x in loc.items if len(x.OPTIONS) == 1]:
            ii.item = ii.OPTIONS[0]
        # for ii in [x for x in loc.items if x.nameId in vanillaIds and x.nameId in vanillaContents]:
        #     ii.item = vanillaContents[ii.nameId]
    
    return log