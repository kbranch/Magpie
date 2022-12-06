import asyncio
import websockets
import evilemu
from items import *
from checks import *
from message import Message

async def sendItems(items, socket, diff=True):
    if not items: return

    newMessage = Message('add' if diff else 'set', 'item')
    for item in items:
        value = item.diff if diff else item.value

        newMessage.items.append(
            {
                'id': item.id,
                'qty': value,
            }
        )

        print(f'Sending {item.id}: {"+" if value > 0 and diff else ""}{item.diff}')
        item.diff = 0
    
    await newMessage.send(socket)

async def sendChecks(checks, socket, diff=True):
    if not checks: return

    newMessage = Message('add' if diff else 'set', 'check')
    for check in checks:
        value = check.diff if diff else check.value
        
        newMessage.items.append(
            {
                'id': check.id,
                'qty': value,
            }
        )

        print(f'Sending {check.id}: {"+" if value > 0 and diff else ""}{value}')
        check.diff = 0
    
    await newMessage.send(socket)

async def processMessages(socket):
    handshook = False

    while socket.messages:
        message = await socket.recv()

        print(f'Received: {message}')

        if message == 'sendFull':
            await sendItems(items, socket, diff=False)
            await sendChecks(checks, socket, diff=False)

            handshook = True
    
    return handshook

async def findEmulator():
    for emulator in evilemu.find_gameboy_emulators():
        return emulator

def readRamByte(gb, address):
    return gb.read_ram8(address - 0xC000)

async def socketLoop(socket, path):
    print('Connected to tracker')

    handshook = False

    while True:
        gb = await findEmulator()

        if gb == None:
            await asyncio.sleep(1)
            continue

        try:
            gameState = readRamByte(gb, gameStateAddress)
            if gameState not in validGameStates:
                continue
            
            missingItems = {x for x in items if x.address == None}

            # Main inventory items
            for i in range(inventoryStartAddress, inventoryEndAddress):
                value = readRamByte(gb, i)

                if value in inventoryItemIds:
                    item = itemDict[inventoryItemIds[value]]
                    await item.set(1)
                    missingItems.remove(item)
            
            for item in missingItems:
                await item.set(0)
            
            # All other items
            for item in [x for x in items if x.address]:
                await item.set(readRamByte(gb, item.address))

            # Checks
            for check in checks:
                await check.set(readRamByte(gb, check.address))

            handshook = handshook or await processMessages(socket)
            
            if handshook:
                await sendItems([x for x in items if x.diff != 0], socket)
                await sendChecks([x for x in checks if x.diff != 0], socket)
        except IOError:
            pass

        await asyncio.sleep(1)

async def main():
    loadChecks()
    async with websockets.serve(socketLoop, '127.0.0.1', 17026):
        await asyncio.Future()

asyncio.run(main())