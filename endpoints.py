import json
import base64
import socket
import platform
import requests
import traceback
from jinja2 import Template
from datetime import datetime
from flask import Flask, render_template, request
from ndi import updateMapImage, updateItemsImage

import ladxrInterface
from version import *
from trackables import *
from localSettings import LocalSettings, updateSettings
from args import Args

try:
    import newrelic.agent
except:
    pass

app = Flask(__name__)
app.jinja_options['trim_blocks'] = True
app.jinja_options['lstrip_blocks'] = True

local = False
diskSettings = None
hostname = socket.gethostname()

def renderTraceback():
    return f"<pre>{traceback.format_exc()}</pre>"

def getDiskSettings():
    global diskSettings

    settings = {}

    if diskSettings == None:
        return settings

    if 'args' in diskSettings:
        settings['args'] = diskSettings['args']

    if 'localSettings' in diskSettings:
        settings['localSettings'] = diskSettings['localSettings']

    diskSettings = None
    
    return json.dumps(settings).replace("'", '"').replace("\\", "\\\\")

@app.route("/")
def home():
    args = getArgs()
    defaultSettings = LocalSettings()

    flags = args.flags
    args.flags = []
    settingsOverrides = {}
    argsOverrides = {}

    if request.args.get('enable_autotracking') or request.args.get('enable_autotracker'):
        settingsOverrides['enableAutotracking'] = True

    shortString = request.args.get('shortString') 
    if shortString:
        argsOverrides = getArgsFromShortString(shortString)
    
    settingsPrefix = 'setting_'
    argsPrefix = 'flag_'
    for arg, value in request.args.items():
        if arg.startswith(settingsPrefix):
            settingsOverrides[arg[len(settingsPrefix):]] = value
        if arg.startswith(argsPrefix):
            argsOverrides[arg[len(argsPrefix):]] = value
    
    remoteVersion = None

    if local:
        remoteVersion = getRemoteVersion()
        if remoteVersion:
            remoteVersion = remoteVersion['magpie']

    return render_template("index.html", flags=flags, args=args,
                                         defaultSettings=defaultSettings,
                                         jsonArgs=json.dumps(args.__dict__),
                                         jsonSettings=json.dumps(defaultSettings.__dict__),
                                         jsonSettingsOverrides=json.dumps(settingsOverrides),
                                         jsonArgsOverrides=json.dumps(argsOverrides),
                                         local=local,
                                         graphicsOptions=LocalSettings.graphicsPacks(),
                                         version=getVersion(),
                                         remoteVersion=remoteVersion,
                                         diskSettings=getDiskSettings(),
                                         hostname=hostname,
                                         )

@app.route("/items", methods=['POST'])
def renderItems():
    try:
        argsText = request.form['args']
        settingsText = request.form['localSettings']

        if local:
            updateSettings(argsText, settingsText)

        args = Args.parse(argsText)
        localSettings = LocalSettings.parse(settingsText)
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
                                               local=local,
                                               )

        return result
    except:
        return renderTraceback()

@app.route("/version")
def serveVersion():
    try:
        version = {}
        version['magpie'] = getVersion()
        version['autotracker'] = getAutotrackerVersion()
        version['api'] = '1.1'

        return json.dumps(version)
    except:
        return renderTraceback()

@app.route("/health")
def health():
    if 'newrelic' in sys.modules:
        newrelic.agent.ignore_transaction()

    return "OK"

@app.route("/fetchupdate")
def fetchUpdate():
    if not local:
        return "Not running local version", 401

    try:
        headers = {'User-Agent': 'Magpie'}
        url ="https://magpietracker.us/static/builds/magpie-local.zip"

        if platform.system().lower() != 'windows':
            url = "https://magpietracker.us/static/builds/magpie-local-linux.zip"

        request = requests.get(url, headers=headers)

        with open('update.zip', 'wb') as oFile:
            oFile.write(request.content)

        return "Update downloaded, restart Magpie to install"
    except:
        return renderTraceback()

@app.route("/shortString", methods=['POST'])
def parseShortString():
    try:
        shortString = request.form['shortString']
        settings = getArgsFromShortString(shortString)

        return json.dumps(settings)
    except:
        return renderTraceback()

@app.route("/spoilerLog", methods=['POST'])
def getSpoilerLog():
    try:
        romData = base64.b64decode(request.form['romData'])
        return loadSpoilerLog(romData)
    except:
        return renderTraceback()

@app.route("/checkList", methods=['POST'])
def renderCheckList():
    try:
        argValues = Args.parse(request.form['args'])
        inventory = json.loads(request.form['inventory'])
        entranceMap = json.loads(request.form['entranceMap'])
        bossList = json.loads(request.form['bossList'])
        minibossMap = json.loads(request.form['minibossMap'])

        for key in list(minibossMap.keys()):
            if key.isnumeric():
                minibossMap[int(key)] = minibossMap[key]
                del minibossMap[key]

        args = getArgs(values=argValues)
        initChecks(args)

        addStartingItems(inventory, args)

        entrances = getEntrancePool(args)
        if args.randomstartlocation and args.entranceshuffle == 'none':
            entrances = entrances.union(set(getStartLocations(args)))

        cleanUpEntranceMap(entranceMap, entrances, args)

        entrances = list(entrances)
        allItems = getAllItems(args)
        logics = getLogics(args, entranceMap, bossList, minibossMap)
        allChecks = loadChecks(getLogicWithoutER(args), allItems)
        accessibility = getAccessibility(allChecks, entrances, logics, inventory)

        result = render_template("checklist.html", checkAccessibility=accessibility.checks,
                                                 entranceAccessibility=json.dumps(accessibility.entrances, default=lambda x: x.__dict__),
                                                 logics=logics,
                                                 checkCount=len(allChecks),
                                                 allChecks=ladxrInterface.allChecks.values(),
                                                 entrances=json.dumps(entrances),
                                                 startLocations=json.dumps(getStartLocations(args)),
                                                 )

        return result
    except:
        return renderTraceback()

@app.route("/mapCoords")
def mapCoords():
    return render_template("mapCoords.html")

@app.route("/suggestion", methods=['POST'])
def suggestion():
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
        attachment.add_header('Content-Disposition', 'attachment', filename=f'{datetime.now()}-magpie-state.json')

        htmlFile = MIMEText(body)
        htmlFile.add_header('Content-Disposition', 'attachment', filename=f'{datetime.now()}-magpie-suggestion.html')

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
        print(traceback.format_exc())

    response = app.response_class(
        response="thx",
        status=200,
        mimetype='application/json'
    )

    response.headers.add('Access-Control-Allow-Origin', '*')

    return response

@app.route("/mapNdi", methods=['POST'])
def mapNdi():
    data = request.form["data"]
    pngBytes = base64.b64decode(data.split(',')[1])
    updateMapImage(pngBytes)

    return "OK"

@app.route("/itemsNdi", methods=['POST'])
def itemsNdi():
    data = request.form["data"]
    pngBytes = base64.b64decode(data.split(',')[1])
    updateItemsImage(pngBytes)

    return "OK"