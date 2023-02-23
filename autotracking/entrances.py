import os
import io
import sys
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

mapMap = {
    0x00: 0x01,
    0x01: 0x01,
    0x02: 0x01,
    0x03: 0x01,
    0x04: 0x01,
    0x05: 0x01,
    0x06: 0x02,
    0x07: 0x02,
    0x08: 0x02,
    0x09: 0x02,
    0x0A: 0x02,
    0x0B: 0x02,
    0x0C: 0x02,
    0x0D: 0x02,
    0x0E: 0x02,
    0x0F: 0x02,
    0x10: 0x02,
    0x11: 0x02,
    0x12: 0x02,
    0x13: 0x02,
    0x14: 0x02,
    0x15: 0x02,
    0x16: 0x02,
    0x17: 0x02,
    0x18: 0x02,
    0x19: 0x02,
    0x1D: 0x01,
    0x1E: 0x01,
    0x1F: 0x01,
    0xFF: 0x03,
}

roomAddress = 0xFFF6
mapIdAddress = 0xFFF7
indoorFlagAddress = 0xDBA5
entranceRoomOffset = 0xD800
screenCoordAddress = 0xFFFA

def loadEntrances(state, romData):
    addressOverrides = {
        0x312: 0xDDF2,
    }

    state.entrancesByTarget = {} 

    for name, info in ENTRANCE_INFO.items():
        alternateAddress = addressOverrides[info.target] if info.target in addressOverrides else None
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

        indoorAddress = entrance.indoorAddress or (entrance.indoorMap + entranceRoomOffset)

        indoorVisited = gb.readRamByte(indoorAddress) & 0x80
        outdoorVisited = gb.readRamByte(outdoorEntrance.outdoorRoom + entranceRoomOffset) & 0x80

        if indoorVisited and outdoorVisited and entrance.name in state.reverseEntranceMap:
            outdoorEntrance.map(entrance.name)

def readLocation(gb, state):
    indoors = gb.readRamByte(indoorFlagAddress)

    if indoors != state.indoors and state.indoors != None:
        state.indoorsChanged = True
    
    state.indoors = indoors

    mapId = gb.readRamByte(mapIdAddress)
    if mapId not in mapMap:
        print(f'Unknown map ID {hex(mapId)}')
        return

    mapDigit = mapMap[mapId] << 8 if indoors else 0
    state.lastRoom = state.room
    state.room = gb.readRamByte(roomAddress) + mapDigit

    oldX = state.screenX
    oldY = state.screenY

    coords = gb.readRamByte(screenCoordAddress)
    state.screenX = coords & 0x0F
    state.screenY = (coords & 0xF0) >> 4

    if (state.room != state.lastRoom):
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
