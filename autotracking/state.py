import json
import base64
import traceback
from items import *
from checks import *
from entrances import *
from messages import *

class State:
    def __init__(self):
        self.handshook = False
        self.entrancesLoaded = False
        self.visitedEntrancesRead = False
        self.romRequested = False
        self.features = set()
        self.sendFull = False
        self.locationChanged = False
        self.gfx = None
        self.gfxChanged = False
        self.firstRead = True

        self.items = []
        self.itemDict = {}

        self.checks = []

        self.settings = {}

        self.room = None
        self.roomChanged = False
        self.roomSameFor = 0
        self.indoors = None
        self.indoorsChanged = False
        self.spawnRoom = None
        self.spawnMap = None
        self.spawnX = None
        self.spawnY = None
        self.spawnChanged = False
        self.spawnSameFor = 0
        self.lastRoom = None
        self.lastDifferentRoom = None
        self.screenX = None
        self.screenY = None
        self.locationChanged = False

        self.reverseEntranceMap = {}
        self.entrancesByTarget = {}
        self.entrancesByName = {}

    def saveAndQuit(self):
        self.room = None
        self.roomChanged = False
        self.roomSameFor = 0
        self.indoors = None
        self.indoorsChanged = False
        self.spawnRoom = None
        self.spawnMap = None
        self.spawnX = None
        self.spawnY = None
        self.spawnChanged = False
        self.spawnSameFor = 0
        self.lastRoom = None
        self.lastDifferentRoom = None
        self.screenX = None
        self.screenY = None
        self.locationChanged = False

    def needsRom(self):
        return 'entrances' in self.features or 'settings' in self.features or 'spoilers' in self.features

    async def parseRom(self, socket, romData):
        self.visitedEntrancesRead = False

        if 'entrances' in self.features:
            try:
                loadEntrances(self, romData)
            except Exception as e:
                print(f'Error parsing message: {traceback.format_exc()}')
                print('Disabling entrance tracking')
                self.features.remove('entrances')

        if 'settings' in self.features:
            settingsString = getSettingsString(romData)

            if len(settingsString) == 0:
                print(f'Settings not found in ROM')
                self.settings = lambda: None
            else:
                await sendSettings(socket, settingsString)
                self.settings = loadSettings(settingsString)

            if not romData[0x134:0x143].startswith(b'LADXR'):
                self.settings.archipelago = True

        if 'spoilers' in self.features:
            await sendSpoilerLog(socket, romData)
        if 'gfx' in self.features:
            self.gfx = getGfx(romData[consts.gfxStart:consts.gfxStart + consts.gfxHashSize])
            self.gfxChanged = True
            await sendGfx(socket, self)

        await sendRomAck(socket, "Archipelago" if self.isArchipelago() else "LADXR")

    async def processMessages(self, socket):
        while len(socket.recv_messages.frames):
            messageText = await socket.recv()
            message = None

            try:
                message = json.loads(messageText)
            except Exception as e:
                print(f'Error parsing message: {traceback.format_exc()}')
                print(f'Message text: {messageText}')

            if message['type'] == 'handshake':
                print("Received handshake request")
                self.features = set(message['features'])
                if 'flags' in message:
                    self.flags = message['flags']
                else:
                    self.flags = {}

                print(f"Features: {self.features}")

                await sendMessage({
                    'type': 'handshAck',
                    'version': protocolVersion,
                    'name': 'magpie-autotracker',
                }, socket)

                self.handshook = True
            elif message['type'] == 'rom':
                print("Received ROM")

                romData = base64.b64decode(message['rom'])
                await self.parseRom(socket, romData)

                self.entrancesLoaded = True
            elif message['type'] == 'sendFull':
                self.sendFull = True

    async def sendTrackables(self, socket):
        if self.sendFull:
            if 'items' in self.features:
                await sendItems(self.items, socket, diff=False, refresh=False)
            if 'checks' in self.features:
                await sendChecks(self.checks, socket, diff=False, refresh=False)
            if 'entrances' in self.features:
                await sendEntrances([x for x in self.entrancesByName.values() if x.mappedIndoor != None], socket, diff=False, refresh=False)
            if 'gps' in self.features:
                await sendLocation(self, socket)
            if 'gfx' in self.features and self.gfx != None:
                await sendGfx(socket, self)

            await sendMessage({
                'type': 'refresh',
            }, socket)

            self.sendFull = False
        else:
            if 'items' in self.features:
                await sendItems([x for x in self.items if x.diff != 0], socket)
            if 'checks' in self.features:
                await sendChecks([x for x in self.checks if x.diff != 0], socket)
            if 'entrances' in self.features:
                await sendEntrances([x for x in self.entrancesByName.values() if x.changed], socket)
            if 'gps' in self.features and self.locationChanged:
                await sendLocation(self, socket)
            if 'gfx' in self.features and self.gfxChanged:
                await sendGfx(socket, self)

        self.locationChanged = False

    def readTrackables(self, gb):
        isReadableER = False

        try:
            if (self.isArchipelago()
                or self.settings.entranceshuffle in ('', 'simple', 'split', 'mixed')
                or self.settings.dungeonshuffle
                or self.settings.randomstartlocation
                ):
                isReadableER = True
        except:
            pass
        
        if (self.entrancesLoaded
            and not self.visitedEntrancesRead
            and 'entrances' in self.features
            and isReadableER):
            readVisitedEntrances(gb, self)
            self.visitedEntrancesRead = True

        extraItems = {}

        # A small subset of checks still gets read when the checks feature is off
        readChecks(gb, self, extraItems)

        if 'items' in self.features:
            readItems(gb, self, extraItems)
        if 'gfx' in self.features and gb.canReadRom():
            newGfx = getGfx(gb.gfxSnapshot)
            if newGfx != self.gfx:
                self.gfx = newGfx
                self.gfxChanged = True
        
        readLocation(gb, self)

        if self.entrancesLoaded and 'entrances' in self.features:
            readEntrances(gb, self)
    
    def isArchipelago(self):
        isArchipelago = False

        try:
            self.settings.archipelago == True
            isArchipelago = True
        except:
            pass

        return isArchipelago
