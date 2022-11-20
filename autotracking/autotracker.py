import asyncio
import websockets
import json
from memory import Gameboy
from items import *

class Message:
    def __init__(self, type):
        self.type = type
        self.items = []
    
    async def send(self, socket):
        await socket.send(json.dumps(self.__dict__))

async def socketLoop(websocket, path):
    print('Connected to tracker')

    while True:
        await asyncio.sleep(2)

        if not gb.attached():
            gb.attach()
            if not gb.attached():
                continue

        try:
            if gb.memread(gameStateAddress) not in validGameStates:
                continue
                
            missingItems = {x for x in items if x.address == None}

            # Main inventory items
            for i in range(inventoryStartAddress, inventoryEndAddress):
                value = gb.memread(i)
                if value in inventoryItemIds:
                    item = itemDict[inventoryItemIds[value]]
                    await item.set(1, websocket)
                    missingItems.remove(item)
            
            for item in missingItems:
                await item.set(0, websocket)
            
            # All other items
            for item in [x for x in items if x.address]:
                await item.set(gb.memread(item.address), websocket)
        except ValueError:
            gb.detach()
        
        while websocket.messages:
            message = await websocket.recv()
            print(f'Received: {message}')
            if message == 'sendFull':
                newMessage = Message('set')
                for item in items:
                    newMessage.items.append(
                    {
                        'name': item.id,
                        'qty': item.value,
                    })
                
                await newMessage.send(websocket)

gb = Gameboy()

async def main():
    async with websockets.serve(socketLoop, '127.0.0.1', 17026):
        await asyncio.Future()

asyncio.run(main())