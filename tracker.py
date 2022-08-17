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
        json = request.form['args']
        args = jsonpickle.decode(json)
        allItems = getItems(args)

        result = render_template("items.html", allItems=allItems)

        return result
    except:
        return renderTraceback()

@app.route("/map", methods=['POST'])
def renderMap():
    try:
        argValues = jsonpickle.decode(request.form['args'])
        inventory = jsonpickle.decode(request.form['inventory'])

        args = getArgs(values=argValues)
        allItems = getItems(args)
        logics = getLogics(args)
        allChecks = loadChecks(logics[0], allItems)
        accessibility = getAccessibility(allChecks, logics, inventory)

        return render_template("map.html", accessibility=accessibility)
    except:
        return renderTraceback()

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
    
    accessibility['In logic'] = sorted(accessibility[logics[0].name], key=lambda x: (x.area, x.name))
    outOfLogic = sorted(outOfLogic, key=lambda x: (x.area, x.name))

    for logic in logics:
        checks = accessibility[logic.name]
        del accessibility[logic.name]

        if logic == logics[0]:
            continue

        accessibility[f'In {logic.name} logic'] = sorted(checks, key=lambda x: (x.area, x.name))
    
    accessibility['Out of logic'] = outOfLogic
    
    return accessibility

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

# def main():
#     args = getArgs()
#     items = getItems(args)
#     logics = getLogics(args)

#     print('\nFlags:')
#     print(args.flags)

#     allChecks = loadChecks(logics[0], items)

#     inventory = {}

    # while True:
    #     print("\nRemaining Pool:")
    #     print(items)

    #     print("\nInventory:")
    #     print(inventory)

    #     print("\nChecks:\n")

    #     accessibility = getAccessibility(allChecks, logics, inventory)

    #     lastArea = ''
    #     for check in allChecks:
    #         if lastArea != check.area:
    #             print(check.area)
    #             lastArea = check.area
            
    #         prefix = str(accessibility[check])

    #         print(f"\t{prefix} {check.name}")
        
    #     item = input("\nEnter an item: ").upper()

    #     if item in inventory:
    #         inventory[item] += 1
    #     else:
    #         inventory[item] = 1

    #     if item in items:
    #         items[item] -= 1
    #         if items[item] == 0:
    #             del items[item]

# main()