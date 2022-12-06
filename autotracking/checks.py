import os
import sys
from check import Check

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
    }

    blacklist = {'None', '0x2A1-2'}

    for check in [x for x in checkMetadataTable if x not in blacklist]:
        room = check.split('-')[0]
        mask = 0x10
        address = addressOverrides[check] if check in addressOverrides else 0xD800 + int(room, 16)

        if 'Trade' in check or 'Owl' in check:
            mask = 0x20

        if check in maskOverrides:
            mask = maskOverrides[check]
        
        checks.append(Check(check, address, mask))
