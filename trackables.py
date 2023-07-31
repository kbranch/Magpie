from ladxrInterface import *

class FakeLogic:
    pass

class Accessibility:
    def __init__(self, checks, entrances):
        self.checks = checks
        self.entrances = entrances

def getAccessibility(allChecks, allEntrances, logics, inventory):
    normalLogics = []
    trackerLogic = None

    for log in logics:
        if log.name == 'tracker':
            trackerLogic = log
        else:
            normalLogics.append(log)

    checkAccessibility = getCheckAccessibility(allChecks, normalLogics, trackerLogic, inventory)
    entranceAccessibility = getEntranceAccessibility(allEntrances, normalLogics, trackerLogic, inventory)

    return Accessibility(checkAccessibility, entranceAccessibility)

def getCheckAccessibility(allChecks, logics, trackerLogic, inventory):
    accessibility = {}

    outOfLogic = set(allChecks)

    # Initialize each logic level with their full list of accessible Check objects
    for i in range(len(logics)):
        logic = logics[i]
        
        accessibility[logic] = set(loadChecks(logic, inventory))
        outOfLogic = outOfLogic.difference(accessibility[logic])

    accessibility[trackerLogic] = set(loadChecks(trackerLogic, inventory))
    outOfLogic = outOfLogic.difference(accessibility[trackerLogic])
    
    # Remove duplicate checks from higher logic levels
    for i in range(1, len(logics)):
        for j in range(i):
            accessibility[logics[i]] = accessibility[logics[i]].difference(accessibility[logics[j]])

    accessibility[trackerLogic] = accessibility[trackerLogic].difference(accessibility[logics[0]])
        
    inventory['KEY1'] = 9
    inventory['KEY2'] = 9
    inventory['KEY3'] = 9
    inventory['KEY4'] = 9
    inventory['KEY5'] = 9
    inventory['KEY6'] = 9
    inventory['KEY7'] = 9
    inventory['KEY8'] = 9
    inventory['KEY9'] = 9

    # Find more checks that are behind small keys
    alreadyInKeyLogic = set()
    for i in range(len(logics)):
        level = accessibility[logics[i]]
        checksBehindKeys = set(loadChecks(logics[i], inventory)).difference(level)

        for j in range(i):
            checksBehindKeys = checksBehindKeys.difference(accessibility[logics[j]])
        
        for check in checksBehindKeys:
            if check in alreadyInKeyLogic:
                continue

            alreadyInKeyLogic.add(check)
            level.add(check.cloneBehindKeys())

        # Assign difficulties to each logic level (not just key locked)
        logics[i].difficulty = i
        for check in level:
            check.difficulty = i

    for check in accessibility[trackerLogic]:
        check.difficulty = 8

    trackerLogic.difficulty = 8
    trackerLogic.friendlyName = 'In tracker logic'

    outOfLogic = outOfLogic.difference(alreadyInKeyLogic)
    # outOfLogic = sorted(outOfLogic, key=lambda x: (x.area, x.name))

    # accessibility[logics[0]] = sorted(accessibility[logics[0]], key=lambda x: (x.area, x.name))
    logics[0].friendlyName = 'In logic'

    for check in outOfLogic:
        check.difficulty = 9 

    for i in range(1, len(logics)):
        logics[i].friendlyName = f'In {logics[i].name} logic'

        # accessibility[logics[i]] = sorted(accessibility[logics[i]], key=lambda x: (x.area, x.name))
    
    oolLogic = FakeLogic()
    oolLogic.friendlyName = 'Out of logic'
    oolLogic.difficulty = 9
    accessibility[oolLogic] = outOfLogic

    return accessibility

def getEntranceAccessibility(allEntrances, logics, trackerLogic, inventory):
    accessibility = {}
    entrances = {}

    outOfLogic = set(allEntrances)

    # Initialize each logic level with their full list of accessible entrance IDs
    for i in range(len(logics)):
        logic = logics[i]
        
        accessibility[logic] = set(loadEntrances(logic, inventory))
        outOfLogic = outOfLogic.difference(accessibility[logics[i]])

    accessibility[trackerLogic] = set(loadEntrances(trackerLogic, inventory))
    outOfLogic = outOfLogic.difference(accessibility[trackerLogic])
    
    # Remove duplicate entrances from higher logic levels
    for i in range(1, len(logics)):
        for j in range(i):
            accessibility[logics[i]] = accessibility[logics[i]].difference(accessibility[logics[j]])

    accessibility[trackerLogic] = accessibility[trackerLogic].difference(accessibility[logics[0]])
    
    # Convert the entrance IDs to Entrance objects
    for i in range(len(logics)):
        for name in accessibility[logics[i]]:
            entrance = Entrance(name, i)
            entrances[name] = entrance

    for name in accessibility[trackerLogic]:
        entrances[name] = Entrance(name, 8)

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
    for source, dest in entranceMap.items():
        if dest in {'landfill', 'bk_shop'}:
            entranceMap[source] = 'rooster_house:inside'

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