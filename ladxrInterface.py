import os
import sys
import random
import argparse
import jsonpickle

sys.path.append(os.path.abspath('LADXR/'))

import explorer
import itempool
import logic
from worldSetup import WorldSetup
from LADXR.main import buildArgParser
from checkMetadata import checkMetadataTable

allChecks = {}

class Flag():
    def __init__(self, ladxrArg, value):
        if isinstance(ladxrArg, (argparse._StoreTrueAction, argparse._StoreFalseAction)):
            self.type = 'bool'
        else:
            self.type = 'string'
        
        self.default = ladxrArg.default
        self.value = value
        self.name = ladxrArg.dest
        self.choices = ladxrArg.choices
        self.group = ladxrArg.container.title
    
    def __repr__(self) -> str:
        return f'{self.group} {self.name}={self.value}, {self.type}, {self.default}, {self.choices}'
class Check:
    def __init__(self, id, metadata, behindKeys=False):
        self.id = id
        self.name = metadata.name
        self.area = metadata.area
        self.metadata = metadata
        self.behindKeys = behindKeys
    
    def cloneBehindKeys(self):
        return Check(self.id, self.metadata, behindKeys=True)

def getArgs(values=None):
    class Args():
        def __init__(self):
            self.flags = []

        def add(self, flag, value):
            self.flags.append(Flag(flag, value))
            setattr(self, flag.dest, value)

    parser = buildArgParser()
    ladxrFlags = [x for x in parser._actions if isinstance(x, (argparse._StoreAction, argparse._StoreTrueAction, argparse._StoreFalseAction))]

    args = Args()

    for flag in ladxrFlags:
        if flag.default != None:
            if flag.dest == 'goal':
                flag.choices = ('egg', 'bingo', 'bingo-full', 'seashells', 'raft')

            value = flag.default
            if values and flag.dest in values.__dict__:
                value = values.__dict__[flag.dest]

            args.add(flag, value)


    args.multiworld = None
    args.boomerang = 'gift'

    return args

def getItems(args):
    pool = itempool.ItemPool(args, random.Random()).toDict()

    # No dungeons mode seems to not have bombs sometimes due to the rupee randomization
    # 
    if 'BOMB' not in pool:
        pool['BOMB'] = 1

    defaultItemPool = itempool.DEFAULT_ITEM_POOL
    for item in defaultItemPool:
        if item not in pool:
            pool[item] = 0
    
    for n in range(9):
        if args.dungeon_items == 'keysy':
            for item_name in ("KEY", "NIGHTMARE_KEY"):
                item_name = "%s%d" % (item_name, n + 1)
                pool[item_name] = 0
        if args.goal not in ('bingo', 'bingo-full'):
            for item_name in ("MAP", "COMPASS"):
                item_name = "%s%d" % (item_name, n + 1)
                pool[item_name] = 0
        if args.owlstatues not in ('both', 'dungeon') and args.goal not in ('bingo', 'bingo-full'):
            pool[f'STONE_BEAK{n + 1}'] = 0

    return pool

def getLogics(args):
    worldSetup = WorldSetup()
    worldSetup.randomize(args, random.Random())

    logicFlag = [x for x in args.flags if x.name == 'logic'][0]
    originalLogic = args.logic
    foundTarget = False
    logics = []

    for choice in logicFlag.choices:
        if choice == args.logic:
            foundTarget = True

        if foundTarget:
            args.logic = choice
            log = logic.Logic(args, world_setup=worldSetup)
            log.name = choice
            logics.append(log)

    args.logic = originalLogic
    
    return logics

def _locationIsCheck(location):
    return len(location.items) > 0 and location.items[0].nameId != 'None'

def loadChecks(logic, inventory):
    checks = []

    e = explorer.Explorer()

    for item in inventory:
        count = inventory[item]

        for _ in range(count):
            e.addItem(item)
    
    e.visit(logic.start)

    for location in [x for x in e.getAccessableLocations() if _locationIsCheck(x)]:
        for item in location.items:
            name = item.nameId

            if name in allChecks:
                checks.append(allChecks[name])
    
    checks.sort(key=lambda x: (x.area, x.name))

    return checks

def initChecks():
    for id in checkMetadataTable:
        if id != 'None':
            allChecks[id] = Check(id, checkMetadataTable[id])