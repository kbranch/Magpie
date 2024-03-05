from ladxrInterface import *
from trackerLogic import applyTrackerLogic

class FakeLogic:
    pass

class Accessibility:
    def __init__(self, checks, entrances):
        self.checks = checks
        self.entrances = entrances

def getAccessibility(allChecks, allEntrances, logics, inventory):
    checkAccessibility = getCheckAccessibility(allChecks, logics, inventory)
    entranceAccessibility = getEntranceAccessibility(allEntrances, logics, inventory)

    for log in logics:
        applyTrackerLogic(log)

    getCheckTrackerAccessibility(logics, inventory, checkAccessibility)
    getEntranceTrackerAccessibility(logics, inventory, entranceAccessibility)

    return Accessibility(checkAccessibility, entranceAccessibility)

def getCheckTrackerAccessibility(logics, inventory, accessibility):
    keyInventory = inventory.copy()
    keyInventory['KEY0'] = 9
    keyInventory['KEY1'] = 9
    keyInventory['KEY2'] = 9
    keyInventory['KEY3'] = 9
    keyInventory['KEY4'] = 9
    keyInventory['KEY5'] = 9
    keyInventory['KEY6'] = 9
    keyInventory['KEY7'] = 9
    keyInventory['KEY8'] = 9

    alreadyFound = set()
    behindKeys = set()
    for i in range(len(logics)):
        level = accessibility[logics[i]]
        behindKeys = behindKeys.union({x.id for x in level if x.behindKeys})

        checksBehindTrackerLogic = set(loadChecks(logics[i], inventory)).difference(level)
        checksBehindBoth = set(loadChecks(logics[i], keyInventory)).difference(level, checksBehindTrackerLogic)

        checksBehindTrackerLogic = checksBehindTrackerLogic.difference({x for x in checksBehindTrackerLogic if x.id in behindKeys})
        checksBehindBoth = checksBehindBoth.difference({x for x in checksBehindBoth if x.id in behindKeys})

        for j in range(i):
            checksBehindTrackerLogic = checksBehindTrackerLogic.difference(accessibility[logics[j]])
            checksBehindBoth = checksBehindBoth.difference(accessibility[logics[j]])

        for check in checksBehindTrackerLogic:
            if check in alreadyFound:
                continue

            alreadyFound.add(check)
            level.add(check.cloneBehindTrackerLogic())
        
        for check in checksBehindBoth:
            if check in alreadyFound:
                continue

            alreadyFound.add(check)
            level.add(check.cloneBehindBoth())

        for check in level:
            check.difficulty = i
        
    for log in accessibility:
        if log.difficulty == 9:
            accessibility[log] = accessibility[log].difference(alreadyFound)

def getEntranceTrackerAccessibility(logics, inventory, accessibility):
    found = {x for x in accessibility if accessibility[x].difficulty != 9}

    # Initialize each logic level with their full list of accessible entrance IDs
    for i in range(len(logics)):
        logic = logics[i]
        
        behindTrackerLogic = set(loadEntrances(logic, inventory)).difference(found)
        found = behindTrackerLogic.union(found)

        for entrance in behindTrackerLogic:
            if entrance not in accessibility:
                accessibility[entrance] = Entrance(entrance, i, behindTrackerLogic=True)
                continue

            accessibility[entrance].difficulty = i
            accessibility[entrance].behindTrackerLogic = True

def getCheckAccessibility(allChecks, logics, inventory):
    accessibility = {}

    outOfLogic = set(allChecks)

    # Initialize each logic level with their full list of accessible Check objects
    for i in range(len(logics)):
        logic = logics[i]
        
        accessibility[logic] = set(loadChecks(logic, inventory))
        outOfLogic = outOfLogic.difference(accessibility[logic])
    
    # Remove duplicate checks from higher logic levels
    for i in range(1, len(logics)):
        for j in range(i):
            accessibility[logics[i]] = accessibility[logics[i]].difference(accessibility[logics[j]])

    keyInventory = inventory.copy()
    keyInventory['KEY0'] = 9
    keyInventory['KEY1'] = 9
    keyInventory['KEY2'] = 9
    keyInventory['KEY3'] = 9
    keyInventory['KEY4'] = 9
    keyInventory['KEY5'] = 9
    keyInventory['KEY6'] = 9
    keyInventory['KEY7'] = 9
    keyInventory['KEY8'] = 9

    # Find more checks that are behind small keys
    alreadyInKeyLogic = set()
    for i in range(len(logics)):
        level = accessibility[logics[i]]
        checksBehindKeys = set(loadChecks(logics[i], keyInventory)).difference(level)

        for j in range(i):
            checksBehindKeys = checksBehindKeys.difference(accessibility[logics[j]])
        
        for check in checksBehindKeys:
            if check in alreadyInKeyLogic:
                continue

            alreadyInKeyLogic.add(check)
            level.add(check.cloneBehindKeys())

        # Assign difficulties to each logic level (not just key locked)
        logics[i].difficulty = i

    outOfLogic = outOfLogic.difference(alreadyInKeyLogic)

    logics[0].friendlyName = 'In logic'

    for check in outOfLogic:
        check.difficulty = 9 

    for i in range(1, len(logics)):
        logics[i].friendlyName = f'In {logics[i].name} logic'

    oolLogic = FakeLogic()
    oolLogic.friendlyName = 'Out of logic'
    oolLogic.difficulty = 9
    accessibility[oolLogic] = outOfLogic

    return accessibility

def getEntranceAccessibility(allEntrances, logics, inventory):
    accessibility = {}
    entrances = {}

    outOfLogic = set(allEntrances)

    # Initialize each logic level with their full list of accessible entrance IDs
    for i in range(len(logics)):
        logic = logics[i]
        
        accessibility[logic] = set(loadEntrances(logic, inventory))
        outOfLogic = outOfLogic.difference(accessibility[logics[i]])
    
    # Remove duplicate entrances from higher logic levels
    for i in range(1, len(logics)):
        for j in range(i):
            accessibility[logics[i]] = accessibility[logics[i]].difference(accessibility[logics[j]])

    # Convert the entrance IDs to Entrance objects
    for i in range(len(logics)):
        for name in accessibility[logics[i]]:
            entrance = Entrance(name, i)
            entrances[name] = entrance

    for name in outOfLogic:
        entrances[name] = Entrance(name, 9)

    return entrances

def addStartingItems(inventory, args):
    inventory['RUPEES_500'] = 10

    if args.bowwow != 'normal':
        inventory['SWORD'] = inventory['SWORD'] + 1

    if args.dungeon_items == 'keysy':
        for i in range(9):
            for amount, item_name in ((9, "KEY"), (1, "NIGHTMARE_KEY")):
                item_name = f"{item_name}{i + 1}"
                inventory[item_name] = amount
    
    if args.owlstatues not in ['both', 'dungeon'] and args.goal not in ['bingo', 'bingo-full']:
        for i in range(9):
            inventory[f"STONE_BEAK{i + 1}"] = 1

def cleanUpEntranceMap(entranceMap, entrances, args):
    for source, dest in [x for x in entranceMap.items()]:
        if dest in {'landfill', 'bk_shop'}:
            entranceMap[source] = 'start_house:inside'
        if source in {"null", None} or dest in {"null", None}:
            del entranceMap[source]

    for entrance in list(entranceMap.keys()):
        if entrance not in entrances:
            del entranceMap[entrance]

    if entranceMap == {} and args.randomstartlocation:
        entranceMap['start_house'] = 'rooster_house'

    if not args.randomstartlocation: 
        reverseMap = {value: key for (key, value) in entranceMap.items()}
        if 'start_house' in entranceMap:
            del entranceMap['start_house']
        if 'start_house' in reverseMap:
            del entranceMap[reverseMap['start_house']]