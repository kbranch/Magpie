import os
import sys
from message import Message
from check import Check

# Deal with how pyinstaller's --onefile option packs things
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    sys.path.append(os.path.abspath('LADXR/'))
else:
    sys.path.append(os.path.abspath('../LADXR/'))

from checkMetadata import checkMetadataTable

checks = []

def loadChecks():
    checks.clear()

    maskOverrides = {
        '0x106': 0x20,
        '0x12B': 0x20,
        '0x15A': 0x20,
        '0x166': 0x20,
        '0x185': 0x20,
        '0x1E4': 0x20,
        '0x1BC': 0x20,
        '0x1E0': 0x20,
        '0x1E1': 0x20,
        '0x1E2': 0x20,
        '0x223': 0x20,
        '0x234': 0x20,
        '0x2A3': 0x20,
        '0x2FD': 0x20,
        '0x2A1-1': 0x20,
        '0x1F5': 0x06,
        '0x301-0': 0x10,
        '0x301-1': 0x10,
    }

    addressOverrides = {
        '0x30A-Owl': 0xDDEA,
        '0x30F-Owl': 0xDDEF,
        '0x308-Owl': 0xDDE8,
        '0x302': 0xDDE2,
        '0x306': 0xDDE6,
        '0x307': 0xDDE7,
        '0x308': 0xDDE8,
        '0x30F': 0xDDEF,
        '0x311': 0xDDF1,
        '0x314': 0xDDF4,
        '0x1F5': 0xDB7D,
        '0x301-0': 0xDDE1,
        '0x301-1': 0xDDE1,
        '0x223': 0xDA2E,
        '0x169': 0xD97C,
    }

    alternateAddresses = {
        '0x0F2': 0xD8B2,
    }

    blacklist = {'None', '0x2A1-2'}

    # in no dungeons boss shuffle, the d3 boss in d7 set 0x20 in fascade's room (0x1BC)
    # after beating evil eagile in D6, 0x1BC is now 0xAC (other things may have happened in between)
    # entered d3, slime eye flag had already been set (0x15A 0x20). after killing angler fish, bits 0x0C were set

    for check in [x for x in checkMetadataTable if x not in blacklist]:
        room = check.split('-')[0]
        mask = 0x10
        address = addressOverrides[check] if check in addressOverrides else 0xD800 + int(room, 16)

        if 'Trade' in check or 'Owl' in check:
            mask = 0x20

        if check in maskOverrides:
            mask = maskOverrides[check]
        
        checks.append(Check(check, address, mask, alternateAddresses[check] if check in alternateAddresses else None))

def readChecks(gb):
    for check in checks:
        bytes = [gb.readRamByte(check.address)]

        if check.alternateAddress != None:
            bytes.append(gb.readRamByte(check.alternateAddress))

        check.set(bytes)

async def sendChecks(checks, socket, diff=True, refresh=True):
    if not checks: return

    newMessage = Message('add' if diff else 'set', 'check', refresh)
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