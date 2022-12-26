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

class Flags:
    def __init__(self):
        self.handshook = False
        self.entrancesLoaded = False
        self.visitedEntrancesRead = False
        self.romRequested = False
        self.features = set()
        self.sendFull = False

    def needsRom(self):
        return 'entrances' in self.features or 'settings' in self.features or 'spoilers' in self.features

async def processMessages(socket, flags):
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
            flags.features = set(message['features'])
            flags.sendFull = True

            flags.handshook = True
        elif message['type'] == 'rom':
            print("Received ROM")

            romData = base64.b64decode(message['rom'])
            await parseRom(socket, romData, flags)

            flags.entrancesLoaded = True

async def sendTrackables(socket, flags):
    if flags.sendFull:
        if 'items' in flags.features:
            await sendItems(items, socket, diff=False, refresh=False)
        if 'checks' in flags.features:
            await sendChecks(checks, socket, diff=False, refresh=False)
        if 'entrances' in flags.features:
            await sendEntrances([x for x in entrancesByName.values() if x.mappedIndoor != None], socket, diff=False, refresh=False)

        await Message('refresh', 'refresh').send(socket)

        flags.sendFull = False
    else:
        if 'items' in flags.features:
            await sendItems([x for x in items if x.diff != 0], socket)
        if 'checks' in flags.features:
            await sendChecks([x for x in checks if x.diff != 0], socket)
        if 'entrances' in flags.features:
            await sendEntrances([x for x in entrancesByName.values() if x.changed], socket)

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

async def parseRom(socket, romData, flags):
    if 'entrances' in flags.features:
        loadEntrances(romData)

    await sendRomAck(socket)

    if 'settings' in flags.features:
        await sendSettings(socket, romData)
    if 'spoilers' in flags.features:
        await sendSpoilerLog(socket, romData)

async def socketLoop(socket, path):
    print('Connected to tracker')

    flags = Flags()

    while True:
        await asyncio.sleep(0.4)

        if not gb.findEmulator():
            flags.handshook = False
            continue

        if not flags.entrancesLoaded and gb.canReadRom() and flags.needsRom():
            romData = gb.readRom(0, 1024 * 1024)
            await parseRom(socket, romData)
            flags.entrancesLoaded = True

        extraItems = {}

        try:
            await processMessages(socket, flags)

            gb.snapshot()

            gameState = gb.readRamByte(gameStateAddress)
            if gameState not in validGameStates:
                continue

            if flags.entrancesLoaded and not flags.visitedEntrancesRead and 'entrances' in flags.features:
                readVisitedEntrances(gb)
                flags.visitedEntrancesRead = True

            if 'checks' in flags.features:
                readChecks(gb, extraItems)
            if 'items' in flags.features:
                readItems(gb, extraItems)

            if flags.entrancesLoaded and 'entrances' in flags.features:
                readEntrances(gb)
            
            if flags.handshook:
                if not gb.canReadRom() and not flags.romRequested and flags.needsRom():
                    await sendRomRequest(socket)
                    flags.romRequested = True

                await sendTrackables(socket, flags)
        except IOError:
            pass

async def main():
    loadChecks()
    async with websockets.serve(socketLoop, '127.0.0.1', 17026, max_size=1024*1024*10):
        await asyncio.Future()

asyncio.run(main())