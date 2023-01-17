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

        self.items = []
        self.itemDict = {}

        self.checks = []

        self.room = None
        self.indoors = None
        self.indoorsChanged = False
        self.lastRoom = None
        self.screenX = None
        self.screenY = None
        self.locationChanged = False

        self.reverseEntranceMap = {}
        self.entrancesByTarget = {}
        self.entrancesByName = {}

    def needsRom(self):
        return 'entrances' in self.features or 'settings' in self.features or 'spoilers' in self.features

    async def parseRom(self, socket, romData):
        if 'entrances' in self.features:
            loadEntrances(self, romData)

        await sendRomAck(socket)

        if 'settings' in self.features:
            await sendSettings(socket, romData)
        if 'spoilers' in self.features:
            await sendSpoilerLog(socket, romData)
        if 'gfx' in self.features:
            self.gfx = getGfx(romData[0xB0000:0xB0040])
            self.gfxChanged = True
            await sendGfx(socket, self)

    async def processMessages(self, socket):
        while socket.messages:
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
                self.sendFull = True

                self.handshook = True
            elif message['type'] == 'rom':
                print("Received ROM")

                romData = base64.b64decode(message['rom'])
                await self.parseRom(socket, romData)

                self.entrancesLoaded = True

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
            if 'gfx' in self.features:
                await sendGfx(socket, self)

            await Message('refresh', 'refresh').send(socket)

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
        if self.entrancesLoaded and not self.visitedEntrancesRead and 'entrances' in self.features:
            readVisitedEntrances(gb, self)
            self.visitedEntrancesRead = True

        extraItems = {}

        if 'checks' in self.features:
            readChecks(gb, self, extraItems)
        if 'items' in self.features:
            readItems(gb, self, extraItems)
        if 'gfx' in self.features:
            newGfx = getGfx(gb.gfxSnapshot)
            if newGfx != self.gfx:
                self.gfx = newGfx
                self.gfxChanged = True
        
        readLocation(gb, self)

        if self.entrancesLoaded and 'entrances' in self.features:
            readEntrances(gb, self)