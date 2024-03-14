import copy
import consts
from item import Item

def loadItems(state):
    state.items = copy.deepcopy(consts.items)

    for i in range(len(consts.dungeonItems)):
        for item, offset in consts.dungeonItemOffsets.items():
            dungeonNo = i + 1

            if i == 8:
                dungeonNo = 0

            if item.startswith('KEY'):
                state.items.append(Item(item.format(dungeonNo), consts.dungeonItems[i] + offset, count=True))
            else:
                state.items.append(Item(item.format(dungeonNo), consts.dungeonItems[i] + offset))

    state.itemDict = {item.id: item for item in state.items}

def readItems(gb, state, extraItems):
    missingItems = {x for x in state.items if x.address == None and x.id != 'RUPEE_COUNT'}
    
    # Add keys for opened key doors
    for i in range(len(consts.dungeonKeyDoors)):
        item = f'KEY{i}'
        extraItems[item] = 0

        for address, masks in consts.dungeonKeyDoors[i].items():
            for mask in masks:
                value = gb.readRamByte(address) & mask
                if value > 0:
                    extraItems[item] += 1

    # Main inventory items
    for i in range(consts.inventoryStart, consts.inventoryEnd):
        value = gb.readRamByte(i)

        if value in consts.inventoryItemIds:
            item = state.itemDict[consts.inventoryItemIds[value]]
            extra = extraItems[item.id] if item.id in extraItems else 0
            item.set(1, extra)
            missingItems.remove(item)
    
    for item in missingItems:
        extra = extraItems[item.id] if item.id in extraItems else 0
        item.set(0, extra)
    
    # All other items
    for item in [x for x in state.items if x.address]:
        extra = extraItems[item.id] if item.id in extraItems else 0
        item.set(gb.readRamByte(item.address), extra)
    
    # The current rupee count is BCD, but the add/remove values are not
    currentRupees = calculateRupeeCount(gb.readRamByte(consts.rupeesHigh), gb.readRamByte(consts.rupeesLow))
    addingRupees = (gb.readRamByte(consts.addRupeesHigh) << 8) +  gb.readRamByte(consts.addRupeesLow)
    removingRupees = (gb.readRamByte(consts.removeRupeesHigh) << 8) + gb.readRamByte(consts.removeRupeesLow)
    state.itemDict['RUPEE_COUNT'].set(currentRupees + addingRupees - removingRupees, 0)

    if state.firstRead:
        for item in state.items:
            item.diff = 0
    
    state.firstRead = False

def calculateRupeeCount(high, low):
    return (high - (high // 16 * 6)) * 100 + (low - (low // 16 * 6))