try:
    from .item import Item
except:
    from item import Item

# General RAM layout
wram = 0xC000
wramSize = 0x2000
wramLow = 0xC100
wramLowSize = 0x100
# WRAM actually starts at 0xC000, but we mostly care about 0xD800 and up
wramHigh = 0xD800
wramHighSize = 0x800
hram = 0xFF80
hramSize = 0x80
snapshotSize = 0x4000

# General game state
gameStateAddress = 0xDB95
validGameStates = {0x0B, 0x0C}
gameStateResetThreshold = 0x06
seed = 0xFAF00
seedSize = 0x10

# GFX
gfxStart = 0xB0000
gfxHashSize = 0x040

# Entrance/location data
room = 0xFFF6
mapId = 0xFFF7
indoorFlag = 0xDBA5
entranceRoomOffset = 0xD800
transitionState = 0xC124
transitionTargetX = 0xC12C
transitionTargetY = 0xC12D
transitionScrollX = 0xFF96
transitionScrollY = 0xFF97
linkMotionState = 0xC11C
transitionSequence = 0xC16B 
screenCoord = 0xFFFA

entranceAddressOverrides = {
    0x312: 0xDDF2,
}

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

# Items
inventorySlotCount = 16
inventoryStart = 0xDB00
inventoryEnd = inventoryStart + inventorySlotCount

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

dungeonKeyDoors = [
    { # D1
        0xD907: [0x04],
        0xD909: [0x40],
        0xD90F: [0x01],
    },
    { # D2
        0xD921: [0x02],
        0xD925: [0x02],
        0xD931: [0x02],
        0xD932: [0x08],
        0xD935: [0x04],
    },
    { # D3
        0xD945: [0x40],
        0xD946: [0x40],
        0xD949: [0x40],
        0xD94A: [0x40],
        0xD956: [0x01, 0x02, 0x04, 0x08],
    },
    { # D4
        0xD969: [0x04],
        0xD96A: [0x40],
        0xD96E: [0x40],
        0xD978: [0x01],
        0xD979: [0x04],
    },
    { # D5
        0xD98C: [0x40],
        0xD994: [0x40],
        0xD99F: [0x04],
    },
    { # D6
        0xD9C3: [0x40],
        0xD9C6: [0x40],
        0xD9D0: [0x04],
    },
    { # D7
        0xDA10: [0x04],
        0xDA1E: [0x40],
        0xDA21: [0x40],
    },
    { # D8
        0xDA39: [0x02],
        0xDA3B: [0x01],
        0xDA42: [0x40],
        0xDA43: [0x40],
        0xDA44: [0x40],
        0xDA49: [0x40],
        0xDA4A: [0x01],
    },
    { # D0
        0xDDE5: [0x02],
        0xDDE9: [0x04],
        0xDDF0: [0x04],
    },
]

dungeonItems = [
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
        Item('SEASHELL', 0xDB41, count=True),
        Item('GOLD_LEAF', 0xDB42, count=True, max=5),
        Item('INSTRUMENT1', 0xDB65, mask=1 << 1),
        Item('INSTRUMENT2', 0xDB66, mask=1 << 1),
        Item('INSTRUMENT3', 0xDB67, mask=1 << 1),
        Item('INSTRUMENT4', 0xDB68, mask=1 << 1),
        Item('INSTRUMENT5', 0xDB69, mask=1 << 1),
        Item('INSTRUMENT6', 0xDB6A, mask=1 << 1),
        Item('INSTRUMENT7', 0xDB6B, mask=1 << 1),
        Item('INSTRUMENT8', 0xDB6C, mask=1 << 1),
        Item('TRADING_ITEM_YOSHI_DOLL', 0xDB40, mask=1 << 0),
        Item('TRADING_ITEM_RIBBON', 0xDB40, mask=1 << 1),
        Item('TRADING_ITEM_DOG_FOOD', 0xDB40, mask=1 << 2),
        Item('TRADING_ITEM_BANANAS', 0xDB40, mask=1 << 3),
        Item('TRADING_ITEM_STICK', 0xDB40, mask=1 << 4),
        Item('TRADING_ITEM_HONEYCOMB', 0xDB40, mask=1 << 5),
        Item('TRADING_ITEM_PINEAPPLE', 0xDB40, mask=1 << 6),
        Item('TRADING_ITEM_HIBISCUS', 0xDB40, mask=1 << 7),
        Item('TRADING_ITEM_LETTER', 0xDB7F, mask=1 << 0),
        Item('TRADING_ITEM_BROOM', 0xDB7F, mask=1 << 1),
        Item('TRADING_ITEM_FISHING_HOOK', 0xDB7F, mask=1 << 2),
        Item('TRADING_ITEM_NECKLACE', 0xDB7F, mask=1 << 3),
        Item('TRADING_ITEM_SCALE', 0xDB7F, mask=1 << 4),
        Item('TRADING_ITEM_MAGNIFYING_GLASS', 0xDB7F, mask=1 << 5),
        Item('SONG1', 0xDB49, mask=1 << 2),
        Item('SONG2', 0xDB49, mask=1 << 1),
        Item('SONG3', 0xDB49, mask=1 << 0),
        Item('RED_TUNIC', 0xDB6D, mask=1 << 0),
        Item('BLUE_TUNIC', 0xDB6D, mask=1 << 1),
        Item('GREAT_FAIRY', 0xDDE1, mask=1 << 4),
    ]

# Checks
checksStart = 0xD800
defaultCheckFlag = 0x10
altCheckFlag = 0x20

checkMaskOverrides = {
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

checkAddressOverrides = {
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

alternateCheckAddresses = {
    '0x0F2': 0xD8B2,
}

checkBlacklist = {'None', '0x2A1-2'}

def seashellCondition(flags):
    return 'goal' not in flags or flags['goal'] != 'seashells'

linkedCheckItems = {
    '0x2E9': {'item': 'SEASHELL', 'qty': 20, 'condition': seashellCondition},
    '0x2A2': {'item': 'TOADSTOOL', 'qty': 1},
    '0x2A6-Trade': {'item': 'TRADING_ITEM_YOSHI_DOLL', 'qty': 1},
    '0x2B2-Trade': {'item': 'TRADING_ITEM_RIBBON', 'qty': 1},
    '0x2FE-Trade': {'item': 'TRADING_ITEM_DOG_FOOD', 'qty': 1},
    '0x07B-Trade': {'item': 'TRADING_ITEM_BANANAS', 'qty': 1},
    '0x087-Trade': {'item': 'TRADING_ITEM_STICK', 'qty': 1},
    '0x2D7-Trade': {'item': 'TRADING_ITEM_HONEYCOMB', 'qty': 1},
    '0x019-Trade': {'item': 'TRADING_ITEM_PINEAPPLE', 'qty': 1},
    '0x2D9-Trade': {'item': 'TRADING_ITEM_HIBISCUS', 'qty': 1},
    '0x2A8-Trade': {'item': 'TRADING_ITEM_LETTER', 'qty': 1},
    '0x0CD-Trade': {'item': 'TRADING_ITEM_BROOM', 'qty': 1},
    '0x2F5-Trade': {'item': 'TRADING_ITEM_FISHING_HOOK', 'qty': 1},
    '0x0C9-Trade': {'item': 'TRADING_ITEM_NECKLACE', 'qty': 1},
    '0x297-Trade': {'item': 'TRADING_ITEM_SCALE', 'qty': 1},
}