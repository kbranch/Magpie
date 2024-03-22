from datetime import datetime
from ladxrInterface import *
from trackerLogic import applyTrackerLogic

class FakeLogic:
    pass

class Accessibility:
    def __init__(self, checks, entrances, logicHints, graph):
        self.checks = checks
        self.entrances = entrances
        self.logicHints = logicHints
        self.graph = graph

maxLogicCache = 1000
logicCache = {}

def getCachedLogics(hash, args, entranceMap, bossList, minibossMap):
    if hash in logicCache:
        logics = logicCache[hash]
        logics['age'] = datetime.now()
        return logics

    logics = {}
    logics['stock'] = getLogics(args, entranceMap, bossList, minibossMap)
    logics['tracker'] = getLogics(args, entranceMap, bossList, minibossMap)
    logics['age'] = datetime.now()

    for logic in logics['tracker']:
        applyTrackerLogic(logic)
    
    logicCache[hash] = logics

    if len(logicCache) > maxLogicCache:
        sortedCache = sorted(logicCache.keys(), key=lambda x: logicCache[x]['age'])
        i = 0
        while len(logicCache) > maxLogicCache:
            del logicCache[sortedCache[i]]
            i += 1
    
    return logics

def getAccessibility(allChecks, allEntrances, logics, inventory):
    checkAccessibility = getCheckAccessibility(allChecks, logics['stock'], inventory)

    entranceAccessibility = {}
    
    if allEntrances:
        entranceAccessibility = getEntranceAccessibility(allEntrances, logics['stock'], inventory)

    graphAccessibility = getGraphAccessibility(logics['tracker'])

    getCheckTrackerAccessibility(logics['tracker'], inventory, checkAccessibility)

    if allEntrances:
        getEntranceTrackerAccessibility(logics['tracker'], inventory, entranceAccessibility)

    logicHintAccessibility = {}
    for log in logics['tracker']:
        logicHintAccessibility[log.name] = {x for x in checkAccessibility[log.name] if x.logicHint}
        for check in logicHintAccessibility[log.name]:
            checkAccessibility[log.name].remove(check)

    return Accessibility(checkAccessibility, entranceAccessibility, logicHintAccessibility, graphAccessibility)

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
        logics[i].difficulty = i

        level = accessibility[logics[i].name]
        behindKeys = behindKeys.union({x.id for x in level if x.behindKeys})

        checksBehindTrackerLogic = set(loadChecks(logics[i], inventory)).difference(level)
        checksBehindBoth = set(loadChecks(logics[i], keyInventory)).difference(level, checksBehindTrackerLogic)

        checksBehindTrackerLogic = checksBehindTrackerLogic.difference({x for x in checksBehindTrackerLogic if x.id in behindKeys})
        checksBehindBoth = checksBehindBoth.difference({x for x in checksBehindBoth if x.id in behindKeys})

        for j in range(i):
            checksBehindTrackerLogic = checksBehindTrackerLogic.difference(accessibility[logics[j].name])
            checksBehindBoth = checksBehindBoth.difference(accessibility[logics[j].name])

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
        
    for log in logics:
        if log.difficulty == 9:
            accessibility[log.name] = accessibility[log.name].difference(alreadyFound)

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

def getGraphAccessibility(logics):
    accessibility = {}

    for i in range(len(logics)):
        logic = logics[i]

        for loc in logic.location_list:
            name = loc.friendlyName()

            if name == '':
                continue

            if name not in accessibility:
                accessibility[name] = {}
                accessibility[name]['connections'] = {}
                accessibility[name]['checks'] = [x.nameId for x in loc.items]
                accessibility[name]['id'] = name
            
            accLoc = accessibility[name]

            for connection in loc.simple_connections + loc.gated_connections:
                toName = connection[0].friendlyName()
                fullReqName = str(connection[1])
                shortReqName = fullReqName
                connId = name + '->' + toName + ':' + fullReqName
                if hasattr(connection[1], 'shortName'):
                    shortReqName = connection[1].shortName(logic)

                if connId not in accLoc['connections']:
                    to = connection[0]
                    matchingConnections = [x for x in to.simple_connections + to.gated_connections if str(x[1]) == fullReqName]

                    newConnection = {
                        'from': name,
                        'to': toName,
                        'req': fullReqName,
                        'diff': i,
                    }

                    accLoc['connections'][connId] = newConnection

                    if fullReqName != shortReqName:
                        newConnection['shortReq'] = shortReqName
                    
                    if not matchingConnections:
                        newConnection['oneWay'] = True
    
    for name,loc in accessibility.items():
        for id,connection in loc['connections'].items():
            if 'oneWay' in connection and connection['to'] in accessibility:
                newConnection = connection.copy()
                newConnection['badWay'] = True
                del newConnection['oneWay']

                to = accessibility[connection['to']]
                to['connections'][id] = newConnection

    for name in accessibility:
        accessibility[name]['connections'] = [v for (k,v) in accessibility[name]['connections'].items()]
        
    return accessibility

def getCheckAccessibility(allChecks, logics, inventory):
    accessibility = {}

    outOfLogic = set(allChecks)

    # Initialize each logic level with their full list of accessible Check objects
    for i in range(len(logics)):
        logic = logics[i]
        
        accessibility[logic.name] = set(loadChecks(logic, inventory))
        outOfLogic = outOfLogic.difference(accessibility[logic.name])
    
    # Remove duplicate checks from higher logic levels
    for i in range(1, len(logics)):
        for j in range(i):
            accessibility[logics[i].name] = accessibility[logics[i].name].difference(accessibility[logics[j].name])

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
        level = accessibility[logics[i].name]
        checksBehindKeys = set(loadChecks(logics[i], keyInventory)).difference(level)

        for j in range(i):
            checksBehindKeys = checksBehindKeys.difference(accessibility[logics[j].name])
        
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
    oolLogic.name = 'ool'
    oolLogic.friendlyName = 'Out of logic'
    oolLogic.difficulty = 9
    accessibility[oolLogic.name] = outOfLogic

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

def addStartingItems(inventory, args, settings):
    inventory['RUPEES_500'] = 10
    inventory['TRUE'] = 1

    if args.bowwow != 'normal':
        inventory['SWORD'] = inventory['SWORD'] + 1

    if args.dungeon_items == 'keysy':
        for i in range(9):
            for amount, item_name in ((9, "KEY"), (1, "NIGHTMARE_KEY")):
                item_name = f"{item_name}{i + 1}"
                inventory[item_name] = amount
    
    if (args.owlstatues not in ['both', 'dungeon']
        and args.goal not in ['bingo', 'bingo-full']
        and ('enableAutotracking' not in settings
             or not settings['enableAutotracking'])):
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