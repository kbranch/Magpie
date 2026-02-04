import sys
import gzip
import json
import queue
import base64
import socket
import logging
import platform
import requests
import traceback
import localSettings
from urllib.parse import urlparse
from jinja2 import Template
from datetime import datetime
from flask import Flask, render_template, request, make_response, send_from_directory, Request
# from werkzeug.middleware.profiler import ProfilerMiddleware

from version import *
from trackables import *
from localSettings import LocalSettings, updateSettings
from args import Args
from ladxrInterface import *

try:
    import newrelic.agent
except:
    pass

class BigRequest(Request):
    def __init__(self, *args, **kwargs):
        super(BigRequest, self).__init__(*args, **kwargs)
        self.max_form_memory_size = 1024*1024*50

logging.basicConfig(
    filename="magpie.log",
    filemode="w",
    format="%(asctime)s,%(msecs)d %(name)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
    level=logging.DEBUG,
)

logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

def tryGetValue(dict, key):
    if not key in dict:
        return None
    
    return dict[key]

app = Flask(__name__, instance_relative_config=True)
app.jinja_options['trim_blocks'] = True
app.jinja_options['lstrip_blocks'] = True

app.config['hostname'] = socket.gethostname()
app.config['local'] = False
app.config['MAX_CONTENT_LENGTH'] = 1024*1024*50
app.request_class = BigRequest

mainThreadQueue = queue.Queue()
itemsBroadcastView = None
mapBroadcastView = None
ndiEnabled = False

# app.wsgi_app = ProfilerMiddleware(app.wsgi_app)

try:
    import sharing
    app.config.from_pyfile('config.py')
    sharing.setDbInfo(tryGetValue(app.config, 'SHARING_SERVER'),
                      tryGetValue(app.config, 'SHARING_PORT'),
                      tryGetValue(app.config, 'SHARING_DB'),
                      tryGetValue(app.config, 'SHARING_USERNAME'),
                      tryGetValue(app.config, 'SHARING_PASSWORD'),
                      tryGetValue(app.config, 'SHARING_DBTYPE'))

    sharingEnabled = True
    logging.info("Sharing enabled")
except:
    sharingEnabled = False
    logging.info(f"Sharing disabled: {traceback.format_exc()}")

try:
    import tips
    tips.setDbInfo(tryGetValue(app.config, 'TIPS_SERVER'),
                   tryGetValue(app.config, 'TIPS_PORT'),
                   tryGetValue(app.config, 'TIPS_DB'),
                   tryGetValue(app.config, 'TIPS_USERNAME'),
                   tryGetValue(app.config, 'TIPS_PASSWORD'))

    tipsAdminKey = tryGetValue(app.config, 'TIPS_ADMIN_KEY')
    tipsEnabled = True
    logging.info("Tips enabled")
except:
    tipsEnabled = False
    logging.info(f"Tips disabled: {traceback.format_exc()}")

def renderTraceback():
    return json.dumps({
        'error': traceback.format_exc(),
    })

def getDiskSettings(prefix='', jsonify=True):
    if not app.config['local']:
        return '{}' if jsonify else {}
    
    settings = {}
    diskSettings = localSettings.readSettings()

    if prefix + 'args' in diskSettings:
        settings['args'] = diskSettings[prefix + 'args']

    if 'localSettings' in diskSettings:
        settings['localSettings'] = diskSettings['localSettings']
    
    if jsonify:
        diskSettings = json.dumps(settings).replace("'", '"').replace("\\", "\\\\")

    return diskSettings

def getSidebarMessage():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'sidebarMessage')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return None

jsonEndpoints = {'/playerState', '/eventInfo', '/createEvent', '/checks', '/vueInit', '/diskSettings' }
corsEndpoints = {'/playerState', '/playerId', '/suggestion', '/eventInfo', '/createEvent', '/event', '/checks', '/vueInit', '/items', '/checkList', '/shortString', '/spoilerLog', '/diskSettings' }
@app.after_request
def afterRequest(response):
    if request.method.lower() == 'options':
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'content-type')
    elif request.path in corsEndpoints or '/api/' in request.path:
        response.headers.add('Access-Control-Allow-Origin', '*')
    
    if request.path in jsonEndpoints or '/api/' in request.path and response.mimetype == 'text/html':
        response.mimetype = 'application/json'

    return response

@app.route("/items", methods=['POST'])
def renderItems():
    try:
        argsText = request.form['args']
        settingsText = request.form['localSettings']

        args = Args.parse(argsText)
        localSettings = LocalSettings.parse(settingsText)
        defaultArgs = getArgs()

        for arg, value in defaultArgs.__dict__.items():
            if arg not in args.__dict__:
                args.__dict__[arg] = value

        fixArgs(args)

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
@app.route("/api/version")
def serveVersion():
    try:
        version = {}
        magpieVersion = getVersion()
        version['magpie'] = magpieVersion['build']
        version['magpieDisplay'] = magpieVersion['version']
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
        path = 'update.zip'
        url = "https://magpietracker.us/static/builds/magpie-local.zip"
        # url = "https://dev.magpietracker.us/static/builds/magpie-local-dev.zip"

        if ndiEnabled:
            url = "https://magpietracker.us/static/builds/magpie-local-ndi.zip"

        if platform.system().lower() == 'linux':
            path = '../update.zip'
            url = "https://magpietracker.us/static/builds/magpie-local-linux.zip"
            # url = "https://dev.magpietracker.us/static/builds/magpie-local-linux-dev.zip"

            if ndiEnabled:
                url = "https://magpietracker.us/static/builds/magpie-local-linux-ndi.zip"
        elif platform.system().lower() != 'windows':
            path = '../update.zip'
            url = "https://magpietracker.us/static/builds/magpie-local-macos.zip"
            # url = "https://dev.magpietracker.us/static/builds/magpie-local-macos-dev.zip"

        request = requests.get(url, headers=headers)

        with open(path, 'wb') as oFile:
            oFile.write(request.content)

        return "Update downloaded, restart Magpie to install"
    except:
        return renderTraceback()

@app.route("/api/shortString", methods=['POST'])
@app.route("/shortString", methods=['POST'])
def parseShortString():
    try:
        shortString = request.form['shortString']
        if shortString.startswith("http"):
            url = urlparse(shortString)
            if url.hostname == "ladxr.daid.eu":
                shortString = url.fragment

        settings = getArgsFromShortString(shortString)

        return json.dumps(settings)
    except:
        return renderTraceback()

@app.route("/api/spoilerLog", methods=['POST'])
@app.route("/spoilerLog", methods=['POST'])
def getSpoilerLog():
    try:
        romData = base64.b64decode(request.form['romData'])
        return loadSpoilerLog(romData)
    except:
        return renderTraceback()

@app.route("/api/diskSettings", methods=['POST'])
def updateDiskSettings():
    storage = request.form['localStorage']
    updateSettings(localStorage=storage)

    return "ok"

@app.route("/api/checkList", methods=['POST'])
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

        settings = {}

        if 'localSettings' in request.form:
            settings = json.loads(request.form['localSettings'])

        for key in list(minibossMap.keys()):
            if key.isnumeric():
                minibossMap[int(key)] = minibossMap[key]
                del minibossMap[key]
            
        trackerLogic.patchRequirements()

        args = getArgs(values=argValues)

        reqString = ''
        if args.goal == 'specific':
            reqString = ''.join([x[3] for x in inventory if x.startswith('REQ') and inventory[x] > 0])
            if reqString == '':
                reqString = '12345678'
            args.goal = f'={reqString}'

        initChecks(args)

        addStartingItems(inventory, args, settings)
        inventory = {key: value for (key, value) in inventory.items() if value > 0}

        entrances = getEntrancePool(args)
        if args.randomstartlocation and args.entranceshuffle == 'none':
            entrances = entrances.union(set(getStartLocations(args)))

        cleanUpEntranceMap(entranceMap, entrances, args)

        entrances = list(entrances)
        allItems = getAllItems(args)

        logicHash = hash(argsText + entranceText + bossText + minibossText + reqString)

        logics = getCachedLogics(logicHash, args, entranceMap, bossList, minibossMap)
        allChecks = loadChecks(getLogicWithoutER(args), allItems, True)
        accessibility = getAccessibility(allChecks, entrances, logics, inventory)
        version = getVersion()

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
            'version': version['build'],
            'versionDisplay': version['version'],
            'updateMessage': getUpdateMessage(),
            'sidebarMessage': getSidebarMessage(),
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

@app.route("/api/mapBroadcastFrame", methods=['POST'])
def mapBroadcastFrame():
    try:
        if not app.config['local']:
            return "Broadcast view is only available in the offline version of Magpie"

        data = request.form["data"]
        pngBytes = base64.b64decode(data.split(',')[1])
        
        mapBroadcastView.updateImage(pngBytes)

        return "OK"
    except:
        error = traceback.format_exc()
        logging.error(f"Error in mapBroadcastFrame: {error}")

        return json.dumps({'error': error})

@app.route("/api/itemsBroadcastFrame", methods=['POST'])
def itemsBroadcastFrame():
    if not app.config['local']:
        return "Broadcast view is only available in the offline version of Magpie"

    data = request.form["data"]
    pngBytes = base64.b64decode(data.split(',')[1])

    itemsBroadcastView.updateImage(pngBytes)

    return "OK"

@app.route("/api/broadcastSettings", methods=['POST'])
def broadcastSettings():
    if not app.config['local']:
        return "Broadcast view is only available in the offline version of Magpie"
    
    from broadcastView import modes

    items = modes[request.form["items"]]
    map = modes[request.form["map"]]
    bgColor = request.form["bgColor"]
    
    itemsBroadcastView.setMode(items, bgColor)
    mapBroadcastView.setMode(map)

    return "OK"

@app.route("/api/basicInit")
def getBasicInit():
    args = getArgs()
    defaultSettings = LocalSettings()
    flags = args.flags
    args.flags = []

    version = getVersion()
    remoteVersion = version

    if app.config['local']:
        remoteVersion = getRemoteVersion()
        if remoteVersion:
            remoteVersion = remoteVersion['magpie']

    return json.dumps({
        "flags": [x.__dict__ for x in flags],
        "args": args.__dict__,
        "defaultSettings": defaultSettings.__dict__,
        "local": app.config["local"],
        "graphicsOptions": LocalSettings.graphicsPacks(),
        "version": version['build'],
        "versionDisplay": version['version'],
        "remoteVersion": remoteVersion,
        "diskSettings": getDiskSettings(jsonify=False),
        "hostname": app.config["hostname"],
        "ndiEnabled": ndiEnabled,
    })

if tipsEnabled:
    @app.route('/api/tips', methods=['GET'])
    def getTips():
        node = request.args.get('node')
        showUnapprovedTips = request.args.get('includeUnapproved') == 'true'
        if not node:
            return "Node ID is required", 400
        
        result = tips.getTips(node, showUnapprovedTips)

        return json.dumps(result)

    @app.route('/api/tipApprovalQueue', methods=['GET'])
    def getTipApprovalQueue():
        return json.dumps(tips.getUnapprovedTips())

    @app.route('/api/newTip', methods=['POST'])
    def newTip():
        try:
            tip = request.json
        except:
            tip = None

        if not tip or 'node1' not in tip:
            return 'Invalid request', 400

        try:
            tips.addTip(tip)
        except:
            return traceback.format_exc(), 500

        return 'ok'
    
    @app.route('/api/tipImage', methods=['POST'])
    def tipImage():
        if 'file' not in request.files:
            return '"file" is required', 400
        for field in ('filename', 'connectionId'):
            if field not in request.form:
                return f'"{field}" is required', 400
        
        publicPath = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static/')
        tipPath = 'images/tips/'

        file = request.files['file'].read()
        base, extension = os.path.splitext(request.form['filename'])
        connectionId = request.form['connectionId']
        copyNumber = 0

        while True:
            copyPortion = f'-{copyNumber}' if copyNumber else ''
            urlPath = os.path.join(tipPath, f'{connectionId}-{base}{copyPortion}{extension}')
            writePath = os.path.join(publicPath, urlPath)
            if not os.path.isfile(writePath):
                with open(writePath, 'wb') as oFile:
                    oFile.write(file)

                break

            copyNumber += 1

        response = make_response(urlPath)
        response.mimetype = 'text/plain'

        return response
    
    @app.route('/api/approveTip', methods=['POST'])
    def approveTip():
        if 'tipId' not in request.form:
            return f'"tipId" is required', 400
        if 'newApproval' not in request.form:
            return f'"newApproval" is required', 400
        if 'adminKey' not in request.form or request.form['adminKey'] != tipsAdminKey:
            return 'error', 500
        
        newApproval = request.form['newApproval'].lower() == 'true'

        try:
            tips.approveTip(request.form['tipId'], newApproval)
        except:
            return traceback.format_exc(), 500

        return 'ok'

    @app.route('/api/deleteTip', methods=['POST'])
    def deleteTip():
        if 'tipId' not in request.form:
            return f'"tipId" is required', 400
        if 'adminKey' not in request.form or request.form['adminKey'] != tipsAdminKey:
            return 'error', 500

        try:
            tips.deleteTip(request.form['tipId'])
        except:
            return traceback.format_exc(), 500

        return 'ok'

    @app.route('/api/revertTipEdit', methods=['POST'])
    def revertTipEdit():
        if 'tipId' not in request.form:
            return f'"tipId" is required', 400
        if 'adminKey' not in request.form or request.form['adminKey'] != tipsAdminKey:
            return 'error', 500

        try:
            tips.revertEdit(request.form['tipId'])
        except:
            return traceback.format_exc(), 500

        return 'ok'

if sharingEnabled:
    @app.route('/playerState', methods=['POST'])
    @app.route('/api/playerState', methods=['POST'])
    def playerStatePost():
        try:
            state = request.json
        except:
            state = None

        if not state or 'settings' not in state or not validateJson(state['settings'], ['playerName', 'playerId']):
            return 'Invalid request', 400

        settings = state['settings']

        if 'eventName' in settings:
            eventName = settings['eventName']
            code = tryGetValue(settings, 'joinCode')
            permissions = sharing.authenticateEvent(eventName, code)

            if permissions:
                (join, view) = permissions

                if not join:
                    if code:
                        return 'Invalid joinCode', 403

                    return 'A joinCode is required', 401

        timestamp = sharing.writeState(settings['playerName']
                                    ,settings['playerId']
                                    ,tryGetValue(settings, 'eventName')
                                    ,json.dumps(state))

        return str(timestamp)

    @app.route("/api/playerLocation", methods=['POST'])
    def playerLocationPost():
        try:
            data = request.json
        except:
            data = None

        if not data:
            return json.dumps({'success': False, 'message': '"history" is required'}), 400

        for required in ('playerName', 'sessionId', 'history'):
            if required not in data:
                return json.dumps({ 'success': False, 'message': f'"{required}" is required' }), 400

        sharing.writeLocationHistory(data['playerName'], data['sessionId'], data['history'])

        return json.dumps({'success': True}), 200

    @app.route("/playerState", methods=['GET'])
    @app.route("/api/playerState", methods=['GET'])
    def playerStateGet():
        playerJson = request.args.get('players')
        if not playerJson:
            return "Player list is required", 400

        players = json.loads(playerJson)
        result = {}

        for playerName, data in players.items():
            playerResult = sharing.getState(playerName, data['timestamp'], data['delaySeconds'])
            result[playerName] = playerResult

        if len(players) == 1:
            playerName = next(iter(players))
            player = players[playerName]
            historyResult = sharing.getLocationHistory(playerName, player['locationTimestamp'], player['delaySeconds'])
            if historyResult:
                playerResult = result[playerName]

                if not playerResult:
                    playerResult = {}
                    result[playerName] = playerResult

                result[playerName]['locationHistory'] = historyResult

        return json.dumps(result)

    @app.route("/playerId", methods=['POST'])
    @app.route("/api/playerId", methods=['POST'])
    def playerId():
        if 'playerName' not in request.form:
            return "playerName is required", 400

        try:
            id = sharing.getPlayerId(request.form['playerName'])

            return str(id)
        except:
            return json.dumps({'error': f'{traceback.format_exc()}'})

    @app.route("/api/canJoinEvent", methods=['GET'])
    def canJoinEvent():
        eventName = request.args.get('eventName')
        code = request.args.get('joinCode')
        if not eventName or not code:
            return json.dumps({ 'error': "eventName and joinCode are required" }), 400

        (join, view) = sharing.authenticateEvent(eventName, code)

        return json.dumps(join)

    @app.route("/api/canViewEvent", methods=['GET'])
    def canViewEvent():
        eventName = request.args.get('eventName')
        code = request.args.get('viewCode')
        if not eventName or not code:
            return json.dumps({ 'error': "eventName and viewCode are required" }), 400

        (join, view) = sharing.authenticateEvent(eventName, code)

        return json.dumps(view)

    @app.route("/eventInfo", methods=['GET'])
    @app.route("/api/eventInfo", methods=['GET'])
    def eventInfo():
        eventName = request.args.get('eventName')
        if not eventName:
            return "eventName is required", 400

        try:
            event = sharing.eventInfo(eventName)

            return json.dumps(event)
        except:
            return renderTraceback()

    @app.route("/createEvent", methods=['POST'])
    @app.route("/api/createEvent", methods=['POST'])
    def createEvent():
        eventName = request.form['eventName']
        joinCode = request.form['joinCode']
        viewCode = request.form['viewCode']

        if (not eventName):
            return json.dumps({ 'error': "eventName is required" }), 400

        success = sharing.createEvent(eventName, joinCode, viewCode)

        return json.dumps(success)

    @app.route("/api/event", methods=['GET'])
    def event():
        try:
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

            return json.dumps({
                "flags": [x.__dict__ for x in flags],
                "args": args.__dict__,
                "defaultSettings": defaultSettings.__dict__,
                "local": app.config['local'],
                "graphicsOptions": LocalSettings.graphicsPacks(),
                "diskSettings": getDiskSettings(jsonify=False),
                "players": players,
                "eventName": eventName,
                "viewCode": viewCode,
                "joinCode": joinCode,
                "codeFailed": codeFailed,
            })
        except:
            return renderTraceback()

    def validateJson(json, keys):
        for key in keys:
            if not tryGetValue(json, key):
                return False
        
        return True

@app.route("/")
@app.route("/mapBroadcast")
@app.route("/itemsBroadcast")
@app.route("/event")
@app.route("/player/<string:fullPath>")
@app.route("/route/<path:filename>")
def vueRoot(fullPath=None):
    return send_from_directory("vue-dist", "index.html")

@app.route('/assets/<path:filename>')
def vueCatchall(filename):
    return send_from_directory('vue-dist/assets', filename)

@app.route('/<path:filename>')
def staticCatchall(filename):
    return app.send_static_file(filename)

@app.route("/api/init")
@app.route("/vueInit")
def vueInit():
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

    version = getVersion()
    remoteVersion = version

    if app.config['local']:
        remoteVersion = getRemoteVersion()
        if remoteVersion:
            remoteVersion = remoteVersion['magpie']

    return json.dumps({
        "flags": [x.__dict__ for x in flags],
        "args": args.__dict__,
        "defaultSettings": defaultSettings.__dict__,
        "jsonSettingsOverrides": settingsOverrides,
        "jsonArgsOverrides": argsOverrides,
        "local": app.config["local"],
        "graphicsOptions": LocalSettings.graphicsPacks(),
        "version": version['build'],
        "versionDisplay": version['version'],
        "remoteVersion": remoteVersion,
        "diskSettings": getDiskSettings(jsonify=False),
        "hostname": app.config["hostname"],
        "allowAutotracking": True,
        "allowMap": True,
        "allowItems": True,
        "players": [""],
        "broadcastMode": "send",
        "ndiEnabled": ndiEnabled,
    })
