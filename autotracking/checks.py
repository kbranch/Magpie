import os
import sys
import consts
from check import Check

# Deal with how pyinstaller's --onefile option packs things
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    sys.path.append(os.path.abspath('LADXR/'))
else:
    sys.path.append(os.path.abspath('../LADXR/'))

from checkMetadata import checkMetadataTable

def loadChecks(state):
    # in no dungeons boss shuffle, the d3 boss in d7 set 0x20 in fascade's room (0x1BC)
    # after beating evil eagile in D6, 0x1BC is now 0xAC (other things may have happened in between)
    # entered d3, slime eye flag had already been set (0x15A 0x20). after killing angler fish, bits 0x0C were set

    for check in [x for x in checkMetadataTable if x not in consts.checkBlacklist]:
        room = check.split('-')[0]
        mask = consts.defaultCheckFlag
        address = consts.checkAddressOverrides[check] if check in consts.checkAddressOverrides else consts.checksStart + int(room, 16)
        linkedItem = consts.linkedCheckItems[check] if check in consts.linkedCheckItems else None

        if 'Trade' in check or 'Owl' in check:
            mask = consts.altCheckFlag

        if check in consts.checkMaskOverrides:
            mask = consts.checkMaskOverrides[check]
        
        state.checks.append(Check(check, address, mask, consts.alternateCheckAddresses[check] if check in consts.alternateCheckAddresses else None, linkedItem))

def readChecks(gb, state, extraItems):
    for check in [x for x in state.checks if 'checks' in state.features or x.linkedItem]:
        bytes = [gb.readRamByte(check.address)]

        if check.alternateAddress != None:
            bytes.append(gb.readRamByte(check.alternateAddress))

        check.set(bytes)

        if check.value and check.linkedItem:
            linkedItem = check.linkedItem
            if 'condition' not in linkedItem or linkedItem['condition'](state.flags):
                extraItems[check.linkedItem['item']] = check.linkedItem['qty']

        if state.firstRead:
            check.diff = 0
    
    state.firstRead = False