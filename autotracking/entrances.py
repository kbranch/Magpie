import os
import io
import sys
import consts
from entrance import Entrance

# Deal with how pyinstaller's --onefile option packs things
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    sys.path.append(os.path.abspath('LADXR/'))
else:
    sys.path.append(os.path.abspath('../LADXR/'))

from entranceInfo import ENTRANCE_INFO
from romTables import ROMWithTables
import logic
from worldSetup import WorldSetup


def loadEntrances(state, romData):
    state.entrancesByTarget = {} 
    state.entrancesByName = {} 

    for name, info in ENTRANCE_INFO.items():
        alternateAddress = consts.entranceAddressOverrides[info.target] if info.target in consts.entranceAddressOverrides else None
        entrance = Entrance(info.room, info.target, name, alternateAddress)
        state.entrancesByTarget[info.target] = entrance
        state.entrancesByName[name] = entrance
    
    rom = ROMWithTables(io.BytesIO(romData))

    world = WorldSetup()
    world.loadFromRom(rom)

    state.reverseEntranceMap = {value: key for key, value in world.entrance_mapping.items()}

def readVisitedEntrances(gb, state):
    for entrance in state.entrancesByTarget.values():
        if entrance.name not in state.reverseEntranceMap:
            continue

        outdoorName = state.reverseEntranceMap[entrance.name]
        outdoorEntrance = state.entrancesByName[outdoorName]

        indoorAddress = entrance.indoorAddress or (entrance.indoorMap + consts.entranceRoomOffset)

        indoorVisited = gb.readRamByte(indoorAddress) & 0x80
        outdoorVisited = gb.readRamByte(outdoorEntrance.outdoorRoom + consts.entranceRoomOffset) & 0x80

        if indoorVisited and outdoorVisited and entrance.name in state.reverseEntranceMap:
            outdoorEntrance.map(entrance.name)
            print(f"Found visited entrance: {outdoorEntrance.name} = {entrance.name}")

def readLocation(gb, state):
    transitionState = gb.readRamByte(consts.transitionState)
    transitionTargetX = gb.readRamByte(consts.transitionTargetX)
    transitionTargetY = gb.readRamByte(consts.transitionTargetY)
    transitionScrollX = gb.readRamByte(consts.transitionScrollX)
    transitionScrollY = gb.readRamByte(consts.transitionScrollY)
    if (transitionState != 0
        or transitionTargetX != transitionScrollX
        or transitionTargetY != transitionScrollY):
        return

    indoors = gb.readRamByte(consts.indoorFlag)

    if indoors != state.indoors and state.indoors != None:
        state.indoorsChanged = True
    
    state.indoors = indoors

    mapId = gb.readRamByte(consts.mapId)
    if mapId not in consts.mapMap:
        print(f'Unknown map ID {hex(mapId)}')
        return

    mapDigit = consts.mapMap[mapId] << 8 if indoors else 0
    state.lastRoom = state.room
    oldX = state.screenX
    oldY = state.screenY
    state.room = gb.readRamByte(consts.room) + mapDigit

    coords = gb.readRamByte(consts.screenCoord)
    state.screenX = coords & 0x0F
    state.screenY = (coords & 0xF0) >> 4

    if (state.room != state.lastRoom
        or oldX != state.screenX
        or oldY != state.screenY):
        state.locationChanged = True

def readEntrances(gb, state):
    if state.indoorsChanged:
        indoorRoom = state.room if state.indoors else state.lastRoom

        if indoorRoom in state.entrancesByTarget:
            entrance = state.entrancesByTarget[indoorRoom]
            if entrance.name in state.reverseEntranceMap:
                outdoorEntranceName = state.reverseEntranceMap[entrance.name]
                state.entrancesByName[outdoorEntranceName].map(entrance.name)
        
        state.indoorsChanged = False
