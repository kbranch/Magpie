import os
import sys
from message import Message
from entrance import Entrance
from romTables import ROMWithTables
from worldSetup import WorldSetup

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

lastRoom = None
lastIndoors = None

foundEntranceMap = {}
reverseEntranceMap = {}
entrances = {}
world = None

async def sendEntrances(mappings, socket, diff=True):
    if not mappings: return

    newMessage = Message('add' if diff else 'set', 'entrance')
    newMessage.entranceMap = {}
    for outdoor, indoor in mappings.items():
        newMessage.entranceMap[outdoor] = indoor

        print(f'Sending entrance {outdoor}: {indoor}')
    
    await newMessage.send(socket)

def loadEntrances(gb):
    global foundEntranceMap, reverseEntranceMap, entrances, world

    entrances = {} 

    for name, info in ENTRANCE_INFO.items():
        entrance = Entrance(info.room, info.target, name)
        entrances[info.target] = entrance
    
    romData = gb.emulator.read_rom(0, 1024 * 1024)
    # Super janky, I need to make an LADXR pull request
    with open('rom', 'wb') as file:
        file.write(romData)
    
    rom = ROMWithTables('rom')

    os.remove('rom')

    world = WorldSetup()
    world.loadFromRom(rom)

    reverseEntranceMap = {value: key for key, value in world.entrance_mapping.items()}

def readEntrances(gb):
    global lastRoom, lastIndoors

    newMappings = {}

    indoors = gb.readRamByte(indoorFlagAddress)
    mapId = gb.readRamByte(mapIdAddress)
    if mapId not in mapMap:
        print(f'Unknown map ID {hex(mapId)}')
        return

    mapDigit = mapMap[mapId] << 8 if indoors else 0
    room = gb.readRamByte(roomAddress) + mapDigit

    if indoors != lastIndoors and lastRoom != None:
        indoorRoom = room if indoors else lastRoom

        if indoorRoom in entrances:
            entrance = entrances[indoorRoom]
            if entrance.name in reverseEntranceMap:
                outdoorEntranceName = reverseEntranceMap[entrance.name]
                if outdoorEntranceName not in foundEntranceMap:
                    newMappings[outdoorEntranceName] = entrance.name
                    print(f'Entrance found: {outdoorEntranceName}: {entrance.name}')

                foundEntranceMap[outdoorEntranceName] = entrance.name

    # if lastRoom != room:
    #     print(f"Current room: {hex(room)}")

    lastRoom = room
    lastIndoors = indoors

    return newMappings
