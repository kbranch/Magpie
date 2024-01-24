import os
import io
import sys
import time
import consts
from entrance import Entrance, EntranceCoord

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
        state.entrancesByTarget[info.room] = entrance
        state.entrancesByName[name] = entrance

        insideEntrance = Entrance(info.target, info.room, f"{name}:inside", alternateAddress)
        state.entrancesByTarget[info.target] = insideEntrance
        state.entrancesByName[f"{name}:inside"] = insideEntrance
    
    rom = ROMWithTables(io.BytesIO(romData))

    world = WorldSetup()
    world.loadFromRom(rom)

    state.reverseEntranceMap = {value: key for key, value in world.entrance_mapping.items()}
    state.entranceMap = world.entrance_mapping

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
    transitionSequence = gb.readRamByte(consts.transitionSequence)
    motionState = gb.readRamByte(consts.linkMotionState)
    if (transitionState != 0
        or transitionTargetX != transitionScrollX
        or transitionTargetY != transitionScrollY
        or transitionSequence != 0x04):
        return

    indoors = gb.readRamByte(consts.indoorFlag)

    if indoors != state.indoors and state.indoors != None:
        state.indoorsChanged = True

    state.indoors = indoors
    
    spawnMap = gb.readRamByte(consts.spawnMap)
    mapDigit = consts.mapMap[spawnMap] << 8 if state.spawnMap else 0
    spawnRoom = gb.readRamByte(consts.spawnRoom) + mapDigit
    spawnX = gb.readRamByte(consts.spawnX)
    spawnY = gb.readRamByte(consts.spawnY)

    if ((spawnRoom != state.spawnRoom and state.spawnRoom != None)
        or (spawnMap != state.spawnMap and state.spawnMap != None)
        or (spawnX != state.spawnX and state.spawnX != None)
        or (spawnY != state.spawnY and state.spawnY != None)):
        state.spawnChanged = True
        state.spawnSameFor = 0
    else:
        state.spawnSameFor += 1
    
    state.spawnMap = spawnMap
    state.spawnRoom = spawnRoom
    state.spawnX = spawnX
    state.spawnY = spawnY

    mapId = gb.readRamByte(consts.mapId)
    if mapId not in consts.mapMap:
        print(f'Unknown map ID {hex(mapId)}')
        return

    mapDigit = consts.mapMap[mapId] << 8 if indoors else 0
    state.lastRoom = state.room
    state.room = gb.readRamByte(consts.room) + mapDigit

    if state.lastRoom != state.room:
        state.roomSameFor = 0
        state.roomChanged = True
        state.lastDifferentRoom = state.lastRoom
    else:
        state.roomSameFor += 1

    if motionState in [0, 1]:
        oldX = state.screenX
        oldY = state.screenY

        coords = gb.readRamByte(consts.screenCoord)
        state.screenX = coords & 0x0F
        state.screenY = (coords & 0xF0) >> 4

        if (state.room != state.lastRoom
            or oldX != state.screenX
            or oldY != state.screenY):
            state.locationChanged = True

def readEntrances(gb, state):
    if not state.lastDifferentRoom:
        return

    if state.spawnChanged and state.spawnSameFor > 0 and state.roomSameFor > 0:
        spawnCoord = EntranceCoord(None, state.spawnRoom, state.spawnX, state.spawnY)
        if str(spawnCoord) in consts.entranceLookup:
            validSources = {x.name for x in consts.entranceCoords if x.room == state.lastDifferentRoom}
            destEntrance = consts.entranceLookup[str(spawnCoord)].name
            sourceEntrance = [x for x in state.entranceMap if state.entranceMap[x] == destEntrance and x in validSources]

            if sourceEntrance:
                state.entrancesByName[sourceEntrance[0]].map(destEntrance)

        print(f'{time.time()} {hex(state.spawnRoom)} {state.spawnX}, {state.spawnY}\n')
        
        state.spawnChanged = False
    elif state.roomChanged and state.roomSameFor > 0:
        print(f'{time.time()} {hex(state.room)}, {hex(state.lastDifferentRoom)}\n')

        # Check for the stupid sidescroller rooms that don't set your spawn point

        if state.lastDifferentRoom in consts.sidescrollerRooms:
            sourceEntrance = consts.sidescrollerRooms[state.lastDifferentRoom]
            destEntrance = state.entranceMap[sourceEntrance]

            expectedRoom = state.entrancesByName[destEntrance].outdoorRoom
            if destEntrance.endswith(":indoor"):
                expectedRoom = state.entrancesByName[destEntrance].indoorMap
            
            if expectedRoom == state.room:
                state.entrancesByName[sourceEntrance].map(destEntrance)

        if state.room in consts.sidescrollerRooms:
            validSources = {x.name for x in consts.entranceCoords if x.room == state.lastDifferentRoom}
            destEntrance = consts.sidescrollerRooms[state.room]
            sourceEntrance = [x for x in state.entranceMap if state.entranceMap[x] == destEntrance and x in validSources]

            if sourceEntrance:
                state.entrancesByName[sourceEntrance[0]].map(destEntrance)
        
        state.roomChanged = False

