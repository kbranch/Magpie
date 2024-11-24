import os
import asyncio
import requests
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

async def socketLoop(socket):
    print('Connected to tracker')
    state = State()
    loadItems(state)
    loadChecks(state)

    seed = None

    while True:
        await asyncio.sleep(0.1)

        if not gb.findEmulator():
            state.romRequested = False
            continue

        if gb.canReadRom() and state.features:
            newSeed = readSeed(gb)
            if seed != newSeed:
                print(f'Loading ROM for seed {newSeed}')
                romData = gb.readRom(0, 1024 * 1024)
                await state.parseRom(socket, romData)
                state.entrancesLoaded = True
            
            seed = newSeed

        try:
            await state.processMessages(socket)

            try:
                gb.snapshot()
            except Exception as e:
                stackTrace = traceback.format_exc()
                print(f'Error: {stackTrace}')

                await sendMessage({
                    'type': 'error',
                    'source': 'snapshot',
                    'message': 'Error reading emulator memory',
                    'stackTrace': stackTrace,
                }, socket, refresh=False)

                continue

            gameState = gb.readRamByte(consts.gameStateAddress)
            if gameState not in consts.validGameStates:
                if gameState <= 2:
                    state.saveAndQuit()

                continue

            state.readTrackables(gb)
            
            if state.handshook:
                if not gb.canReadRom() and not state.romRequested and state.needsRom():
                    await sendRomRequest(socket)
                    state.romRequested = True

                await state.sendTrackables(socket)
        except Exception as e:
            stackTrace = traceback.format_exc()
            print(f'Error: {stackTrace}')

            await sendMessage({
                'type': 'error',
                'source': 'main loop',
                'message': 'Unknown error',
                'stackTrace': stackTrace,
            }, socket, refresh=False)

            return

def getRemoteVersion():
    try:
        headers = {'User-Agent': 'Magpie'}
        request = requests.get('https://magpietracker.us/api/version', headers=headers)
        return json.loads(request.text)
    except:
        return None

def getVersion():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'autotracker-version')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return 'unknown'

async def main():
    version = getVersion()
    print(f'Autotracker version {version}, protocol {protocolVersion}')

    remote = getRemoteVersion()
    if remote:
        if remote['autotracker'] != version or remote['api'] != protocolVersion:
            print(f'Latest version is {remote["autotracker"]}, protocol {remote["api"]}')
        else:
            print("No update available")
    else:
        print("Unable to check for updates")

    print('\nListening for tracker')
    async with websockets.serve(socketLoop, host=None, port=17026, max_size=1024*1024*10):
        await asyncio.Future()

asyncio.run(main())
