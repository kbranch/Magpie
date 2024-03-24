import os
import sys
import copy
import random
from xmlrpc.client import boolean
from trackerLogic import buildLogic
import trackerLogic
import trackables
from datetime import datetime
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
explorerCache = {}

class Check:
    def __init__(self, id, behindKeys=False, behindTrackerLogic=False, vanilla=False, logicHint=False):
        self.id = id
        self.behindKeys = behindKeys
        self.behindTrackerLogic = behindTrackerLogic
        self.vanilla = vanilla
        self.logicHint = logicHint
    
    def cloneBehindKeys(self):
        return Check(self.id, behindKeys=True, behindTrackerLogic=self.behindTrackerLogic, vanilla=self.vanilla, logicHint=self.logicHint)
    
    def cloneBehindTrackerLogic(self):
        return Check(self.id, behindKeys=self.behindKeys, behindTrackerLogic=True, vanilla=self.vanilla, logicHint=self.logicHint)
    
    def cloneBehindBoth(self):
        return Check(self.id, behindKeys=True, behindTrackerLogic=True, vanilla=self.vanilla, logicHint=self.logicHint)
    
    def __repr__(self) -> str:
        return f'{self.id}: {self.difficulty}'

class Entrance:
    def __init__(self, id, difficulty=0, behindTrackerLogic=False):
        self.id = id
        self.difficulty = difficulty
        self.behindTrackerLogic = behindTrackerLogic

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
    
    tryCopyValue(values, args, 'ap_logic')
    tryCopyValue(values, args, 'shuffle_small')
    tryCopyValue(values, args, 'shuffle_nightmare')
    tryCopyValue(values, args, 'shuffle_maps')
    tryCopyValue(values, args, 'shuffle_beaks')
    tryCopyValue(values, args, 'shuffle_compasses')

    if args.dungeon_items == 'custom':
        args.dungeon_items = 'keysanity'

    args.nagmessages = True
    args.multiworld = None
    args.boomerang = 'gift'

    return args

def tryCopyValue(source, target, name, default=False):
    if hasattr(source, name):
        setattr(target, name, getattr(source, name))
    else:
        setattr(target, name, default)

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
    pool['id'] = 0

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

    argHash = hash(str({k:v for k,v in args.__dict__.items() if k != 'flags'}))
    if argHash in trackables.logicCache:
        logic = trackables.logicCache[argHash]
        logic['age'] = datetime.now()
        return logic['noER']
    
    worldSetup = WorldSetup()
    worldSetup.randomize(args, random.Random())

    log = buildLogic(args, worldSetup)
    log.name = 'noER'

    trackables.logicCache[argHash] = {'noER':log, 'age':datetime.now()}

    if len(trackables.logicCache) > trackables.maxLogicCache:
        sortedCache = sorted(trackables.logicCache.keys(), key=lambda x: trackables.logicCache[x]['age'])
        i = 0
        while len(trackables.logicCache) > trackables.maxLogicCache:
            del trackables.logicCache[sortedCache[i]]
            i += 1
    
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

def testEntrance(entrance, smallInventory):
    return testRequirement(entrance.requirement, smallInventory) or testRequirement(entrance.one_way_enter_requirement, smallInventory)

def loadEntrances(logic, inventory):
    smallInventory = {key: value for (key, value) in inventory.items() if value > 0}
    inLogicEntrances = []

    e = visitLogic(logic, inventory)

    entrances = {}
    for name,exterior in logic.world.entrances.items():
        if not testEntrance(exterior, smallInventory):
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

def visitLogic(logic, inventory):
    if logic in explorerCache and inventory['id'] in explorerCache[logic]:
        return explorerCache[logic][inventory['id']]

    e = explorer.Explorer()

    for item in inventory:
        if item == 'id':
            continue

        count = inventory[item]

        for _ in range(count):
            e.addItem(item)
    
    e.visit(logic.start)

    if logic not in explorerCache:
        explorerCache[logic] = {}

    explorerCache[logic][inventory['id']] = e

    return e

def loadChecks(logic, inventory, leaveInstruments=False):
    nameOverrides = {
        '0x0B1': '0x092',
        '0x0B2': '0x0F2'
    }

    checks = []

    if not leaveInstruments:
        instruments = {key for key, value in inventory.items() if 'INSTRUMENT' in key and value > 0}
        for instrument in instruments:
            del inventory[instrument]

    e = visitLogic(logic, inventory)

    if not leaveInstruments:
        # Do some gymnastics to avoid vanilla instruments getting double counted
        foundInstruments = {key for key, value in e._Explorer__inventory.items() if 'INSTRUMENT' in key and value > 0}
        unfoundInstruments = instruments.difference(foundInstruments)

        if unfoundInstruments:
            for instrument in unfoundInstruments:
                inventory[instrument] = 1
            
            e = visitLogic(logic, inventory)

    locations = e.getAccessableLocations()

    for location in [x for x in locations if _locationIsCheck(x)]:
        for item in location.items:
            name = item.nameId

            if name in allChecks:
                checks.append(allChecks[name])
            else:
                if name in nameOverrides:
                    checks.append(allChecks[nameOverrides[name]])
                elif type(item) is trackerLogic.LogicHint:
                    if name not in allChecks:
                        allChecks[name] = Check(name, logicHint=True)

                    checks.append(allChecks[name])

    if logic.windfish in locations:
        checks.append(allChecks['egg'])

    return checks

def initChecks(args):
    trackerLogic.updateVanilla(args)
    trackerLogic.updateMetadata(checkMetadataTable)

    for id in checkMetadataTable:
        isOverworld = '0x0' in id
        isOwl = 'Owl' in id
        isVanillaOwl = isOwl and (args.owlstatues == '' or (args.owlstatues == 'dungeon' and isOverworld) or (args.owlstatues == 'overworld' and not isOverworld))

        if id != 'None':
            allChecks[id] = Check(id, vanilla=id in trackerLogic.vanillaIds or isVanillaOwl)

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

    checks = loadChecks(getLogicWithoutER(args), allItems, leaveInstruments=True)
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

        if not args.shuffle_small:
            itemCount[i] -= allItems[f'KEY{i}']
        if not args.shuffle_maps:
            itemCount[i] -= allItems[f'MAP{i}']
        if not args.shuffle_compasses:
            itemCount[i] -= allItems[f'COMPASS{i}']
        if not args.shuffle_beaks:
            itemCount[i] -= allItems[f'STONE_BEAK{i}']
        if not args.shuffle_nightmare:
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