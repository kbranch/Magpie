import jsonpickle
from flask import Flask, render_template

from ladxrInterface import *

app = Flask(__name__)

@app.route("/")
def home():
    args = getArgs()
    allItems = getItems(args)
    logics = getLogics(args)
    allChecks = loadChecks(logics[0], allItems)

    return render_template("index.html", args=args, allItems=allItems, allChecks=allChecks)

def getAccessibility(allChecks, logics, inventory):
    accessibility = {}

    for check in allChecks:
        accessibility[check] = -1

    for i in range(len(logics)):
        logic = logics[i]
        checks = loadChecks(logic, inventory)
        for check in checks:
            if accessibility[check] == -1:
                accessibility[check] = i
    
    return accessibility

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