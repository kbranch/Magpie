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

async def processMessages(socket):
    handshook = False
    entrancesLoaded = False

    while socket.messages:
        messageText = await socket.recv()
        message = None

        try:
            message = json.loads(messageText)
        except Exception as e:
            print(f'Error parsing message: {traceback.format_exc()}')
            print(f'Message text: {messageText}')

        if message['type'] == 'sendFull':
            print("Received request to send everything")

            await sendItems(items, socket, diff=False, refresh=False)
            await sendChecks(checks, socket, diff=False, refresh=False)
            await sendEntrances([x for x in entrancesByName.values() if x.mappedIndoor != None], socket, diff=False, refresh=False)

            await Message('refresh', 'refresh').send(socket)

            handshook = True
        elif message['type'] == 'rom':
            print("Received ROM")

            romData = base64.b64decode(message['rom'])
            loadEntrances(romData)

            await sendRomAck(socket)
            await sendSettings(socket, romData)
            await sendSpoilerLog(socket, romData)

            entrancesLoaded = True
    
    return handshook, entrancesLoaded

async def sendRomRequest(socket):
    newMessage = Message('romRequest', 'romRequest', False)
    print(f'Sending request for ROM')
    
    await newMessage.send(socket)

async def sendRomAck(socket):
    newMessage = Message('romAck', 'romAck', False)
    print(f'Sending ROM ack')
    
    await newMessage.send(socket)

async def sendSettings(socket, romData):
    rom = ROM(data=romData)
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

    newMessage = Message('spoiler', 'spoiler', False)
    newMessage.log = logJson

    await newMessage.send(socket)

async def socketLoop(socket, path):
    print('Connected to tracker')

    handshook = False
    entrancesLoaded = False
    visitedEntrancesRead = False
    romRequested = False

    while True:
        await asyncio.sleep(0.4)

        if not gb.findEmulator():
            handshook = False
            continue

        if not entrancesLoaded and gb.canReadRom():
            romData = gb.readRom(0, 1024 * 1024)

            loadEntrances(romData)
            await sendRomAck(socket)
            await sendSettings(socket, romData)
            await sendSpoilerLog(socket, romData)

            entrancesLoaded = True

        extraItems = {}

        try:
            gb.snapshot()

            gameState = gb.readRamByte(gameStateAddress)
            if gameState not in validGameStates:
                continue

            if entrancesLoaded and not visitedEntrancesRead:
                readVisitedEntrances(gb)
                visitedEntrancesRead = True

            readChecks(gb, extraItems)
            readItems(gb, extraItems)

            if entrancesLoaded:
                readEntrances(gb)

            gotHandshake, gotEntrances = await processMessages(socket)

            handshook |= gotHandshake
            entrancesLoaded |= gotEntrances
            
            if handshook:
                if not gb.canReadRom() and not romRequested:
                    await sendRomRequest(socket)
                    romRequested = True

                await sendItems([x for x in items if x.diff != 0], socket)
                await sendChecks([x for x in checks if x.diff != 0], socket)
                await sendEntrances([x for x in entrancesByName.values() if x.changed], socket)
        except IOError:
            pass

async def main():
    loadChecks()
    async with websockets.serve(socketLoop, '127.0.0.1', 17026, max_size=1024*1024*10):
        await asyncio.Future()

asyncio.run(main())