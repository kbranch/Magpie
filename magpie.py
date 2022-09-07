import argparse
from os import access
import traceback
import jsonpickle
from flaskwebgui import FlaskUI
from flask import Flask, render_template, request

from ladxrInterface import *

app = Flask(__name__)
app.jinja_options['trim_blocks'] = True
app.jinja_options['lstrip_blocks'] = True

ui = FlaskUI(app, port=5000)

local = False

class FakeLogic:
    pass

class LocalSettings:
    def __init__(self):
        self.checkSize = 32
        self.mapBrightness = 50
        self.showOutOfLogic = False
        self.animateChecks = True
        self.swapMouseButtons = False
        self.swapItemsAndMap = False
        self.hideChecked = False
        self.ignoreHigherLogic = False

@app.route("/")
def home():
    args = getArgs()
    defaultSettings = LocalSettings()

    flags = args.flags
    args.flags = []

    return render_template("index.html", flags=flags, args=args,
                                         defaultSettings=defaultSettings,
                                         jsonArgs=jsonpickle.encode(args),
                                         jsonSettings=jsonpickle.encode(defaultSettings),
                                         local=local,
                                         )

@app.route("/items", methods=['POST'])
def renderItems():
    try:
        args = parseArgs(request.form['args'])
        allItems = getItems(args)

        result = render_template("items.html", allItems=allItems, args=args)

        return result
    except:
        return renderTraceback()

@app.route("/checkList", methods=['POST'])
def renderCheckList():
    try:
        argValues = parseArgs(request.form['args'])
        inventory = jsonpickle.decode(request.form['inventory'])
        entranceMap = jsonpickle.decode(request.form['entranceMap'])

        if entranceMap == {} and argValues.randomstartlocation:
            entranceMap['start_house'] = 'rooster_house'

        for source, dest in entranceMap.items():
            if dest == 'landfill':
                entranceMap[source] = 'rooster_house'

        inventory['RUPEES_500'] = 10
        inventory['RAFT'] = 1
        inventory['ANGLER_KEYHOLE'] = 1

        initChecks()
        args = getArgs(values=argValues)

        addStartingItems(inventory, args)

        entrances = getEntrancePool(args)
        if args.randomstartlocation and args.entranceshuffle == 'none':
            entrances = entrances.union(set(getStartLocations(args)))

        entrances = list(entrances)
        allItems = getAllItems(args)
        logics = getLogics(args, entranceMap)
        allChecks = loadChecks(getLogicWithoutER(args), allItems)
        accessibility = getAccessibility(allChecks, logics, inventory)

        return render_template("checklist.html", accessibility=accessibility,
                                                 logics=logics,
                                                 checkCount=len(allChecks),
                                                 entrances=jsonpickle.encode(entrances),
                                                 startLocations=jsonpickle.encode(getStartLocations(args)),
                                                 )
    except:
        return renderTraceback()

@app.route("/mapCoords")
def mapCoords():
    return render_template("mapCoords.html")

def parseArgs(argsString):
    args = jsonpickle.decode(argsString)

    if args.goal == 'egg':
        args.goal = '8'

    return args

def getAccessibility(allChecks, logics, inventory):
    accessibility = {}

    outOfLogic = set(allChecks)

    for i in range(len(logics)):
        logic = logics[i]
        
        accessibility[logic] = set(loadChecks(logic, inventory))
        outOfLogic = outOfLogic.difference(accessibility[logics[i]])
    
    for i in range(1, len(logics)):
        for j in range(i):
            accessibility[logics[i]] = accessibility[logics[i]].difference(accessibility[logics[j]])
        
    inventory['KEY1'] = 9
    inventory['KEY2'] = 9
    inventory['KEY3'] = 9
    inventory['KEY4'] = 9
    inventory['KEY5'] = 9
    inventory['KEY6'] = 9
    inventory['KEY7'] = 9
    inventory['KEY8'] = 9
    inventory['KEY9'] = 9

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

        logics[i].difficulty = i
        for check in level:
            check.difficulty = i

    outOfLogic = outOfLogic.difference(alreadyInKeyLogic)
    outOfLogic = sorted(outOfLogic, key=lambda x: (x.area, x.name))

    accessibility[logics[0]] = sorted(accessibility[logics[0]], key=lambda x: (x.area, x.name))
    logics[0].friendlyName = 'In logic'

    for check in outOfLogic:
        check.difficulty = 9 

    for i in range(1, len(logics)):
        logics[i].friendlyName = f'In {logics[i].name} logic'

        accessibility[logics[i]] = sorted(accessibility[logics[i]], key=lambda x: (x.area, x.name))
    
    oolLogic = FakeLogic()
    oolLogic.friendlyName = 'Out of logic'
    oolLogic.difficulty = 9
    accessibility[oolLogic] = outOfLogic
    
    return accessibility

def addStartingItems(inventory, args):
    if args.bowwow != 'normal':
        inventory['SWORD'] = inventory['SWORD'] + 1

    if args.dungeon_items == 'keysy':
        for n in range(9):
            for amount, item_name in ((9, "KEY"), (1, "NIGHTMARE_KEY")):
                item_name = "%s%d" % (item_name, n + 1)
                inventory[item_name] = amount

def renderTraceback():
    return f"<pre>{traceback.format_exc()}</pre>"

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--local', dest='local', action='store_true', help='Start as a local application')
    args = parser.parse_args()

    local = args.local

    if args.local:
        ui.run()
    else:
        app.run()
