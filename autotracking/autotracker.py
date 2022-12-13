import asyncio
import websockets
import time
from gameboy import Gameboy
from items import *
from checks import *
from entrances import *

gb = Gameboy()

async def processMessages(socket):
    handshook = False

    while socket.messages:
        message = await socket.recv()

        print(f'Received: {message}')

        if message == 'sendFull':
            await sendItems(items, socket, diff=False, refresh=False)
            await sendChecks(checks, socket, diff=False, refresh=False)
            await sendEntrances([x for x in entrancesByName.values() if x.mappedIndoor != None], socket, diff=False, refresh=False)

            await Message('refresh', 'refresh').send(socket)

            handshook = True
    
    return handshook

def gameStateValid():
    return gb.readRamByte(gameStateAddress) in validGameStates

async def socketLoop(socket, path):
    print('Connected to tracker')

    handshook = False

    while True:
        await asyncio.sleep(0.4)

        if not gb.findEmulator():
            continue

        if not handshook:
            loadEntrances(gb)

        try:
            if not gameStateValid():
                continue

            readItems(gb)
            readChecks(gb)
            readEntrances(gb)

            handshook = await processMessages(socket) or handshook
            
            if handshook:
                await sendItems([x for x in items if x.diff != 0], socket)
                await sendChecks([x for x in checks if x.diff != 0], socket)
                await sendEntrances([x for x in entrancesByName.values() if x.changed], socket)
        except IOError:
            pass

async def main():
    loadChecks()
    async with websockets.serve(socketLoop, '127.0.0.1', 17026):
        await asyncio.Future()

asyncio.run(main())