import os
import sys
import copy
import random
from xmlrpc.client import boolean
from trackerLogic import buildLogic
import trackerLogic
from autotracking.romContents import *

sys.path.append(os.path.abspath('LADXR/'))

import explorer
import itempool
import logic
import locations
from args import Args
from worldSetup import WorldSetup, start_locations
from LADXR.settings import *
from checkMetadata import checkMetadataTable
from romTables import ROMWithTables

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

class Check:
    def __init__(self, id, behindKeys=False, vanilla=False):
        self.id = id
        self.behindKeys = behindKeys
        self.vanilla = vanilla
    
    def cloneBehindKeys(self):
        return Check(self.id, behindKeys=True, vanilla=self.vanilla)
    
    def __repr__(self) -> str:
        return f'{self.id}: {self.difficulty}'

class Entrance:
    def __init__(self, id, difficulty=0):
        self.id = id
        self.difficulty = difficulty

def getArgsFromShortString(shortString):
    settings = Settings()
    settings.loadShortString(shortString)
    settings = getArgs(ladxrFlags=settings, useCurrentValue=True).__dict__
    del settings['flags']
    return settings

def getArgs(values=None, ladxrFlags=None, useCurrentValue=False):
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
    pool = itempool.ItemPool(logic, args, random.Random(), False).toDict()

    # No dungeons mode seems to not have bombs sometimes due to the rupee randomization
    # Force a bomb into the pool to fix it
    if 'BOMB' not in pool:
        pool['BOMB'] = 1

    for item in [x for x in pool if x.startswith('TRADING_ITEM')]:
        pool[item + '_CHECKED'] = 1

    pool['TOADSTOOL_CHECKED'] = 1

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
                    item_name = f"{item_name}{n}"
                    pool[item_name] = 0
            if args.goal not in ('bingo', 'bingo-full'):
                for item_name in ("MAP", "COMPASS"):
                    item_name = f"{item_name}{n}"
                    pool[item_name] = 0
            if args.owlstatues not in ('both', 'dungeon') and args.goal not in ('bingo', 'bingo-full'):
                pool[f'STONE_BEAK{n}'] = 0

        pool[f'ITEM{n}'] = 0
        pool[f'REQ{n}'] = 1

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

    log = buildLogic(args, worldSetup)
    log.name = 'noER'
    
    return log

def getLogics(args, entranceMap, bossList, minibossMap):
    worldSetup = WorldSetup()
    worldSetup.goal = args.goal

    if bossList and len(bossList) == len(worldSetup.boss_mapping):
        worldSetup.boss_mapping = bossList
    
    if minibossMap and len(minibossMap) == len(worldSetup.miniboss_mapping):
        worldSetup.miniboss_mapping = minibossMap

    entrancePool = getEntrancePool(args)

    for entrance in worldSetup.entrance_mapping:
        if entrance in entranceMap:
            worldSetup.entrance_mapping[entrance] = entranceMap[entrance]
        elif entrance in entrancePool:
            worldSetup.entrance_mapping[entrance] = 'start_house:inside'

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
            log = buildLogic(args, worldSetup)

            log.name = 'normal' if choice == '' else choice
            logics.append(log)

    args.logic = originalLogic
    
    logics.append(trackerLogic.build(args, worldSetup))

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
    for name,exterior in logic.world.entrances.items():
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

    if logic.windfish in locations:
        checks.append(allChecks['egg'])
    
    # checks.sort(key=lambda x: (x.area, x.name))

    return checks

def initChecks(args):
    vanillaIds = set()

    for flag in args.flags:
        if flag.name in vanillaBySetting and not flag.value:
            vanillaIds = vanillaIds.union(vanillaBySetting[flag.name])

    if not args.instruments and args.goal == 'seashells':
        vanillaIds -= vanillaBySetting['instruments']

    trackerLogic.updateMetadata(checkMetadataTable)

    for id in checkMetadataTable:
        isOverworld = '0x0' in id
        isOwl = 'Owl' in id
        isVanillaOwl = isOwl and (args.owlstatues == '' or (args.owlstatues == 'dungeon' and isOverworld) or (args.owlstatues == 'overworld' and not isOverworld))

        if id != 'None':
            allChecks[id] = Check(id, vanilla=id in vanillaIds or isVanillaOwl)

def getEntrancePool(args):
    entrances = set(WorldSetup.getEntrancePool(None, args))
    entrances = entrances.union(set(WorldSetup.getEntrancePool(None, args, connectorsOnly=True)))

    return entrances

def getStartLocations(args):
    if not args.randomstartlocation:
        return []

    if args.entranceshuffle == 'none':
        startLocations = []
        for loc in start_locations:
            startLocations.append(loc)
            startLocations.append(loc + ':inside')

        return startLocations
    else:
        return WorldSetup.getEntrancePool(None, args)

def getDungeonItemCount(args):
    dungeonList = [
        "Color Dungeon",
        "Tail Cave",
        "Bottle Grotto",
        "Key Cavern",
        "Angler's Tunnel",
        "Catfish's Maw",
        "Face Shrine",
        "Eagle's Tower",
        "Turtle Rock",
    ]

    itemCount = {}

    allItems = getItems(args, trimDungeonItems=False)

    checks = loadChecks(getLogicWithoutER(args), allItems)
    for check in checks:
        check.area = checkMetadataTable[check.id].area

    checks = [x for x in checks if not x.vanilla and x.area in dungeonList]

    for check in checks:
        index = dungeonList.index(check.area)
        if index not in itemCount:
            itemCount[index] = 0
        
        itemCount[index] += 1
    
    for i in range(len(dungeonList)):
        if i not in itemCount:
            continue

        if args.dungeon_items in ('', 'localkeys'):
            itemCount[i] -= allItems[f'KEY{i}']
        if args.dungeon_items in ('', 'smallkeys', 'keysy'):
            itemCount[i] -= allItems[f'MAP{i}']
            itemCount[i] -= allItems[f'COMPASS{i}']
            itemCount[i] -= allItems[f'STONE_BEAK{i}']
        if args.dungeon_items in ('', 'smallkeys', 'localkeys', 'nightmarekey'):
            itemCount[i] -= allItems[f'NIGHTMARE_KEY{i}']
        if not args.instruments and f'INSTRUMENT{i}' in allItems:
            itemCount[i] -= allItems[f'INSTRUMENT{i}']
    
    for i in range(len(dungeonList)):
        if i not in itemCount:
            continue

        itemCount[f'ITEM{i}'] = itemCount[i]
        del itemCount[i]
    
    return itemCount

def loadSpoilerLog(romData):
    return getSpoilerLog(romData)