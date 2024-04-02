import gzip
import json
import queue
import base64
import socket
import platform
import requests
import traceback
import broadcastView
from broadcastView import BroadcastView
from jinja2 import Template
from datetime import datetime
from flask import Flask, render_template, request, make_response
# from werkzeug.middleware.profiler import ProfilerMiddleware

from version import *
from trackables import *
from localSettings import LocalSettings, updateSettings
from args import Args
from trackerLogic import applyTrackerLogic
from ladxrInterface import *

try:
    import newrelic.agent
except:
    pass

try:
    import ndi
except:
    pass

def tryGetValue(dict, key):
    if not key in dict:
        return None
    
    return dict[key]

app = Flask(__name__, instance_relative_config=True)
app.jinja_options['trim_blocks'] = True
app.jinja_options['lstrip_blocks'] = True

app.config['hostname'] = socket.gethostname()
app.config['local'] = False

mainThreadQueue = queue.Queue()
itemsBroadcastView = BroadcastView(mainThreadQueue, broadcastView.types.items)
mapBroadcastView = BroadcastView(mainThreadQueue, broadcastView.types.map)

# app.wsgi_app = ProfilerMiddleware(app.wsgi_app)

try:
    import sharing
    app.config.from_pyfile('config.py')
    sharing.setDbInfo(tryGetValue(app.config, 'SHARING_SERVER'),
                      tryGetValue(app.config, 'SHARING_PORT'),
                      tryGetValue(app.config, 'SHARING_DB'),
                      tryGetValue(app.config, 'SHARING_USERNAME'),
                      tryGetValue(app.config, 'SHARING_PASSWORD'))

    sharingEnabled = True
except:
    sharingEnabled = False

diskSettings = None

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

jsonEndpoints = {'/playerState', '/eventInfo', '/createEvent', '/checks'}
corsEndpoints = {'/playerState', '/playerId', '/suggestion', '/eventInfo', '/createEvent', '/event', '/checks'}
@app.after_request
def afterRequest(response):
    if request.method.lower() == 'options':
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'content-type')
    elif request.path in corsEndpoints:
        response.headers.add('Access-Control-Allow-Origin', '*')
    
    if request.path in jsonEndpoints:
        response.mimetype = 'application/json'

    return response

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

    if app.config['local']:
        remoteVersion = getRemoteVersion()
        if remoteVersion:
            remoteVersion = remoteVersion['magpie']

    return render_template("index.html", flags=flags, 
                                         args=args,
                                         defaultSettings=defaultSettings,
                                         jsonArgs=json.dumps(args.__dict__),
                                         jsonSettings=json.dumps(defaultSettings.__dict__),
                                         jsonSettingsOverrides=json.dumps(settingsOverrides),
                                         jsonArgsOverrides=json.dumps(argsOverrides),
                                         local=app.config['local'],
                                         graphicsOptions=LocalSettings.graphicsPacks(),
                                         version=getVersion(),
                                         remoteVersion=remoteVersion,
                                         diskSettings=getDiskSettings(),
                                         hostname=app.config['hostname'],
                                         allowAutotracking=True,
                                         allowMap=True,
                                         players=[''],
                                         broadcastMode='send',
                                         )

@app.route("/items", methods=['POST'])
def renderItems():
    try:
        argsText = request.form['args']
        settingsText = request.form['localSettings']

        if app.config['local']:
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
        elif not localSettings.itemsTemplate:
            localSettings.itemsTemplate = 'default.html'

        if localSettings.dungeonItemsTemplate == 'custom':
            if localSettings.customDungeonItems == None:
                localSettings.dungeonItemsTemplate = 'default.html'
            else:
                customDungeonItems = Template(localSettings.customDungeonItems)
        elif not localSettings.dungeonItemsTemplate:
            localSettings.dungeonItemsTemplate = 'default.html'

        result = render_template('items.html', allItems=allItems,
                                               args=args,
                                               localSettings=localSettings,
                                               customItems=customItems,
                                               customDungeonItems=customDungeonItems,
                                               local=app.config['local'],
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
        version['api'] = '1.32'

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
    if not app.config['local']:
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
        argsText = request.form['args']
        entranceText = request.form['entranceMap']
        bossText = request.form['bossList']
        minibossText = request.form['minibossMap']

        argValues = Args.parse(argsText)
        inventory = json.loads(request.form['inventory'])
        entranceMap = json.loads(entranceText)
        bossList = json.loads(bossText)
        minibossMap = json.loads(minibossText)

        logicHash = hash(argsText + entranceText + bossText + minibossText)

        settings = {}

        if 'localSettings' in request.form:
            settings = json.loads(request.form['localSettings'])

        for key in list(minibossMap.keys()):
            if key.isnumeric():
                minibossMap[int(key)] = minibossMap[key]
                del minibossMap[key]
            
        trackerLogic.patchRequirements()

        args = getArgs(values=argValues)
        initChecks(args)

        addStartingItems(inventory, args, settings)
        inventory = {key: value for (key, value) in inventory.items() if value > 0}

        entrances = getEntrancePool(args)
        if args.randomstartlocation and args.entranceshuffle == 'none':
            entrances = entrances.union(set(getStartLocations(args)))

        cleanUpEntranceMap(entranceMap, entrances, args)

        entrances = list(entrances)
        allItems = getAllItems(args)
        logics = getCachedLogics(logicHash, args, entranceMap, bossList, minibossMap)
        allChecks = loadChecks(getLogicWithoutER(args), allItems, True)
        accessibility = getAccessibility(allChecks, entrances, logics, inventory)

        result = {
            'accessibility': {
                'checks': [],
                'entrances': accessibility.entrances,
                'logicHints': [],
                'graph': accessibility.graph,
            },
            'logics': [{
                'difficulty': x.difficulty,
                'friendlyName': x.friendlyName,
                'name': x.name,
            } for x in logics['stock']],
            'randomizedEntrances': entrances,
            'startLocations': getStartLocations(args),
        }

        for logic in accessibility.checks:
            result['accessibility']['checks'] += list(accessibility.checks[logic])

        for logic in accessibility.logicHints:
            result['accessibility']['logicHints'] += list(accessibility.logicHints[logic])

        content = gzip.compress(json.dumps(result, default=lambda x: x.__dict__).encode('utf8'), 5)
        response = make_response(content)
        response.headers['Content-length'] = len(content)
        response.headers['Content-Encoding'] = 'gzip'

        return response
        # return json.dumps(result, default=lambda x: x.__dict__)
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
    from email.mime.application import MIMEApplication

    subject = 'New Magpie Suggestion'
    emailFrom = 'MagpieSuggestions'
    emailTo = 'root'

    try:
        email = request.form['email']
        body = request.form['body']
        state = base64.b64decode(request.form['state'])

        if '<img' in body:
            subject += ' (with images)'

        html = MIMEText(f'<p>New Magpie suggestion from "{email}:"</p>' + body, 'html')
        alternative = MIMEMultipart('alternative')
        alternative.attach(html)

        attachment = MIMEApplication(state, _subtype="x-zip")
        attachment.add_header('Content-Disposition', 'attachment', filename=f'{datetime.now()}-magpie-state.zip')

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

    return 'thx'

@app.route("/mapBroadcastFrame", methods=['POST'])
def mapBroadcastFrame():
    if not app.config['local']:
        return "Broadcast view is only available in the offline version of Magpie"

    data = request.form["data"]
    pngBytes = base64.b64decode(data.split(',')[1])
    
    mapBroadcastView.updateImage(pngBytes)

    return "OK"

@app.route("/itemsBroadcastFrame", methods=['POST'])
def itemsBroadcastFrame():
    if not app.config['local']:
        return "Broadcast view is only available in the offline version of Magpie"

    data = request.form["data"]
    pngBytes = base64.b64decode(data.split(',')[1])

    itemsBroadcastView.updateImage(pngBytes)

    return "OK"

@app.route("/broadcastSettings", methods=['POST'])
def broadcastSettings():
    if not app.config['local']:
        return "Broadcast view is only available in the offline version of Magpie"

    items = broadcastView.modes[request.form["items"]]
    map = broadcastView.modes[request.form["map"]]
    
    itemsBroadcastView.setMode(items)
    mapBroadcastView.setMode(map)

    return "OK"

@app.route("/itemsBroadcast")
def itemsBroadcast():
    args = getArgs()
    defaultSettings = LocalSettings()

    flags = args.flags
    args.flags = []
    settingsOverrides = {}
    argsOverrides = {}

    return render_template("itemsBroadcast.html",
                                flags=flags, 
                                args=args,
                                defaultSettings=defaultSettings,
                                jsonArgs=json.dumps(args.__dict__),
                                jsonSettings=json.dumps(defaultSettings.__dict__),
                                jsonSettingsOverrides=json.dumps(settingsOverrides),
                                jsonArgsOverrides=json.dumps(argsOverrides),
                                local=app.config['local'],
                                graphicsOptions=LocalSettings.graphicsPacks(),
                                version=getVersion(),
                                diskSettings=getDiskSettings(),
                                hostname=app.config['hostname'],
                                hideShare=True,
                                showTitle=True,
                                keepQueryArgs=True,
                                settingsPrefix='itemsBroadcast_',
                                players=[''],
                                extraTitle=" - Items Broadcast View",
                                broadcastMode='receive',
                           )

if sharingEnabled:
    @app.route("/playerState", methods=['POST'])
    def playerStatePost():
        try:
            state = request.json
        except:
            state = None

        if not state or 'settings' not in state or not validateJson(state['settings'], ['playerName', 'playerId']):
            return "Invalid request", 400

        settings = state['settings']

        if 'eventName' in settings:
            eventName = settings['eventName']
            code = tryGetValue(settings, 'joinCode')
            permissions = sharing.authenticateEvent(eventName, code)

            if permissions:
                (join, view) = permissions

                if not join:
                    if code:
                        return "Invalid joinCode", 403

                    return "A joinCode is required", 401

        timestamp = sharing.writeState(settings['playerName']
                                    ,settings['playerId']
                                    ,tryGetValue(settings, 'eventName')
                                    ,json.dumps(state))

        return str(timestamp)

    @app.route("/playerState", methods=['GET'])
    def playerStateGet():
        playerJson = request.args.get('players')
        if not playerJson:
            return "Player list is required", 400

        players = json.loads(playerJson)
        result = {}

        for playerName, data in players.items():
            playerResult = sharing.getState(playerName, data['timestamp'], data['delaySeconds'])
            result[playerName] = playerResult

        return json.dumps(result)

    @app.route("/playerId", methods=['POST'])
    def playerId():
        if 'playerName' not in request.form:
            return "playerName is required", 400

        id = sharing.getPlayerId(request.form['playerName'])

        return str(id)

    @app.route("/canJoinEvent", methods=['GET'])
    def canJoinEvent():
        eventName = request.args.get('eventName')
        code = request.args.get('joinCode')
        if not eventName or not code:
            return "eventName and joinCode are required", 400

        (join, view) = sharing.authenticateEvent(eventName, code)

        return json.dumps(join)

    @app.route("/canViewEvent", methods=['GET'])
    def canViewEvent():
        eventName = request.args.get('eventName')
        code = request.args.get('viewCode')
        if not eventName or not code:
            return "eventName and viewCode are required", 400

        (join, view) = sharing.authenticateEvent(eventName, code)

        return json.dumps(view)

    @app.route("/eventInfo", methods=['GET'])
    def eventInfo():
        eventName = request.args.get('eventName')
        if not eventName:
            return "eventName is required", 400

        event = sharing.eventInfo(eventName)

        return json.dumps(event)

    @app.route("/createEvent", methods=['POST'])
    def createEvent():
        eventName = request.form['eventName']
        joinCode = request.form['joinCode']
        viewCode = request.form['viewCode']

        if (not eventName):
            return "eventName is required", 400

        success = sharing.createEvent(eventName, joinCode, viewCode)

        return json.dumps(success)

    @app.route("/event", methods=['GET'])
    def event():
        eventName = request.args.get('eventName')
        joinCode = request.args.get('joinCode')
        viewCode = request.args.get('viewCode')

        args = getArgs()
        defaultSettings = LocalSettings()

        flags = args.flags
        args.flags = []
        settingsOverrides = {}
        argsOverrides = {}

        players = []
        codeFailed = False

        if eventName:
            eventInfo = sharing.eventInfo(eventName)

            if eventInfo:
                view = True
                permissions = sharing.authenticateEvent(eventName, viewCode)

                if permissions:
                    (join, view) = permissions

                if eventInfo['privateView']:
                    codeFailed = not view

                if ((eventInfo['privateView'] and view) or not eventInfo['privateView']):
                    players = sharing.getEventPlayers(eventName)

        return render_template("event.html", flags=flags, 
                                            args=args,
                                            defaultSettings=defaultSettings,
                                            jsonArgs=json.dumps(args.__dict__),
                                            jsonSettings=json.dumps(defaultSettings.__dict__),
                                            jsonSettingsOverrides=json.dumps(settingsOverrides),
                                            jsonArgsOverrides=json.dumps(argsOverrides),
                                            local=app.config['local'],
                                            graphicsOptions=LocalSettings.graphicsPacks(),
                                            version=getVersion(),
                                            diskSettings=getDiskSettings(),
                                            hostname=app.config['hostname'],
                                            hideShare=True,
                                            showTitle=True,
                                            keepQueryArgs=True,
                                            settingsPrefix='event_',
                                            players=players,
                                            eventName=eventName,
                                            viewCode=viewCode,
                                            joinCode=joinCode,
                                            codeFailed=codeFailed,
                                            extraTitle=" - Event Restream",
                                        )

    @app.route("/player")
    def player():

        return "OK"

    def validateJson(json, keys):
        for key in keys:
            if not tryGetValue(json, key):
                return False
        
        return True