import os
import sys
import copy
import random
import argparse
from xmlrpc.client import boolean
import jsonpickle

sys.path.append(os.path.abspath('LADXR/'))

import explorer
import itempool
import logic
from worldSetup import WorldSetup, start_locations
from LADXR.settings import *
from checkMetadata import checkMetadataTable

allChecks = {}

vanillaBySetting = {
    'heartpiece': {'0x000', '0x2A4', '0x044', '0x2AB', '0x2DF', '0x2E5', '0x078', '0x2E6', '0x1E8', '0x1F2', '0x2BA', '0x2B1'},
    'seashells': {'0x0A3', '0x0D2', '0x2B2', '0x1E3', '0x074', '0x0A5', '0x0A6', '0x08B', '0x0A4', '0x0B9', '0x0E9', '0x0F8', '0x0A8', '0x0DA', '0x0FF', '0x00C'},
    'heartcontainers': {'0x106', '0x12B', '0x15A', '0x166', '0x185', '0x1BC', '0x223', '0x234'},
    'instruments': {'0x102', '0x12A', '0x159', '0x162', '0x182', '0x1B5', '0x22C', '0x230'},
    'tradequest': {'0x2A0-Trade', '0x2A6-Trade', '0x2B2-Trade', '0x2FE-Trade', '0x07B-Trade', '0x087-Trade', '0x2D7-Trade', '0x019-Trade', '0x2D9-Trade', '0x2A8-Trade', '0x0CD-Trade', '0x2F5-Trade', '0x0C9-Trade', '0x297-Trade'},
    'witch': {'0x2A2', '0x050'},
    # 'rooster': {'0x1E4'},
}

class Flag():
    def __init__(self, ladxrArg, value):
        if isinstance(ladxrArg.default, boolean):
            self.type = 'bool'
        else:
            self.type = 'string'
        
        self.default = ladxrArg.default
        self.value = value
        self.name = ladxrArg.key
        self.choices = [x[0] for x in ladxrArg.options] if ladxrArg.options != None else None
    
    def __repr__(self) -> str:
        return f'{self.group} {self.name}={self.value}, {self.type}, {self.default}, {self.choices}'

class Check:
    def __init__(self, id, metadata, behindKeys=False, vanilla=False):
        self.id = id
        self.name = metadata.name
        self.area = metadata.area
        self.metadata = metadata
        self.behindKeys = behindKeys
        self.vanilla = vanilla
    
    def cloneBehindKeys(self):
        return Check(self.id, self.metadata, behindKeys=True)
    
    def __repr__(self) -> str:
        return f'{self.id}: {self.area} - {self.name}'

class Entrance:
    def __init__(self, id, difficulty=0):
        self.id = id
        self.difficulty = difficulty

def getArgsFromShortString(shortString):
    settings = Settings()
    settings.loadShortString(shortString)
    return getArgs(ladxrFlags=settings, useCurrentValue=True)

def getArgs(values=None, ladxrFlags=None, useCurrentValue=False):
    class Args():
        def __init__(self):
            self.flags = []

        def add(self, flag, value):
            self.flags.append(Flag(flag, value))
            setattr(self, flag.key, value)

    if ladxrFlags == None:
        ladxrFlags = [x for x in Settings()._Settings__all if not x.aesthetic and (x.options != None or isinstance(x.default, boolean))]

    args = Args()

    for flag in ladxrFlags:
        value = flag.value if useCurrentValue else flag.default
        if values and flag.key in values.__dict__:
            value = values.__dict__[flag.key]

        args.add(flag, value)

    args.nagmessages = True
    args.multiworld = None
    args.boomerang = 'gift'

    return args

def getAllItems(args):
    logic = getLogicWithoutER(args)
    pool = itempool.ItemPool(logic, args, random.Random()).toDict()

    # No dungeons mode seems to not have bombs sometimes due to the rupee randomization
    # Force a bomb into the pool to fix it
    if 'BOMB' not in pool:
        pool['BOMB'] = 1

    return pool

def getItems(args, trimDungeonItems=True):
    pool = getAllItems(args)

    defaultItemPool = itempool.DEFAULT_ITEM_POOL
    for item in defaultItemPool:
        if item not in pool:
            pool[item] = 0
    
    for n in range(9):
        if trimDungeonItems:
            if args.dungeon_items == 'keysy':
                for item_name in ("KEY", "NIGHTMARE_KEY"):
                    item_name = f"{item_name}{n + 1}"
                    pool[item_name] = 0
            if args.goal not in ('bingo', 'bingo-full'):
                for item_name in ("MAP", "COMPASS"):
                    item_name = f"{item_name}{n + 1}"
                    pool[item_name] = 0
            if args.owlstatues not in ('both', 'dungeon') and args.goal not in ('bingo', 'bingo-full'):
                pool[f'STONE_BEAK{n + 1}'] = 0

        pool[f'ITEM{n + 1}'] = 0

    return pool

def getLogicWithoutER(realArgs):
    args = copy.copy(realArgs)
    args.dungeonshuffle = False
    args.randomstartlocation = False
    args.entranceshuffle = 'none'
    args.boss = 'default'
    args.miniboss = 'default'
    
    worldSetup = WorldSetup()
    worldSetup.randomize(args, random.Random())

    log = logic.Logic(args, world_setup=worldSetup)
    log.name = 'noER'
    
    return log

def getLogics(args, entranceMap):
    worldSetup = WorldSetup()
    worldSetup.goal = args.goal
    # worldSetup.randomize(args, random.Random())

    entrancePool = getEntrancePool(args)

    for entrance in worldSetup.entrance_mapping:
        if entrance in entranceMap:
            worldSetup.entrance_mapping[entrance] = entranceMap[entrance]
        elif entrance in entrancePool:
            worldSetup.entrance_mapping[entrance] = 'rooster_house'

    if args.overworld == "dungeondive":
        worldSetup.entrance_mapping = {"d%d" % (n): "d%d" % (n) for n in range(9)}

    logicFlag = [x for x in args.flags if x.name == 'logic'][0]
    originalLogic = args.logic
    originalOwls = args.owlstatues
    args.owlstatues = 'both'
    foundTarget = False
    logics = []

    for choice in logicFlag.choices:
        if choice == args.logic:
            foundTarget = True

        if foundTarget:
            args.logic = choice
            log = logic.Logic(args, world_setup=worldSetup)
            log.name = 'normal' if choice == '' else choice
            logics.append(log)

    args.logic = originalLogic
    args.owlstatues = originalOwls
    
    return logics

def _locationIsCheck(location):
    return len(location.items) > 0 and location.items[0].nameId != 'None'

def testRequirement(requirement, inventory):
    if requirement == None:
        return True
    
    if type(requirement) == str:
        return requirement != 'UNSET' and requirement in inventory
    
    return requirement.test(inventory)

def testEntrance(entrance, inventory):
    smallInventory = {key: value for (key, value) in inventory.items() if value > 0}

    return testRequirement(entrance.requirement, smallInventory) or testRequirement(entrance.one_way_enter_requirement, smallInventory)

def loadEntrances(logic, inventory):
    inLogicEntrances = []

    e = explorer.Explorer()

    for item in inventory:
        count = inventory[item]

        for _ in range(count):
            e.addItem(item)
    
    e.visit(logic.start)

    entrances = {}
    for name,exterior in logic.world.overworld_entrance.items():
        if not testEntrance(exterior, inventory):
            continue

        if exterior.location not in entrances:
            entrances[exterior.location] = []
        
        entrances[exterior.location].append(name)
             
    locations = e.getAccessableLocations()

    for location,names in entrances.items():
        if location in locations:
            for name in names:
                inLogicEntrances.append(name)

    return inLogicEntrances

def loadChecks(logic, inventory):
    nameOverrides = {
        '0x0B1': '0x092',
        '0x0B2': '0x0F2'
    }

    checks = []

    e = explorer.Explorer()

    for item in inventory:
        count = inventory[item]

        for _ in range(count):
            e.addItem(item)
    
    e.visit(logic.start)

    locations = e.getAccessableLocations()

    for location in [x for x in locations if _locationIsCheck(x)]:
        for item in location.items:
            name = item.nameId

            if name in allChecks:
                checks.append(allChecks[name])
            else:
                if name in nameOverrides:
                    checks.append(allChecks[nameOverrides[name]])
    
    checks.sort(key=lambda x: (x.area, x.name))

    return checks

def initChecks(args):
    vanillaIds = set()

    for flag in args.flags:
        if flag.name in vanillaBySetting and not flag.value:
            vanillaIds = vanillaIds.union(vanillaBySetting[flag.name])

    if not args.instruments and args.goal == 'seashells':
        vanillaIds -= vanillaBySetting['instruments']

    for id in checkMetadataTable:
        isOverworld = '0x0' in id
        isOwl = 'Owl' in id
        isVanillaOwl = isOwl and (args.owlstatues == '' or (args.owlstatues == 'dungeon' and isOverworld) or (args.owlstatues == 'overworld' and not isOverworld))

        if id != 'None':
            allChecks[id] = Check(id, checkMetadataTable[id], vanilla=id in vanillaIds or isVanillaOwl)

def getEntrancePool(args):
    entrances = set(WorldSetup.getEntrancePool(None, args))
    entrances = entrances.union(set(WorldSetup.getEntrancePool(None, args, connectorsOnly=True)))

    return entrances

def getStartLocations(args):
    if not args.randomstartlocation:
        return []

    if args.entranceshuffle == 'none':
        return start_locations
    else:
        return WorldSetup.getEntrancePool(None, args)

def getDungeonItemCount(args):
    dungeonList = ["Tail Cave",
                   "Bottle Grotto",
                   "Key Cavern",
                   "Angler's Tunnel",
                   "Catfish's Maw",
                   "Face Shrine",
                   "Eagle's Tower",
                   "Turtle Rock",
                   "Color Dungeon"]
    itemCount = {}

    allItems = getItems(args, trimDungeonItems=False)

    checks = loadChecks(getLogicWithoutER(args), allItems)
    checks = [x for x in checks if not x.vanilla and x.area in dungeonList]

    for check in checks:
        index = dungeonList.index(check.area)
        if index not in itemCount:
            itemCount[index] = 0
        
        itemCount[index] += 1
    
    for i in range(len(dungeonList)):
        if args.dungeon_items in ('', 'localkeys'):
            itemCount[i] -= allItems[f'KEY{i + 1}']
        if args.dungeon_items in ('', 'smallkeys', 'keysy'):
            itemCount[i] -= allItems[f'MAP{i + 1}']
            itemCount[i] -= allItems[f'COMPASS{i + 1}']
            itemCount[i] -= allItems[f'STONE_BEAK{i + 1}']
        if args.dungeon_items in ('', 'smallkeys', 'localkeys', 'nightmarekey'):
            itemCount[i] -= allItems[f'NIGHTMARE_KEY{i + 1}']
        if not args.instruments and f'INSTRUMENT{i + 1}' in allItems:
            itemCount[i] -= allItems[f'INSTRUMENT{i + 1}']
    
    for i in range(len(dungeonList)):
        itemCount[f'ITEM{i + 1}'] = itemCount[i]
        del itemCount[i]
    
    return itemCount
