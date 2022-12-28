import asyncio
import websockets
import os
import time
import json
import base64
import traceback
from gameboy import Gameboy
from items import *
from checks import *
from entrances import *
from spoilers import *
from rom import ROM

gb = Gameboy()

class State:
    def __init__(self):
        self.handshook = False
        self.entrancesLoaded = False
        self.visitedEntrancesRead = False
        self.romRequested = False
        self.features = set()
        self.sendFull = False

        self.items = []
        self.itemDict = {}

        self.checks = []

        self.lastRoom = None
        self.lastIndoors = None

        self.reverseEntranceMap = {}
        self.entrancesByTarget = {}
        self.entrancesByName = {}

    def needsRom(self):
        return 'entrances' in self.features or 'settings' in self.features or 'spoilers' in self.features

async def processMessages(socket, state):
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
            state.features = set(message['features'])
            state.sendFull = True

            state.handshook = True
        elif message['type'] == 'rom':
            print("Received ROM")

            romData = base64.b64decode(message['rom'])
            await parseRom(socket, romData, state)

            state.entrancesLoaded = True

async def sendTrackables(socket, state):
    if state.sendFull:
        if 'items' in state.features:
            await sendItems(state.items, socket, diff=False, refresh=False)
        if 'checks' in state.features:
            await sendChecks(state.checks, socket, diff=False, refresh=False)
        if 'entrances' in state.features:
            await sendEntrances([x for x in state.entrancesByName.values() if x.mappedIndoor != None], socket, diff=False, refresh=False)

        await Message('refresh', 'refresh').send(socket)

        state.sendFull = False
    else:
        if 'items' in state.features:
            await sendItems([x for x in state.items if x.diff != 0], socket)
        if 'checks' in state.features:
            await sendChecks([x for x in state.checks if x.diff != 0], socket)
        if 'entrances' in state.features:
            await sendEntrances([x for x in state.entrancesByName.values() if x.changed], socket)

async def sendRomRequest(socket):
    newMessage = Message('romRequest', 'romRequest', False)
    print(f'Sending request for ROM')
    
    await newMessage.send(socket)

async def sendRomAck(socket):
    newMessage = Message('romAck', 'romAck', False)
    print(f'Sending ROM ack')
    
    await newMessage.send(socket)

async def sendSettings(socket, romData):
    rom = ROM(io.BytesIO(romData))
    settings = rom.readShortSettings()

    if len(settings) == 0:
        print(f'Settings not found in ROM')
        return

    print(f'Sending settings string: {settings}')

    newMessage = Message('settings', 'settings', False)
    newMessage.settings = settings
    
    await newMessage.send(socket)

async def sendSpoilerLog(socket, romData):
    logJson = getSpoilerLog(romData)

    print('Sending spoiler log')

    newMessage = Message('spoiler', 'spoiler', False)
    newMessage.log = logJson

    await newMessage.send(socket)

async def parseRom(socket, romData, state):
    if 'entrances' in state.features:
        loadEntrances(state, romData)

    await sendRomAck(socket)

    if 'settings' in state.features:
        await sendSettings(socket, romData)
    if 'spoilers' in state.features:
        await sendSpoilerLog(socket, romData)

async def socketLoop(socket, path):
    print('Connected to tracker')

    state = State()
    loadItems(state)
    loadChecks(state)

    while True:
        await asyncio.sleep(0.4)

        if not gb.findEmulator():
            state.handshook = False
            continue

        if not state.entrancesLoaded and gb.canReadRom() and state.needsRom():
            romData = gb.readRom(0, 1024 * 1024)
            await parseRom(socket, romData, state)
            state.entrancesLoaded = True

        extraItems = {}

        try:
            await processMessages(socket, state)

            gb.snapshot()

            gameState = gb.readRamByte(gameStateAddress)
            if gameState not in validGameStates:
                continue

            if state.entrancesLoaded and not state.visitedEntrancesRead and 'entrances' in state.features:
                readVisitedEntrances(gb, state)
                state.visitedEntrancesRead = True

            if 'checks' in state.features:
                readChecks(gb, state, extraItems)
            if 'items' in state.features:
                readItems(gb, state, extraItems)

            if state.entrancesLoaded and 'entrances' in state.features:
                readEntrances(gb, state)
            
            if state.handshook:
                if not gb.canReadRom() and not state.romRequested and state.needsRom():
                    await sendRomRequest(socket)
                    state.romRequested = True

                await sendTrackables(socket, state)
        except IOError:
            pass

async def main():
    async with websockets.serve(socketLoop, '127.0.0.1', 17026, max_size=1024*1024*10):
        await asyncio.Future()

asyncio.run(main())