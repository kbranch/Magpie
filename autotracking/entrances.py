import os
import sys
from message import Message
from entrance import Entrance
from romTables import ROMWithTables
from worldSetup import WorldSetup

# Deal with how pyinstaller's --onefile option packs things
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    sys.path.append(os.path.abspath('LADXR/'))
else:
    sys.path.append(os.path.abspath('../LADXR/'))

from entranceInfo import ENTRANCE_INFO

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

lastRoom = None
lastIndoors = None

reverseEntranceMap = {}
entrancesByTarget = {}
entrancesByName = {}

async def sendEntrances(entrances, socket, diff=True, refresh=True):
    if not entrances: return

    newMessage = Message('add' if diff else 'set', 'entrance', refresh)
    newMessage.entranceMap = {}
    for entrance in entrances:
        newMessage.entranceMap[entrance.name] = entrance.mappedIndoor
        entrance.changed = False

        print(f'Sending entrance {entrance.name}: {entrance.mappedIndoor}')
    
    await newMessage.send(socket)

def loadEntrances(romData):
    global reverseEntranceMap, entrancesByTarget

    addressOverrides = {
        0x312: 0xDDF2,
    }

    entrancesByTarget = {} 

    for name, info in ENTRANCE_INFO.items():
        alternateAddress = addressOverrides[info.target] if info.target in addressOverrides else None
        entrance = Entrance(info.room, info.target, name, alternateAddress)
        entrancesByTarget[info.target] = entrance
        entrancesByName[name] = entrance

    # Super janky, I need to make an LADXR pull request
    with open('rom', 'wb') as file:
        file.write(romData)
    
    rom = ROMWithTables('rom')

    os.remove('rom')

    world = WorldSetup()
    world.loadFromRom(rom)

    reverseEntranceMap = {value: key for key, value in world.entrance_mapping.items()}

def readVisitedEntrances(gb):
    for entrance in entrancesByTarget.values():
        if entrance.name not in reverseEntranceMap:
            continue

        outdoorName = reverseEntranceMap[entrance.name]
        outdoorEntrance = entrancesByName[outdoorName]

        indoorAddress = entrance.indoorAddress or (entrance.indoorMap + entranceRoomOffset)

        indoorVisited = gb.readRamByte(indoorAddress) & 0x80
        outdoorVisited = gb.readRamByte(outdoorEntrance.outdoorRoom + entranceRoomOffset) & 0x80

        if indoorVisited and outdoorVisited and entrance.name in reverseEntranceMap:
            outdoorEntrance.map(entrance.name)

def readEntrances(gb):
    global lastIndoors, lastRoom

    indoors = gb.readRamByte(indoorFlagAddress)

    mapId = gb.readRamByte(mapIdAddress)
    if mapId not in mapMap:
        print(f'Unknown map ID {hex(mapId)}')
        return

    mapDigit = mapMap[mapId] << 8 if indoors else 0
    room = gb.readRamByte(roomAddress) + mapDigit

    if indoors != lastIndoors and lastIndoors != None:
        indoorRoom = room if indoors else lastRoom

        if indoorRoom in entrancesByTarget:
            entrance = entrancesByTarget[indoorRoom]
            if entrance.name in reverseEntranceMap:
                outdoorEntranceName = reverseEntranceMap[entrance.name]
                entrancesByName[outdoorEntranceName].map(entrance.name)

    lastRoom = room
    lastIndoors = indoors
