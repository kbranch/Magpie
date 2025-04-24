try:
    from .item import Item
    from .entrance import EntranceCoord
except:
    from item import Item
    from entrance import EntranceCoord

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
spawnMap = 0xDB60
spawnRoom = 0xDB61
spawnX = 0xDB62
spawnY = 0xDB63
entranceRoomOffset = 0xD800
transitionState = 0xC124
transitionTargetX = 0xC12C
transitionTargetY = 0xC12D
transitionScrollX = 0xFF96
transitionScrollY = 0xFF97
linkMotionState = 0xC11C
transitionSequence = 0xC16B 
screenCoord = 0xFFFA

rupeesHigh = 0xDB5D
rupeesLow = 0xDB5E
addRupeesHigh = 0xDB8F
addRupeesLow = 0xDB90
removeRupeesHigh = 0xDB91
removeRupeesLow = 0xDB92

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
    0x10: 'HAMMER',
}

dungeonKeyDoors = [
    { # D0
        0xDDE5: [0x02],
        0xDDE9: [0x04],
        0xDDF0: [0x04],
    },
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
    'UNUSED_KEY{}': 4,
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
        Item('HAMMER', None),
        Item('RUPEE_COUNT', None, count=True, encodedCount=False),
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
        Item('ANGLER_TUNNEL_OPENED', 0xD82B, mask=1 << 4),
        Item('KEY_CAVERN_OPENED', 0xD8B5, mask=1 << 4),
        Item('TAIL_CAVE_OPENED', 0xD8D3, mask=1 << 4),
        Item('FACE_SHRINE_OPENED', 0xD88C, mask=1 << 4),
        Item('EAGLE_TOWER_OPENED', 0xD80E, mask=1 << 4),
        Item('CASTLE_GATE_OPENED', 0xD879, mask=1 << 4),
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
    '0x2E9-0': 0x20,
    '0x2E9-1': 0x40,
    '0x2A1-1': 0x20,
    '0x2CB-1': 0x20,
    '0x29B-1': 0x20,
    '0x2B4-1': 0x20,
    '0x29C-1': 0x20,
    '0x29D-1': 0x20,
    '0x2CC-1': 0x20,
    '0x2E3-1': 0x20,
    '0x299-1': 0x20,
    '0x1F5': 0x06,
    '0x301-0': 0x10,
    '0x301-1': 0x10,
    '0x0D3': 0x20,
    '0x0B5': 0x20,
    '0x2C3': 0x20,
    '0x08C': 0x20,
    '0x02B': 0x20,
    '0x00E': 0x20,
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

entranceCoords = [
    EntranceCoord("writes_house:inside", 0x2a8, 80, 124),
    EntranceCoord("rooster_grave", 0x92, 88, 82),
    EntranceCoord("start_house:inside", 0x2a3, 80, 124),
    EntranceCoord("dream_hut", 0x83, 40, 66),
    EntranceCoord("papahl_house_right:inside", 0x2a6, 80, 124),
    EntranceCoord("papahl_house_right", 0x82, 120, 82),
    EntranceCoord("papahl_house_left:inside", 0x2a5, 80, 124),
    EntranceCoord("papahl_house_left", 0x82, 88, 82),
    EntranceCoord("d2:inside", 0x136, 80, 124),
    EntranceCoord("shop", 0x93, 72, 98),
    EntranceCoord("armos_maze_cave:inside", 0x2fc, 104, 96),
    EntranceCoord("start_house", 0xa2, 88, 82),
    EntranceCoord("animal_house3:inside", 0x2d9, 80, 124),
    EntranceCoord("trendy_shop", 0xb3, 88, 82),
    EntranceCoord("mabe_phone:inside", 0x2cb, 80, 124),
    EntranceCoord("mabe_phone", 0xb2, 88, 82),
    EntranceCoord("ulrira:inside", 0x2a9, 80, 124),
    EntranceCoord("ulrira", 0xb1, 72, 98),
    EntranceCoord("moblin_cave:inside", 0x2f0, 80, 124),
    EntranceCoord("kennel", 0xa1, 88, 66),
    EntranceCoord("madambowwow:inside", 0x2a7, 80, 124),
    EntranceCoord("madambowwow", 0xa1, 56, 66),
    EntranceCoord("library:inside", 0x1fa, 80, 124),
    EntranceCoord("library", 0xb0, 56, 50),
    EntranceCoord("d5:inside", 0x1a1, 80, 124),
    EntranceCoord("d1", 0xd3, 104, 34),
    EntranceCoord("d1:inside", 0x117, 80, 124),
    EntranceCoord("d3:inside", 0x152, 80, 124),
    EntranceCoord("d3", 0xb5, 104, 32),
    EntranceCoord("banana_seller", 0xe3, 72, 48),
    EntranceCoord("armos_temple:inside", 0x28f, 80, 124),
    EntranceCoord("boomerang_cave", 0xf4, 24, 32),
    EntranceCoord("forest_madbatter:inside", 0x1e1, 136, 80),
    EntranceCoord("ghost_house", 0xf6, 88, 66),
    EntranceCoord("prairie_low_phone:inside", 0x29d, 80, 124),
    EntranceCoord("prairie_low_phone", 0xe8, 56, 98),
    EntranceCoord("prairie_madbatter_connector_entrance:inside", 0x1f6, 136, 112),
    EntranceCoord("prairie_madbatter_connector_entrance", 0xf9, 120, 80),
    EntranceCoord("prairie_madbatter_connector_exit", 0xe7, 104, 32),
    EntranceCoord("prairie_madbatter_connector_exit:inside", 0x1e5, 40, 48),
    EntranceCoord("ghost_house:inside", 0x1e3, 80, 124),
    EntranceCoord("prairie_madbatter", 0xe6, 72, 64),
    EntranceCoord("d4:inside", 0x17a, 80, 124),
    EntranceCoord("d5", 0xd9, 88, 64),
    EntranceCoord("prairie_right_cave_bottom:inside", 0x293, 48, 124),
    EntranceCoord("prairie_right_cave_bottom", 0xc8, 40, 80),
    EntranceCoord("prairie_right_cave_high", 0xb8, 88, 48),
    EntranceCoord("prairie_right_cave_high:inside", 0x295, 112, 124),
    EntranceCoord("prairie_right_cave_top", 0xb8, 120, 96),
    EntranceCoord("prairie_right_cave_top:inside", 0x292, 48, 124),
    EntranceCoord("prairie_to_animal_connector:inside", 0x2d0, 40, 64),
    EntranceCoord("prairie_to_animal_connector", 0xaa, 136, 64),
    EntranceCoord("animal_to_prairie_connector", 0xab, 120, 80),
    EntranceCoord("animal_to_prairie_connector:inside", 0x2d1, 120, 64),
    EntranceCoord("animal_phone:inside", 0x2e3, 80, 124),
    EntranceCoord("animal_phone", 0xdb, 120, 82),
    EntranceCoord("animal_house1:inside", 0x2db, 80, 124),
    EntranceCoord("animal_house1", 0xcc, 40, 80),
    EntranceCoord("animal_house2:inside", 0x2dd, 80, 124),
    EntranceCoord("animal_house2", 0xcc, 120, 80),
    EntranceCoord("hookshot_cave:inside", 0x2b3, 80, 124),
    EntranceCoord("animal_house3", 0xcd, 40, 80),
    EntranceCoord("animal_house4:inside", 0x2da, 80, 124),
    EntranceCoord("animal_house4", 0xcd, 88, 80),
    EntranceCoord("banana_seller:inside", 0x2fe, 80, 124),
    EntranceCoord("animal_house5", 0xdd, 88, 66),
    EntranceCoord("animal_cave:inside", 0x2f7, 96, 124),
    EntranceCoord("animal_cave", 0xcd, 136, 32),
    EntranceCoord("d6", 0x8c, 56, 64),
    EntranceCoord("madbatter_taltal:inside", 0x1e2, 136, 80),
    EntranceCoord("desert_cave", 0xcf, 88, 16),
    EntranceCoord("dream_hut:inside", 0x2aa, 80, 124),
    EntranceCoord("armos_maze_cave", 0xae, 72, 112),
    EntranceCoord("shop:inside", 0x2a1, 80, 124),
    EntranceCoord("armos_temple", 0xac, 88, 64),
    EntranceCoord("d6_connector_exit:inside", 0x1f0, 56, 16),
    EntranceCoord("d6_connector_exit", 0x9c, 88, 16),
    EntranceCoord("desert_cave:inside", 0x1f9, 120, 96),
    EntranceCoord("d6_connector_entrance:inside", 0x1f1, 136, 96),
    EntranceCoord("d6_connector_entrance", 0x9d, 56, 48),
    EntranceCoord("armos_fairy:inside", 0x1ac, 80, 124),
    EntranceCoord("armos_fairy", 0x8d, 56, 32),
    EntranceCoord("raft_return_enter:inside", 0x1f7, 136, 96),
    EntranceCoord("raft_return_enter", 0x8f, 8, 32),
    EntranceCoord("raft_return_exit", 0x2f, 24, 112),
    EntranceCoord("raft_return_exit:inside", 0x1e7, 72, 16),
    EntranceCoord("raft_house:inside", 0x2b0, 80, 124),
    EntranceCoord("raft_house", 0x3f, 40, 34),
    EntranceCoord("heartpiece_swim_cave:inside", 0x1f2, 72, 124),
    EntranceCoord("heartpiece_swim_cave", 0x2e, 88, 32),
    EntranceCoord("rooster_grave:inside", 0x1f4, 88, 112),
    EntranceCoord("d4", 0x2b, 72, 34),
    EntranceCoord("castle_phone:inside", 0x2cc, 80, 124),
    EntranceCoord("castle_phone", 0x4b, 72, 34),
    EntranceCoord("castle_main_entrance:inside", 0x2d3, 80, 124),
    EntranceCoord("castle_main_entrance", 0x69, 88, 64),
    EntranceCoord("castle_upper_left", 0x59, 24, 48),
    EntranceCoord("castle_upper_left:inside", 0x2d5, 80, 124),
    EntranceCoord("witch:inside", 0x2a2, 80, 124),
    EntranceCoord("castle_upper_right", 0x59, 88, 64),
    EntranceCoord("prairie_left_cave2:inside", 0x2f4, 64, 124),
    EntranceCoord("castle_jump_cave", 0x78, 40, 112),
    EntranceCoord("prairie_left_cave1:inside", 0x2cd, 80, 124),
    EntranceCoord("seashell_mansion", 0x8a, 88, 64),
    EntranceCoord("prairie_right_phone:inside", 0x29c, 80, 124),
    EntranceCoord("prairie_right_phone", 0x88, 88, 82),
    EntranceCoord("prairie_left_fairy:inside", 0x1f3, 80, 124),
    EntranceCoord("prairie_left_fairy", 0x87, 40, 16),
    EntranceCoord("bird_cave:inside", 0x27e, 96, 124),
    EntranceCoord("prairie_left_cave2", 0x86, 24, 64),
    EntranceCoord("prairie_left_cave1", 0x84, 152, 98),
    EntranceCoord("prairie_left_phone:inside", 0x2b4, 80, 124),
    EntranceCoord("prairie_left_phone", 0xa4, 56, 66),
    EntranceCoord("mamu:inside", 0x2fb, 136, 112),
    EntranceCoord("mamu", 0xd4, 136, 48),
    EntranceCoord("richard_house:inside", 0x2c7, 80, 124),
    EntranceCoord("richard_house", 0xd6, 72, 80),
    EntranceCoord("richard_maze:inside", 0x2c9, 128, 124),
    EntranceCoord("richard_maze", 0xc6, 56, 80),
    EntranceCoord("graveyard_cave_left:inside", 0x2de, 56, 64),
    EntranceCoord("graveyard_cave_left", 0x75, 56, 64),
    EntranceCoord("graveyard_cave_right:inside", 0x2df, 56, 48),
    EntranceCoord("graveyard_cave_right", 0x76, 104, 80),
    EntranceCoord("trendy_shop:inside", 0x2a0, 80, 124),
    EntranceCoord("d0", 0x77, 120, 46),
    EntranceCoord("boomerang_cave:inside", 0x1f5, 72, 124),
    EntranceCoord("witch", 0x65, 72, 50),
    EntranceCoord("toadstool_entrance:inside", 0x2bd, 80, 124),
    EntranceCoord("toadstool_entrance", 0x62, 120, 66),
    EntranceCoord("toadstool_exit", 0x50, 136, 50),
    EntranceCoord("toadstool_exit:inside", 0x2ab, 80, 124),
    EntranceCoord("prairie_madbatter:inside", 0x1e0, 136, 112),
    EntranceCoord("hookshot_cave", 0x42, 56, 66),
    EntranceCoord("castle_upper_right:inside", 0x2d6, 80, 124),
    EntranceCoord("forest_madbatter", 0x52, 104, 48),
    EntranceCoord("writes_phone:inside", 0x29b, 80, 124),
    EntranceCoord("writes_phone", 0x31, 104, 82),
    EntranceCoord("d0:inside", 0x312, 80, 92),
    EntranceCoord("writes_house", 0x30, 120, 50),
    EntranceCoord("writes_cave_left:inside", 0x2ae, 80, 124),
    EntranceCoord("writes_cave_left", 0x20, 136, 50),
    EntranceCoord("writes_cave_right:inside", 0x2af, 80, 124),
    EntranceCoord("writes_cave_right", 0x21, 24, 50),
    EntranceCoord("d6:inside", 0x1d4, 80, 124),
    EntranceCoord("d2", 0x24, 56, 34),
    EntranceCoord("animal_house5:inside", 0x2d7, 80, 124),
    EntranceCoord("moblin_cave", 0x35, 104, 80),
    EntranceCoord("crazy_tracy:inside", 0x2ad, 80, 124),
    EntranceCoord("crazy_tracy", 0x45, 136, 66),
    EntranceCoord("photo_house:inside", 0x2b5, 80, 124),
    EntranceCoord("photo_house", 0x37, 72, 66),
    EntranceCoord("obstacle_cave_entrance:inside", 0x2b6, 80, 124),
    EntranceCoord("obstacle_cave_entrance", 0x17, 56, 50),
    EntranceCoord("left_to_right_taltalentrance:inside", 0x2ee, 120, 48),
    EntranceCoord("left_to_right_taltalentrance", 0x7, 56, 80),
    EntranceCoord("obstacle_cave_outside_chest:inside", 0x2bb, 80, 124),
    EntranceCoord("obstacle_cave_outside_chest", 0x18, 104, 18),
    EntranceCoord("obstacle_cave_exit:inside", 0x2bc, 48, 124),
    EntranceCoord("obstacle_cave_exit", 0x18, 136, 18),
    EntranceCoord("papahl_entrance:inside", 0x289, 64, 124),
    EntranceCoord("papahl_entrance", 0x19, 136, 64),
    EntranceCoord("papahl_exit:inside", 0x28b, 80, 124),
    EntranceCoord("papahl_exit", 0xa, 24, 112),
    EntranceCoord("rooster_house:inside", 0x29f, 80, 124),
    EntranceCoord("rooster_house", 0xa, 72, 34),
    EntranceCoord("d7:inside", 0x20e, 80, 124),
    EntranceCoord("bird_cave", 0xa, 120, 112),
    EntranceCoord("multichest_top:inside", 0x2f2, 80, 124),
    EntranceCoord("multichest_top", 0xd, 24, 112),
    EntranceCoord("multichest_left:inside", 0x2f9, 32, 124),
    EntranceCoord("multichest_left", 0x1d, 24, 48),
    EntranceCoord("multichest_right:inside", 0x2fa, 112, 124),
    EntranceCoord("multichest_right", 0x1d, 120, 80),
    EntranceCoord("right_taltal_connector1:inside", 0x280, 32, 124),
    EntranceCoord("right_taltal_connector1", 0x1e, 56, 16),
    EntranceCoord("right_taltal_connector3:inside", 0x283, 128, 124),
    EntranceCoord("right_taltal_connector3", 0x1e, 120, 16),
    EntranceCoord("right_taltal_connector2:inside", 0x282, 112, 124),
    EntranceCoord("right_taltal_connector2", 0x1f, 40, 16),
    EntranceCoord("right_fairy:inside", 0x1fb, 80, 124),
    EntranceCoord("right_fairy", 0x1f, 56, 80),
    EntranceCoord("right_taltal_connector4:inside", 0x287, 96, 124),
    EntranceCoord("right_taltal_connector4", 0x1f, 88, 64),
    EntranceCoord("right_taltal_connector5:inside", 0x28c, 96, 124),
    EntranceCoord("right_taltal_connector5", 0x1f, 120, 16),
    EntranceCoord("right_taltal_connector6:inside", 0x28e, 112, 124),
    EntranceCoord("right_taltal_connector6", 0xf, 72, 80),
    EntranceCoord("d7", 0x0e, 88, 48),
    EntranceCoord("left_taltal_entrance:inside", 0x2ea, 80, 124),
    EntranceCoord("left_taltal_entrance", 0x15, 136, 64),
    EntranceCoord("castle_jump_cave:inside", 0x1fd, 88, 80),
    EntranceCoord("madbatter_taltal", 0x4, 120, 112),
    EntranceCoord("fire_cave_exit:inside", 0x1ee, 24, 64),
    EntranceCoord("fire_cave_exit", 0x3, 72, 80),
    EntranceCoord("fire_cave_entrance:inside", 0x1fe, 112, 124),
    EntranceCoord("fire_cave_entrance", 0x13, 88, 16),
    EntranceCoord("phone_d8:inside", 0x299, 80, 124),
    EntranceCoord("phone_d8", 0x11, 104, 50),
    EntranceCoord("kennel:inside", 0x2b2, 80, 124),
    EntranceCoord("d8", 0x10, 88, 16),
    EntranceCoord("d8:inside", 0x25d, 80, 124),
]

sidescrollerRooms = {
    0x2e9: "seashell_mansion:inside",
    0x08a: "seashell_mansion",
    0x2fd: "mambo:inside",
    0x02a: "mambo",
    0x1eb: "castle_secret_exit:inside",
    0x049: "castle_secret_exit",
    0x1ec: "castle_secret_entrance:inside",
    0x04a: "castle_secret_entrance",
    0x117: "d1:inside", # not a sidescroller, but acts weird 
}

entranceLookup = {}

for coord in entranceCoords:
    entranceLookup[str(coord)] = coord