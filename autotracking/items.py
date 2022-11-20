from item import Item

gameStateAddress = 0xDB95
validGameStates = {0x0B, 0x0C}

inventorySlotCount = 16
inventoryStartAddress = 0xDB00
inventoryEndAddress = inventoryStartAddress + inventorySlotCount

inventoryItemIds = {
    0x02: 'BOMB',
    0x05: 'BOW',
    0x06: 'HOOKSHOT',
    0x07: 'MAGIC_ROD',
    0x08: 'PEGASUS_BOOTS',
    0x09: 'OCARINA',
    0x0A: 'FEATHER',
    0x0B: 'SHOVEL',
    0x0C: 'MAGIC_POWDER',
    0x0D: 'BOOMERANG',
    0x0E: 'TOADSTOOL',
    0x0F: 'ROOSTER',
}

items = [
    Item('BOMB', None),
    Item('BOW', None),
    Item('HOOKSHOT', None),
    Item('MAGIC_ROD', None),
    Item('PEGASUS_BOOTS', None),
    Item('OCARINA', None),
    Item('FEATHER', None),
    Item('SHOVEL', None),
    Item('MAGIC_POWDER', None),
    Item('BOOMERANG', None),
    Item('TOADSTOOL', None),
    Item('ROOSTER', None),
    Item('SWORD', 0xDB4E, count=True),
    Item('POWER_BRACELET', 0xDB43, count=True),
    Item('SHIELD', 0xDB44, count=True),
    Item('BOWWOW', 0xDB56),
    Item('MAX_POWDER_UPGRADE', 0xDB76, threshold=0x20),
    Item('MAX_BOMBS_UPGRADE', 0xDB77, threshold=0x30),
    Item('MAX_ARROWS_UPGRADE', 0xDB78, threshold=0x30),
    Item('TAIL_KEY', 0xDB11),
    Item('SLIME_KEY', 0xDB15),
    Item('ANGLER_KEY', 0xDB12),
    Item('FACE_KEY', 0xDB13),
    Item('BIRD_KEY', 0xDB14),
    Item('FLIPPERS', 0xDB3E),
    Item('SEASHELL', 0xDB41, count=True, increaseOnly=True),
    Item('GOLD_LEAF', 0xDB42, count=True, increaseOnly=True),
    Item('INSTRUMENT1', 0xDB65, mask=1 << 1),
    Item('INSTRUMENT2', 0xDB66, mask=1 << 1),
    Item('INSTRUMENT3', 0xDB67, mask=1 << 1),
    Item('INSTRUMENT4', 0xDB68, mask=1 << 1),
    Item('INSTRUMENT5', 0xDB69, mask=1 << 1),
    Item('INSTRUMENT6', 0xDB6A, mask=1 << 1),
    Item('INSTRUMENT7', 0xDB6B, mask=1 << 1),
    Item('INSTRUMENT8', 0xDB6C, mask=1 << 1),
    Item('TRADING_ITEM_YOSHI_DOLL', 0xDB40, mask=1 << 0, increaseOnly=True),
    Item('TRADING_ITEM_RIBBON', 0xDB40, mask=1 << 1, increaseOnly=True),
    Item('TRADING_ITEM_DOG_FOOD', 0xDB40, mask=1 << 2, increaseOnly=True),
    Item('TRADING_ITEM_BANANAS', 0xDB40, mask=1 << 3, increaseOnly=True),
    Item('TRADING_ITEM_STICK', 0xDB40, mask=1 << 4, increaseOnly=True),
    Item('TRADING_ITEM_HONEYCOMB', 0xDB40, mask=1 << 5, increaseOnly=True),
    Item('TRADING_ITEM_PINEAPPLE', 0xDB40, mask=1 << 6, increaseOnly=True),
    Item('TRADING_ITEM_HIBISCUS', 0xDB40, mask=1 << 7, increaseOnly=True),
    Item('TRADING_ITEM_LETTER', 0xDB7F, mask=1 << 0, increaseOnly=True),
    Item('TRADING_ITEM_BROOM', 0xDB7F, mask=1 << 1, increaseOnly=True),
    Item('TRADING_ITEM_FISHING_HOOK', 0xDB7F, mask=1 << 2, increaseOnly=True),
    Item('TRADING_ITEM_NECKLACE', 0xDB7F, mask=1 << 3, increaseOnly=True),
    Item('TRADING_ITEM_SCALE', 0xDB7F, mask=1 << 4, increaseOnly=True),
    Item('TRADING_ITEM_MAGNIFYING_GLASS', 0xDB7F, mask=1 << 5, increaseOnly=True),
    Item('SONG1', 0xDB49, mask=1 << 2),
    Item('SONG2', 0xDB49, mask=1 << 1),
    Item('SONG3', 0xDB49, mask=1 << 0),
    Item('RED_TUNIC', 0xDB6D, mask=1 << 0),
    Item('BLUE_TUNIC', 0xDB6D, mask=1 << 1),
]

dungeonItemAddresses = [
    0xDB16, # D1
    0xDB1B, # D2
    0xDB20, # D3
    0xDB25, # D4
    0xDB2A, # D5
    0xDB2F, # D6
    0xDB34, # D7
    0xDB39, # D8
    0xDDDA, # Color Dungeon
]

dungeonItemOffsets = {
    'MAP{}': 0,
    'COMPASS{}': 1,
    'STONE_BEAK{}': 2,
    'NIGHTMARE_KEY{}': 3,
    'KEY{}': 4,
}

for i in range(len(dungeonItemAddresses)):
    for item, offset in dungeonItemOffsets.items():
        if item.startswith('KEY'):
            items.append(Item(item.format(i + 1), dungeonItemAddresses[i] + offset, count=True, increaseOnly=True))
        else:
            items.append(Item(item.format(i + 1), dungeonItemAddresses[i] + offset))

itemDict = {item.id: item for item in items}
