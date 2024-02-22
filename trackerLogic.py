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

fishing_item = '0x2B1'
trendy_item = '0x2A0-Trade'
witch_item = '0x2A2'
raft_game = '0x05C'
d0_first_check = '0x314'
d2_pit_chest = '0x139'
d2_outside_boo = '0x126'
d8_pot = '0x259'
d8_cracked_floor = '0x23E'
d8_lava_ledge = '0x235'

def build(args, worldSetup):
    r = RequirementsSettings(args)
    # Bomb as bush breaker
    r.bush._OR__items.append(BOMB)

    log = buildLogic(args, worldSetup, r)
    log.name = 'tracker'

    locs = {}

    for loc in log.location_list:
        if loc.items:
            locs[loc.items[0].nameId] = loc
    
    if fishing_item in locs: # Fishing game without bush
        locs[fishing_item].connect(locs[fishing_item].gated_connections[0][0], COUNT('RUPEES', 20))

    # A bunch of powder pickups
    if trendy_item in locs:
        locs[trendy_item].simple_connections[0][0].connect(Location().add(VanillaItem(0x2A0)), COUNT('RUPEES', 10))
    if witch_item in locs:
        locs[witch_item].simple_connections[0][0].connect(Location().add(VanillaItem(0x2A22)), POWER_BRACELET)
    if raft_game in locs:
        locs[raft_game].connect(Location().add(VanillaItem(0x07F)), OR(FEATHER, ROOSTER))
    if d0_first_check in locs:
        locs[d0_first_check].simple_connections[0][0].connect(Location(0).add(VanillaItem(0x30E)), POWER_BRACELET)
    if d2_pit_chest in locs:
        locs[d2_pit_chest].add(VanillaItem(0x1392))
    if d2_outside_boo in locs:
        locs[d2_outside_boo].connect(Location(2).add(VanillaItem(0x1212)), FEATHER)
    if d8_pot in locs:
        locs[d8_pot].simple_connections[0][0].connect(Location(8).add(VanillaItem(0x258)), AND(POWER_BRACELET, FEATHER))
    if d8_cracked_floor in locs:
        locs[d8_cracked_floor].connect(Location(8).add(VanillaItem(0x23E2)), FEATHER)
    if d8_lava_ledge in locs:
        locs[d8_lava_ledge].connect(Location().add(VanillaItem(0x2352)), FEATHER)

    return log

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

def buildLogic(args, worldSetup, requirements=None):
    log = logic.Logic(args, world_setup=worldSetup, requirements_settings=requirements)

    for loc in log.location_list:
        for ii in [x for x in loc.items if len(x.OPTIONS) == 1]:
            ii.item = ii.OPTIONS[0]
    
    return log