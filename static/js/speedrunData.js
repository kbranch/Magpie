"use strict"

const speedrunItems = {
    'any%': [
        'MAGIC_POWDER',
        'SHOVEL',
        'BOW',
        'SHIELD',
        'FEATHER',
        'BOWWOW',
        'TOADSTOOL',
        'SWORD',
        'TAIL_KEY',
        'SLIME_KEY',
        'FACE_KEY',
        'BIRD_KEY',
        'ANGLER_KEY',
        'KEY1',
        'KEY2',
        'KEY3',
        'KEY4',
        'KEY5',
        'KEY6',
        'NIGHTMARE_KEY1',
        'NIGHTMARE_KEY2',
        'NIGHTMARE_KEY3',
        'NIGHTMARE_KEY4',
        'NIGHTMARE_KEY5',
        'NIGHTMARE_KEY6',
        'NIGHTMARE_KEY8',
        'POWER_BRACELET',
        'PEGASUS_BOOTS',
        'FLIPPERS',
        'HOOKSHOT',
        'MAGIC_ROD',
    ],
    'glitchless': [
        'MAGIC_POWDER',
        'SHOVEL',
        'BOW',
        'SHIELD',
        'FEATHER',
        'BOWWOW',
        'TOADSTOOL',
        'SWORD',
        'TAIL_KEY',
        'SLIME_KEY',
        'FACE_KEY',
        'BIRD_KEY',
        'ANGLER_KEY',
        'KEY1',
        'KEY2',
        'KEY3',
        'KEY4',
        'KEY5',
        'KEY6',
        'NIGHTMARE_KEY1',
        'NIGHTMARE_KEY2',
        'NIGHTMARE_KEY3',
        'NIGHTMARE_KEY4',
        'NIGHTMARE_KEY5',
        'NIGHTMARE_KEY6',
        'NIGHTMARE_KEY8',
        'POWER_BRACELET',
        'PEGASUS_BOOTS',
        'FLIPPERS',
        'HOOKSHOT',
        'MAGIC_ROD',

        'GOLD_LEAF',
        'OCARINA',
        'SONG1',
        'SONG3',
        'NIGHTMARE_KEY7',
        'KEY7',
        'KEY8',
    ],
    '100%': [
        'MAGIC_POWDER',
        'SHOVEL',
        'BOW',
        'SHIELD',
        'FEATHER',
        'BOWWOW',
        'TOADSTOOL',
        'SWORD',
        'TAIL_KEY',
        'SLIME_KEY',
        'FACE_KEY',
        'BIRD_KEY',
        'ANGLER_KEY',
        'KEY1',
        'KEY2',
        'KEY3',
        'KEY4',
        'KEY5',
        'KEY6',
        'NIGHTMARE_KEY1',
        'NIGHTMARE_KEY2',
        'NIGHTMARE_KEY3',
        'NIGHTMARE_KEY4',
        'NIGHTMARE_KEY5',
        'NIGHTMARE_KEY6',
        'NIGHTMARE_KEY8',
        'POWER_BRACELET',
        'PEGASUS_BOOTS',
        'FLIPPERS',
        'HOOKSHOT',
        'MAGIC_ROD',

        'GOLD_LEAF',
        'OCARINA',
        'SONG1',
        'SONG3',
        'NIGHTMARE_KEY7',
        'KEY7',
        'KEY8',

        'SEASHELL',
        'HEART_PIECE',
        'SONG2',
        'MAX_BOMBS_UPGRADE',
        'MAX_POWDER_UPGRADE',
        'BOOMERANG',
        'HEART_CONTAINER',
        'KEY0',
        'NIGHTMARE_KEY0',
        'BLUE_TUNIC',
        'RED_TUNIC'
    ]
}

const speedrunPlando = `
;Animal Village - Bear Cook
Location:0x2D7-Trade: TRADING_ITEM_PINEAPPLE
;Animal Village - Goat
Location:0x2D9-Trade: TRADING_ITEM_LETTER
;Animal Village - Grandma
Location:0x0CD-Trade: TRADING_ITEM_FISHING_HOOK
;Donut Plains - Donut Plains Ledge Dig
Location:0x0A8: SEASHELL
;Donut Plains - Rock Seashell
Location:0x0B9: SEASHELL
;Face Shrine - Raft Chest
Location:0x06C: SEASHELL
;Goponga Swamp - MrWrite
Location:0x2A8-Trade: TRADING_ITEM_BROOM
;Goponga Swamp - Swampy Chest
Location:0x034: RUPEES_50
;Goponga Swamp - Write Cave East
Location:0x2AF: RUPEES_50
;Goponga Swamp - Write Cave West
Location:0x2AE: RUPEES_20
;Kanalet Castle - Ball and Chain Darknut Leaf
Location:0x2C6: GOLD_LEAF
;Kanalet Castle - Bombable Darknut Leaf
Location:0x2C5: GOLD_LEAF
;Kanalet Castle - Bomberman Meets Whack-a-mole Leaf
Location:0x05A: GOLD_LEAF
;Kanalet Castle - Boots Pit
Location:0x1FD: SEASHELL
;Kanalet Castle - Crow Rock Leaf
Location:0x058: GOLD_LEAF
;Kanalet Castle - Darknut, Zol, Bubble Leaf
Location:0x2D2: GOLD_LEAF
;Kanalet Castle - In the Moat Heart Piece
Location:0x078: HEART_PIECE
;Koholint Prairie - Ghost Grave Dig
Location:0x074: SEASHELL
;Koholint Prairie - Graveyard Connector
Location:0x2DF: HEART_PIECE
;Koholint Prairie - Heart Piece of Shame
Location:0x044: HEART_PIECE
;Koholint Prairie - Witch Item
Location:0x2A2: MAGIC_POWDER
;Mabe Village - Ballad of the Wind Fish
Location:0x092: SONG1
;Mabe Village - Bush Field
Location:0x0A3: SEASHELL
;Mabe Village - Dog House Dig
Location:0x2B2: SEASHELL
;Mabe Village - Dream Hut East
Location:0x2BF: RUPEES_100
;Mabe Village - Dream Hut West
Location:0x2BE: OCARINA
;Mabe Village - Fishing Game Heart Piece
Location:0x2B1: HEART_PIECE
;Mabe Village - Papahl's Wife
Location:0x2A6-Trade: TRADING_ITEM_RIBBON
;Mabe Village - Rooster
Location:0x1E4: ROOSTER
;Mabe Village - Shop 200 Item
Location:0x2A1-0: SHOVEL
;Mabe Village - Shop 980 Item
Location:0x2A1-1: BOW
;Mabe Village - Tarin's Gift
Location:0x2A3: SHIELD
;Mabe Village - Trendy Game
Location:0x2A0-Trade: TRADING_ITEM_YOSHI_DOLL
;Mabe Village - Well Heart Piece
Location:0x2A4: HEART_PIECE
;Mabe Village - YipYip
Location:0x2B2-Trade: TRADING_ITEM_DOG_FOOD
;Martha's Bay - Fisher
Location:0x2F5-Trade: TRADING_ITEM_NECKLACE
;Martha's Bay - Ghost House Barrel
Location:0x1E3: SEASHELL
;Martha's Bay - Island Bush of Destiny
Location:0x0F8: SEASHELL
;Martha's Bay - Lone Bush
Location:0x0E9: SEASHELL
;Martha's Bay - Mad Batter
Location:0x1E0: MAX_BOMBS_UPGRADE
;Martha's Bay - Mermaid
Location:0x0C9-Trade: TRADING_ITEM_SCALE
;Martha's Bay - Mermaid Statue
Location:0x297-Trade: TRADING_ITEM_MAGNIFYING_GLASS
;Martha's Bay - Peninsula Dig
Location:0x0DA: SEASHELL
;Mysterious Woods - Cave Crystal Chest
Location:0x2BD: RUPEES_50
;Mysterious Woods - Cave Skull Heart Piece
Location:0x2AB: HEART_PIECE
;Mysterious Woods - Hookshot Cave
Location:0x2B3: RUPEES_50
;Mysterious Woods - Mad Batter
Location:0x1E1: MAX_POWDER_UPGRADE
;Mysterious Woods - Tail Key Chest
Location:0x041: TAIL_KEY
;Mysterious Woods - Toadstool
Location:0x050: TOADSTOOL
;Mysterious Woods - Two Zol, Moblin Chest
Location:0x071: SEASHELL
;Pothole Field - Slime Key Dig
Location:0x0C6: SLIME_KEY
;Pothole Field - Under Richard's House
Location:0x2C8: SEASHELL
;Rapids Ride - East
Location:0x05D: RUPEES_20
;Rapids Ride - West
Location:0x05C: RUPEES_20
;Southern Face Shrine - Armos Knight
Location:0x27F: FACE_KEY
;Southern Face Shrine - Under Armos Cave
Location:0x2FC: SEASHELL
;Tal Tal Heights - Damp Cave Heart Piece
Location:0x1F2: HEART_PIECE
;Tal Tal Heights - Manbo's Mambo
Location:0x2FD: SONG2
;Tal Tal Heights - Moblin Cave
Location:0x2E2: BOWWOW
;Tal Tal Heights - Papahl
Location:0x019-Trade: TRADING_ITEM_HIBISCUS
;Tal Tal Mountains - Access Tunnel Bombable Heart Piece
Location:0x2BA: HEART_PIECE
;Tal Tal Mountains - Access Tunnel Exterior
Location:0x018: RUPEES_50
;Tal Tal Mountains - Access Tunnel Interior
Location:0x2BB: RUPEES_50
;Tal Tal Mountains - Bird Key Cave
Location:0x27A: BIRD_KEY
;Tal Tal Mountains - Bridge Rock
Location:0x00C: SEASHELL
;Tal Tal Mountains - Mad Batter
Location:0x1E2: MAX_ARROWS_UPGRADE
;Tal Tal Mountains - Outside Five Chest Game
Location:0x01D: RUPEES_20
;Tal Tal Mountains - Outside Mad Batter
Location:0x004: RUPEES_50
;Tal Tal Mountains - Paphl Cave
Location:0x28A: GEL
;Toronbo Shores - Banana Sale
Location:0x2FE-Trade: TRADING_ITEM_BANANAS
;Toronbo Shores - Boomerang Guy Item
Location:0x1F5: BOOMERANG
;Toronbo Shores - Outside D1 Tree Bonk
Location:0x0D2: SEASHELL
;Toronbo Shores - Sword on the Beach
Location:0x0F2: SWORD
;Toronbo Shores - West of Ghost House Chest
Location:0x0E5: RUPEES_50
;Turtle Rock - Outside Heart Piece
Location:0x000: HEART_PIECE
;Ukuku Prairie - Boots 'n' Bomb Cave Bombable Wall
Location:0x2E5: HEART_PIECE
;Ukuku Prairie - Boots 'n' Bomb Cave Chest
Location:0x2F4: RUPEES_50
;Ukuku Prairie - Cave East of Mabe
Location:0x2CD: RUPEES_50
;Ukuku Prairie - East of Mabe Tree Bonk
Location:0x0A4: SEASHELL
;Ukuku Prairie - East of Seashell Mansion Bush
Location:0x08B: SEASHELL
;Ukuku Prairie - Honeycomb
Location:0x087-Trade: TRADING_ITEM_HONEYCOMB
;Ukuku Prairie - Kiki
Location:0x07B-Trade: TRADING_ITEM_STICK
;Ukuku Prairie - Mamu
Location:0x2FB: SONG3
;Ukuku Prairie - Outside D3 Island Bush
Location:0x0A6: SEASHELL
;Ukuku Prairie - Outside D3 Ledge Dig
Location:0x0A5: SEASHELL
;Ukuku Prairie - Seashell Mansion
Location:0x2E9: SWORD
;Yarna Desert - Bomb Arrow Cave
Location:0x2E6: HEART_PIECE
;Yarna Desert - Cave Under Lanmola
Location:0x1E8: HEART_PIECE
;Yarna Desert - Lanmola
Location:0x0CE: ANGLER_KEY
;Yarna Desert - Rock Seashell
Location:0x0FF: SEASHELL
;Tail Cave - Bombable Wall Seashell Chest
Location:0x10C: SEASHELL
;Tail Cave - Feather Chest
Location:0x11D: FEATHER
;Tail Cave - Four Zol Chest
Location:0x115: COMPASS1
;Tail Cave - Hardhat Beetles Key
Location:0x116: KEY1
;Tail Cave - Mini-Moldorm Spawn Chest
Location:0x10D: RUPEES_20
;Tail Cave - Moldorm Heart Container
Location:0x106: HEART_CONTAINER
;Tail Cave - Nightmare Key Chest
Location:0x108: NIGHTMARE_KEY1
;Tail Cave - Pit Button Chest
Location:0x113: KEY1
;Tail Cave - Spark, Mini-Moldorm Chest
Location:0x10E: KEY1
;Tail Cave - Three of a Kind Chest
Location:0x10A: STONE_BEAK1
;Tail Cave - Two Stalfos, Two Keese Chest
Location:0x114: MAP1
;Bottle Grotto - Boo Buddies Room Chest
Location:0x120: POWER_BRACELET
;Bottle Grotto - Button Spawn Chest
Location:0x139: KEY2
;Bottle Grotto - Enemy Order Room Chest
Location:0x127: NIGHTMARE_KEY2
;Bottle Grotto - Entrance Chest
Location:0x136: RUPEES_50
;Bottle Grotto - First Switch Locked Chest
Location:0x138: KEY2
;Bottle Grotto - Genie Heart Container
Location:0x12B: HEART_CONTAINER
;Bottle Grotto - Hardhat Beetle Pit Chest
Location:0x12E: STONE_BEAK2
;Bottle Grotto - Mask-Mimic Chest
Location:0x137: COMPASS2
;Bottle Grotto - Mask-Mimic Key
Location:0x134: KEY2
;Bottle Grotto - Outside Boo Buddies Room Chest
Location:0x121: RUPEES_20
;Bottle Grotto - Second Switch Locked Chest
Location:0x122: KEY2
;Bottle Grotto - Two Stalfos Key
Location:0x132: KEY2
;Bottle Grotto - Vacuum Mouth Chest
Location:0x126: MAP2
;Key Cavern - After Stairs Key
Location:0x14D: KEY3
;Key Cavern - Boots Chest
Location:0x146: PEGASUS_BOOTS
;Key Cavern - Four Zol Chest
Location:0x14F: GEL
;Key Cavern - Nightmare Door Key
Location:0x15B: KEY3
;Key Cavern - North Key Room Key
Location:0x154: KEY3
;Key Cavern - Slime Eye Heart Container
Location:0x15A: HEART_CONTAINER
;Key Cavern - South Key Room Key
Location:0x158: KEY3
;Key Cavern - Sword Stalfos, Keese Switch Chest
Location:0x150: MAP3
;Key Cavern - Three Bombite Key
Location:0x141: KEY3
;Key Cavern - Three Zol, Stalfos Chest
Location:0x142: COMPASS3
;Key Cavern - Tile Arrow Ledge Chest
Location:0x147: NIGHTMARE_KEY3
;Key Cavern - Two Bombite, Sword Stalfos, Zol Chest
Location:0x151: KEY3
;Key Cavern - Two Stalfos, Zol Chest
Location:0x14E: RUPEES_200
;Key Cavern - Two Zol, Stalfos Ledge Chest
Location:0x144: RUPEES_50
;Key Cavern - Two Zol, Two Pairodd Key
Location:0x148: KEY3
;Key Cavern - Vacuum Mouth Chest
Location:0x153: KEY3
;Key Cavern - West Key Room Key
Location:0x155: KEY3
;Key Cavern - Zol Switch Chest
Location:0x14C: STONE_BEAK3
;Angler's Tunnel - Angler Fish Heart Container
Location:0x166: HEART_CONTAINER
;Angler's Tunnel - Blob Chest
Location:0x16D: GEL
;Angler's Tunnel - Crystal Chest
Location:0x17B: KEY4
;Angler's Tunnel - Flipper Locked After Boots Pit Chest
Location:0x16E: RUPEES_50
;Angler's Tunnel - Flipper Locked Before Boots Pit Chest
Location:0x175: RUPEES_50
;Angler's Tunnel - Flippers Chest
Location:0x160: FLIPPERS
;Angler's Tunnel - Lower Bomb Locked Watery Chest
Location:0x171: KEY4
;Angler's Tunnel - NW of Boots Pit Ledge Chest
Location:0x16A: MAP4
;Angler's Tunnel - Nightmare Key Ledge Chest
Location:0x176: NIGHTMARE_KEY4
;Angler's Tunnel - Pit Key
Location:0x169: KEY4
;Angler's Tunnel - Spark Chest
Location:0x168: KEY4
;Angler's Tunnel - Two Spiked Beetle, Zol Chest
Location:0x178: COMPASS4
;Angler's Tunnel - Upper Bomb Locked Watery Chest
Location:0x165: KEY4
;Angler's Tunnel - Watery Statue Chest
Location:0x179: STONE_BEAK4
;Catfish's Maw - Crystal Key
Location:0x181: KEY5
;Catfish's Maw - Entrance Hookshottable Chest
Location:0x1A0: RUPEES_200
;Catfish's Maw - Flying Bomb Chest East
Location:0x18F: KEY5
;Catfish's Maw - Flying Bomb Chest South
Location:0x19B: STONE_BEAK5
;Catfish's Maw - Hookshot Note Chest
Location:0x196: MESSAGE
;Catfish's Maw - Master Stalfos Item
Location:0x180: HOOKSHOT
;Catfish's Maw - Nightmare Key/Torch Cross Chest
Location:0x186: NIGHTMARE_KEY5
;Catfish's Maw - Slime Eel Heart Container
Location:0x185: HEART_CONTAINER
;Catfish's Maw - Spark, Two Iron Mask Chest
Location:0x19E: COMPASS5
;Catfish's Maw - Sword Stalfos, Star, Bridge Chest
Location:0x188: RUPEES_50
;Catfish's Maw - Three Iron Mask Chest
Location:0x197: KEY5
;Catfish's Maw - Three Stalfos Chest
Location:0x183: MAP5
;Catfish's Maw - Two Stalfos, Star Pit Chest
Location:0x18E: RUPEES_50
;Face Shrine - Facade Heart Container
Location:0x1BC: HEART_CONTAINER
;Face Shrine - Flying Heart, Statue Chest
Location:0x1C9: RUPEES_100
;Face Shrine - Four Wizzrobe Ledge Chest
Location:0x1D1: MEDICINE
;Face Shrine - L2 Bracelet Chest
Location:0x1CE: POWER_BRACELET
;Face Shrine - Mini-Moldorm, Spark Chest
Location:0x1CF: RUPEES_50
;Face Shrine - Pot Locked Chest
Location:0x1B6: NIGHTMARE_KEY6
;Face Shrine - Stairs Across Statues Chest
Location:0x1B9: STONE_BEAK6
;Face Shrine - Switch, Star Above Statues Chest
Location:0x1B3: COMPASS6
;Face Shrine - Three Wizzrobe, Switch Chest
Location:0x1C0: MAP6
;Face Shrine - Tile Room Key
Location:0x1C3: KEY6
;Face Shrine - Top Left Horse Heads Chest
Location:0x1B0: RUPEES_100
;Face Shrine - Top Right Horse Heads Chest
Location:0x1B1: RUPEES_200
;Face Shrine - Two Wizzrobe Key
Location:0x1B4: KEY6
;Face Shrine - Water Tektite Chest
Location:0x1BE: KEY6
;Eagle's Tower - Beamos Ledge Chest
Location:0x204: KEY7
;Eagle's Tower - Conveyor Beamos Chest
Location:0x220: MEDICINE
;Eagle's Tower - Entrance Key
Location:0x210: KEY7
;Eagle's Tower - Evil Eagle Heart Container
Location:0x223: HEART_CONTAINER
;Eagle's Tower - Hinox Key
Location:0x21B: KEY7
;Eagle's Tower - Horse Head, Bubble Chest
Location:0x212: MAP7
;Eagle's Tower - Kirby Ledge Chest
Location:0x201: SEASHELL
;Eagle's Tower - Mirror Shield Chest
Location:0x21A: SHIELD
;Eagle's Tower - Nightmare Key/After Grim Creeper Chest
Location:0x224: NIGHTMARE_KEY7
;Eagle's Tower - Switch Wrapped Chest
Location:0x209: STONE_BEAK7
;Eagle's Tower - Three of a Kind, No Pit Chest
Location:0x211: COMPASS7
;Eagle's Tower - Three of a Kind, Pit Chest
Location:0x21C: BOMB
;Turtle Rock - Beamos Blocked Chest
Location:0x240: KEY8
;Turtle Rock - Dodongo Chest
Location:0x23D: KEY8
;Turtle Rock - Four Ropes Pot Chest
Location:0x25F: STONE_BEAK8
;Turtle Rock - Gibdos on Cracked Floor Key
Location:0x23E: KEY8
;Turtle Rock - Hot Head Heart Container
Location:0x234: HEART_CONTAINER
;Turtle Rock - Lava Arrow Statue Key
Location:0x241: KEY8
;Turtle Rock - Lava Ledge Chest
Location:0x235: GEL
;Turtle Rock - Left Vire Key
Location:0x24C: KEY8
;Turtle Rock - Left of Hinox Zamboni Chest
Location:0x24D: RUPEES_20
;Turtle Rock - Magic Rod Chest
Location:0x237: MAGIC_ROD
;Turtle Rock - Nightmare Key/Big Zamboni Chest
Location:0x232: NIGHTMARE_KEY8
;Turtle Rock - Push Block Chest
Location:0x24F: MAP8
;Turtle Rock - Right Lava Chest
Location:0x259: MEDICINE
;Turtle Rock - Spark, Pit Chest
Location:0x255: RUPEES_50
;Turtle Rock - Two Torches Room Chest
Location:0x246: KEY8
;Turtle Rock - Vacuum Mouth Chest
Location:0x25C: COMPASS8
;Turtle Rock - West of Boss Door Ledge Chest
Location:0x23A: KEY8
;Turtle Rock - Zamboni, Two Zol Key
Location:0x25A: KEY8
;Color Dungeon - Bullshit Room
Location:0x307: KEY0
;Color Dungeon - Entrance Chest
Location:0x30F: COMPASS0
;Color Dungeon - Lower Small Key
Location:0x314: KEY0
;Color Dungeon - Nightmare Key Chest
Location:0x302: NIGHTMARE_KEY0
;Color Dungeon - Tunic Fairy Item 1
Location:0x301-0: BLUE_TUNIC
;Color Dungeon - Tunic Fairy Item 2
Location:0x301-1: RED_TUNIC
;Color Dungeon - Two Socket Chest
Location:0x311: STONE_BEAK0
;Color Dungeon - Upper Small Key
Location:0x308: KEY0
;Color Dungeon - Zol Chest
Location:0x306: MAP0
`;