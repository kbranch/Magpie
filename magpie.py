import argparse
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

@app.route("/")
def home():
    args = getArgs()
    allItems = getItems(args)

    flags = args.flags
    args.flags = []

    return render_template("index.html", flags=flags, jsonArgs=jsonpickle.encode(args), allItems=allItems, local=local)

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

        inventory['RUPEES_500'] = 10
        inventory['RAFT'] = 1
        inventory['ANGLER_KEYHOLE'] = 1

        initChecks()
        args = getArgs(values=argValues)

        addStartingItems(inventory, args)

        allItems = getItems(args)
        logics = getLogics(args)
        allChecks = loadChecks(logics[0], allItems)
        accessibility = getAccessibility(allChecks, logics, inventory)

        return render_template("checklist.html", accessibility=accessibility, logics=logics)
    except:
        return renderTraceback()

@app.route("/mapCoords")
def mapCoords():
    # checks = getAllChecks()
    # for check in checks:
    #     checks[check].id = check
    
    # checkList = list(checks.values())

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
        
        accessibility[logic.name] = set(loadChecks(logic, inventory))
    
    for i in range(1, len(logics)):
        outOfLogic = outOfLogic.difference(accessibility[logics[i].name])

        for j in range(i):
            accessibility[logics[i].name] = accessibility[logics[i].name].difference(accessibility[logics[j].name])
        
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
        level = accessibility[logics[i].name]
        checksBehindKeys = set(loadChecks(logics[i], inventory)).difference(level)

        for j in range(i):
            checksBehindKeys = checksBehindKeys.difference(accessibility[logics[j].name])
        
        for check in checksBehindKeys:
            if check in alreadyInKeyLogic:
                continue

            alreadyInKeyLogic.add(check)
            # outOfLogic.remove(check)
            level.add(check.cloneBehindKeys())

        for check in level:
            check.difficulty = i

    outOfLogic = outOfLogic.difference(alreadyInKeyLogic)
    accessibility['In logic'] = sorted(accessibility[logics[0].name], key=lambda x: (x.area, x.name))
    outOfLogic = sorted(outOfLogic, key=lambda x: (x.area, x.name))

    for check in outOfLogic:
        check.difficulty = 9 

    for logic in logics:
        checks = accessibility[logic.name]
        del accessibility[logic.name]

        if logic == logics[0]:
            continue

        accessibility[f'In {logic.name} logic'] = sorted(checks, key=lambda x: (x.area, x.name))
    
    accessibility['Out of logic'] = outOfLogic
    
    return accessibility

def addStartingItems(inventory, args):
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
