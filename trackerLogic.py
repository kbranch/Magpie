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

class LogicHint(ItemInfo):
    def __init__(self, name):
        self.name = name
        super().__init__(0)
    
    @property
    def nameId(self):
        return self.name

class Debug(bdb.Bdb):
    def user_line(self, frame):
        for k, v in frame.f_locals.items():
            if isinstance(v, Location) and k not in {"self", "location", "                                                                                                             other", "connection"}:
                v.local_name = k

class NOT:
    __slots__ = ('__items')

    def __new__(cls, *args):
        if False in args:
            return True
        return super().__new__(cls)

    def __init__(self, *args):
        self.__items = [item for item in args if isinstance(item, str)]

    def __repr__(self) -> str:
        return "not%s" % (self.__items)

    def test(self, inventory) -> bool:
        for item in self.__items:
            if item in inventory:
                return False

        return True

    def hasConsumableRequirement(self):
        return False

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
mabe = 'Mabe Village'
witch = "Witch's Hut"
raft_game = '0x05C'
d0_entrance = 'D0 Entrance'
d1_three_of_a_kind = '0x10A'
d1_right_side = 'D1 Right Side'
d2_pit_chest = '0x139'
d2_outside_boo = '0x126'
d4_tektite_crystal = '0x17B'
d4_right_of_entrance = '0x178'
d7_three_of_a_kind = '0x211'
d7_topright_pillar_area = 'D7 Ball Room'
d8_pot = 'D8 Entrance'
d8_cracked_floor = '0x23E'
d8_lava_ledge = '0x235'
d8_upper_center = 'D8 Dodongo Area'
fisher = '0x2F5-Trade'
bay_water = 'Bay Water'
animal_village = 'Animal Village'
ukuku = 'Ukuku Prairie'
angler_keyhole = 'Near D4 Keyhole'
kanalet_side = 'Next to Kanalet'
bird_cave = 'Bird Cave'
desert = 'Desert'
fire_cave_north = 'Fire Cave North'
fire_cave_south = 'Fire Cave South'
bird_key = '0x27A'
armos_maze = 'Armos Maze'
outside_armos_cave = 'Outside Armos Maze Cave'
outside_armos_temple = 'Outside Southern Shrine'
d8_entrance_left = 'D8 After Hinox'
d8_vire_drop_key = '0x24C'

def updateVanilla(args):
    global vanillaIds

    vanillaIds.clear()

    for flag in args.flags:
        if flag.name in vanillaBySetting and not flag.value:
            vanillaIds = vanillaIds.union(vanillaBySetting[flag.name])

    if not args.instruments and args.goal == 'seashells':
        vanillaIds -= vanillaBySetting['instruments']

def andShortName(self, logic):
    if self in logic.requirements_settings.names:
        return f'{logic.requirements_settings.names[self]}({str(self)})'

    return f"{type(self).__name__.lower()}{self._AND__items + [x.shortName(logic) for x in self._AND__children]}"

def orShortName(self, logic):
    if self in logic.requirements_settings.names:
        return f'{logic.requirements_settings.names[self]}({str(self)})'

    return f"{type(self).__name__.lower()}{self._OR__items + [x.shortName(logic) for x in self._OR__children]}"

def otherShortName(self, logic):
    return str(self)

def patchRequirements():
    setattr(AND, 'shortName', andShortName)
    setattr(OR, 'shortName', orShortName)
    setattr(NOT, 'shortName', otherShortName)
    setattr(COUNT, 'shortName', otherShortName)
    setattr(COUNTS, 'shortName', otherShortName)
    setattr(FOUND, 'shortName', otherShortName)

def applyTrackerLogic(log):
    # Bomb as bush breaker
    log.requirements_settings.bush._OR__items.append(BOMB)
    log.requirements_settings.attack_wizrobe._OR__items.append(BOW)

    locs = {}

    for loc in log.location_list:
        locs[loc.friendlyName()] = loc

    # Fishing game without bush
    if fishing_item in locs and mabe in locs:
        locs[fishing_item].connect(locs[mabe], COUNT('RUPEES', 20))
    
    # Fisher under the bridge without feather - not bad as listed when the photo mouse isn't there
    if fisher in locs and bay_water in locs:
        if log.name in ("hard", "glitched", "hell"):
            locs[fisher].connect(locs[bay_water], AND(TRADING_ITEM_FISHING_HOOK, OR(SWORD, BOW), FLIPPERS))

        if log.name in ("glitched", "hell"):
            locs[fisher].connect(locs[bay_water], AND(log.requirements_settings.bomb_trigger, FLIPPERS))

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
        locs[d8_upper_center].connect(Location(dungeon=8).add(VanillaItem(0x23E2)), FEATHER)
    if d8_lava_ledge in locs:
        locs[d8_lava_ledge].connect(Location(dungeon=8).add(VanillaItem(0x2352)), FEATHER)

    # Rooster across the river
    if animal_village in locs and ukuku in locs:
        river_rooster = Location().add(LogicHint('RiverRooster'))
        locs[animal_village].connect(river_rooster, AND(ROOSTER, NOT(FLIPPERS)), one_way=True)
        locs[ukuku].connect(river_rooster, AND(ROOSTER, NOT(FLIPPERS)), one_way=True)

    # fly from staircase to staircase on the north side of the moat
    if angler_keyhole in locs and kanalet_side in locs:
        kanalet_rooster = Location().add(LogicHint('KanaletRooster'))
        locs[angler_keyhole].connect(kanalet_rooster, AND(ROOSTER, NOT(FLIPPERS)), one_way=True)
        locs[kanalet_side].connect(kanalet_rooster, AND(ROOSTER, NOT(FLIPPERS)), one_way=True)

    # Drop in a hole at bird cave
    if log.name != "casual" and bird_cave in locs:
        bird_pits = Location().add(LogicHint('BirdPits'))
        locs[bird_cave].connect(bird_pits, None, one_way=True)  
    
    # Fall down Lanmola's pit
    if desert in locs:
        lanmola_pit = Location().add(LogicHint('LanmolaPit'))
        locs[desert].connect(lanmola_pit, None, one_way=True)
    
    # Alternative flame skip methods
    if log.name not in ('casual', 'normal') and fire_cave_north in locs and fire_cave_south in locs:
        locs[fire_cave_north].connect(locs[fire_cave_south], 'MEDICINE2')
        locs[fire_cave_south].connect(locs[fire_cave_north], log.requirements_settings.damage_boost, one_way=True) # flame skip without boots
    
    # D4 tektite crystal chest with a jesus jump superjump
    if log.name in ('glitched', 'hell') and d4_tektite_crystal in locs and d4_right_of_entrance in locs:
        locs[d4_tektite_crystal].connect(locs[d4_right_of_entrance], AND(log.requirements_settings.super_jump_feather, NOT(FLIPPERS), SHIELD, log.requirements_settings.attack_hookshot_powder))

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

    if requirements == None:
        requirements = RequirementsSettings(args)
    
    requirements.names = {}

    if args.ap_logic:
        # AP doesn't require the magnifier for anything
        requirements.shuffled_magnifier = None

    for name, req in requirements.__dict__.items():
        if type(req) not in (type(True), type(''), AND, OR):
            continue

        if type(req) == type(True):
            if req:
                requirements.__dict__[name] = AND(req, 'TRUE')
            else:
                requirements.__dict__[name] = OR(req, 'FALSE')
        if type(req) == type(''):
            requirements.__dict__[name] = AND(req)
        
        req = requirements.__dict__[name]

        requirements.names[req] = name

    log = logic.main.Logic(args, world_setup=worldSetup, requirements_settings=requirements)

    for loc in log.location_list:
        for ii in [x for x in loc.items if len(x.OPTIONS) == 1]:
            ii.item = ii.OPTIONS[0]
        # for ii in [x for x in loc.items if x.nameId in vanillaIds and x.nameId in vanillaContents]:
        #     ii.item = vanillaContents[ii.nameId]

    if args.ap_logic:
        locs = {}

        for loc in log.location_list:
            locs[loc.friendlyName()] = loc

        # Always allow bow for killing wizrobes
        log.requirements_settings.attack_wizrobe._OR__items.append(BOW)

        # Elephant statue is always there
        if bird_cave in locs and bird_key in locs:
            locs[bird_cave].connect(locs[bird_key], AND(FEATHER, COUNT(POWER_BRACELET, 2)))
        
        # Put bomb three of a kinds back into all logic
        if d1_three_of_a_kind in locs and d1_right_side in locs:
            locs[d1_three_of_a_kind].connect(locs[d1_right_side], OR(log.requirements_settings.attack_hookshot, SHIELD))
        
        if d7_three_of_a_kind in locs and d7_topright_pillar_area in locs:
            locs[d7_three_of_a_kind].connect(locs[d7_topright_pillar_area], OR(log.requirements_settings.attack_hookshot, AND(OR(BOMB, FEATHER), SHIELD)))

        # Put killing gibdos on the cracked floors with hookshot without magic rod back into all logics
        if d8_cracked_floor in locs and d8_upper_center in locs:
            locs[d8_cracked_floor].connect(locs[d8_upper_center], log.requirements_settings.attack_skeleton)
        
        # Put a dicey bomb route back in normal logic
        if args.logic not in ['casual', ''] and d8_vire_drop_key in locs and d8_entrance_left in locs:
            locs[d8_vire_drop_key].connect(locs[d8_entrance_left], BOMB)
        
        # Put itemless armos maze back into all logics
        if armos_maze in locs and outside_armos_cave in locs and outside_armos_temple in locs:
            locs[armos_maze].connect(locs[outside_armos_cave], None)
            locs[armos_maze].connect(locs[outside_armos_temple], None)
        
        # Left of the castle, 5 holes turned into 3
        if 'castle_jump_cave' in log.world.entrances:
            log.world._addEntranceRequirement("castle_jump_cave", AND(FEATHER, PEGASUS_BOOTS))

            # ER has already been applied at this point, we have to track down where it got connected and add a new connection
            entrance = log.world.entrances['castle_jump_cave']
            roosterLocs = [x[0] for x in entrance.location.simple_connections if x[1] == 'ROOSTER']
            if roosterLocs:
                roosterLocs[0].connect(entrance.location, AND(FEATHER, PEGASUS_BOOTS))
    
    return log