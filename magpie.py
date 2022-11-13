import argparse
import datetime
import traceback
import jsonpickle
from flaskwebgui import FlaskUI
from flask import Flask, render_template, request
from jinja2 import Template

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
        self.hideVanilla = False
        self.dungeonItemsTemplate = 'default.html'
        self.itemsTemplate = 'default.html'
        self.customDungeonItems = None
        self.customItems = None
        self.showDungeonItemCount = False

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
        localSettings = parseLocalSettings(request.form['localSettings'])
        allItems = getItems(args)

        initChecks(args)

        if localSettings.showDungeonItemCount:
            dungeonItemCount = getDungeonItemCount(args)

            for item in dungeonItemCount:
                allItems[item] = dungeonItemCount[item]

        customItems = None
        customDungeonItems = None

        if localSettings.itemsTemplate == 'custom':
            if localSettings.customItems == None:
                localSettings.itemsTemplate = 'default.html'
            else:
                customItems = Template(localSettings.customItems)

        if localSettings.dungeonItemsTemplate == 'custom':
            if localSettings.customDungeonItems == None:
                localSettings.dungeonItemsTemplate = 'default.html'
            else:
                customDungeonItems = Template(localSettings.customDungeonItems)

        result = render_template('items.html', allItems=allItems,
                                               args=args,
                                               localSettings=localSettings,
                                               customItems=customItems,
                                               customDungeonItems=customDungeonItems,
                                               local=local)

        return result
    except:
        return renderTraceback()

@app.route("/shortString", methods=['POST'])
def parseShortString():
    try:
        shortString = request.form['shortString']
        settings = getArgsFromShortString(shortString)

        return jsonpickle.encode(settings)
    except:
        return renderTraceback()

@app.route("/checkList", methods=['POST'])
def renderCheckList():
    try:
        argValues = parseArgs(request.form['args'])
        inventory = jsonpickle.decode(request.form['inventory'])
        entranceMap = jsonpickle.decode(request.form['entranceMap'])

        args = getArgs(values=argValues)
        initChecks(args)

        addStartingItems(inventory, args, entranceMap)

        entrances = getEntrancePool(args)
        if args.randomstartlocation and args.entranceshuffle == 'none':
            entrances = entrances.union(set(getStartLocations(args)))

        cleanUpEntranceMap(entranceMap, entrances, args)

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

@app.route("/suggestion", methods=['POST'])
def suggestion():
    import smtplib
    from subprocess import Popen, PIPE
    from email.mime.multipart import MIMEMultipart
    from email.mime.base import MIMEBase
    from email.mime.text import MIMEText

    subject = 'New Magpie Suggestion'
    emailFrom = 'MagpieSuggestions'
    emailTo = 'root'

    try:
        email = request.form['email']
        body = request.form['body']
        state = request.form['state']

        if '<img' in body:
            subject += ' (with images)'

        html = MIMEText(f'<p>New Magpie suggestion from "{email}:"</p>' + body, 'html')
        alternative = MIMEMultipart('alternative')
        alternative.attach(html)

        attachment = MIMEText(state)
        attachment.add_header('Content-Disposition', 'attachment', filename=f'{datetime.datetime.now()}-magpie-state.json')

        htmlFile = MIMEText(body)
        htmlFile.add_header('Content-Disposition', 'attachment', filename=f'{datetime.datetime.now()}-magpie-suggestion.html')

        msg = MIMEMultipart('mixed')
        msg.attach(alternative)
        msg.attach(attachment)
        msg.attach(htmlFile)
        msg['Subject'] = subject
        msg['From'] = emailFrom
        msg['To'] = emailTo
        p = Popen(["/usr/sbin/sendmail", "-t", "-oi"], stdin=PIPE)
        p.communicate(msg.as_bytes())
    except:
        pass

    return "thx"

def parseArgs(argsString):
    args = jsonpickle.decode(argsString)

    if args.goal == 'egg':
        args.goal = '8'

    return args

def parseLocalSettings(settingsString):
    localSettings = jsonpickle.decode(settingsString)

    return localSettings

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

def addStartingItems(inventory, args, entranceMap):
    reverseMap = {value: key for (key, value) in entranceMap.items()}

    inventory['RUPEES_500'] = 10
    inventory['ANGLER_KEYHOLE'] = 1

    if args.entranceshuffle not in ('insanity', 'expert') or 'crazy_tracy' in reverseMap:
        inventory['MEDICINE2'] = 1

    if 'castle_main_entrance' in reverseMap:
        inventory['CASTLE_BUTTON'] = 1

    if args.entranceshuffle != 'insanity' or 'raft_house' in reverseMap:
        inventory['RAFT'] = 1

    if args.bowwow != 'normal':
        inventory['SWORD'] = inventory['SWORD'] + 1

    if args.dungeon_items == 'keysy':
        for n in range(9):
            for amount, item_name in ((9, "KEY"), (1, "NIGHTMARE_KEY")):
                item_name = "%s%d" % (item_name, n + 1)
                inventory[item_name] = amount

def renderTraceback():
    return f"<pre>{traceback.format_exc()}</pre>"

def cleanUpEntranceMap(entranceMap, entrances, args):
    for source, dest in entranceMap.items():
        if dest == 'landfill':
            entranceMap[source] = 'rooster_house'

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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--local', dest='local', action='store_true', help='Start as a local application')
    args = parser.parse_args()

    local = args.local

    if args.local:
        ui.run()
    else:
        app.run()
