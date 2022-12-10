import asyncio
import websockets
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
            await sendItems(items, socket, diff=False)
            await sendChecks(checks, socket, diff=False)
            await sendEntrances(foundEntranceMap, socket, diff=False)

            handshook = True
    
    return handshook

def gameStateValid():
    return gb.readRamByte(gameStateAddress) in validGameStates

async def socketLoop(socket, path):
    print('Connected to tracker')

    handshook = False

    while True:
        await asyncio.sleep(1)

        if not gb.findEmulator():
            continue

        if world == None:
            loadEntrances(gb)

        try:
            if not gameStateValid():
                continue

            readItems(gb)
            readChecks(gb)
            newEntrances = readEntrances(gb)

            handshook = await processMessages(socket) or handshook
            
            if handshook:
                await sendItems([x for x in items if x.diff != 0], socket)
                await sendChecks([x for x in checks if x.diff != 0], socket)
                await sendEntrances(newEntrances, socket)
        except IOError:
            pass

async def main():
    loadChecks()
    async with websockets.serve(socketLoop, '127.0.0.1', 17026):
        await asyncio.Future()

asyncio.run(main())