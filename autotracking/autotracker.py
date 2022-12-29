import asyncio
import traceback
import websockets
from gameboy import Gameboy
from items import *
from checks import *
from entrances import *
from romContents import *
from messages import *
from state import State

gb = Gameboy()

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
            await state.parseRom(socket, romData)
            state.entrancesLoaded = True

        try:
            await state.processMessages(socket)

            gb.snapshot()

            gameState = gb.readRamByte(gameStateAddress)
            if gameState not in validGameStates:
                continue

            state.readTrackables(gb)
            
            if state.handshook:
                if not gb.canReadRom() and not state.romRequested and state.needsRom():
                    await sendRomRequest(socket)
                    state.romRequested = True

                await state.sendTrackables(socket)
        except Exception as e:
            print(f'Error: {traceback.format_exc()}')

async def main():
    async with websockets.serve(socketLoop, '127.0.0.1', 17026, max_size=1024*1024*10):
        await asyncio.Future()

asyncio.run(main())