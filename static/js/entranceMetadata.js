let entranceDict = {
	"d0": {
		"id": "d0",
		"name": "D0: Color Dungeon",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 1246,
				"y": 926
			}
		],
		"interiorImage": "0312",
	},
	"d1": {
		"id": "d1",
		"name": "D1: Tail Cave",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 582,
				"y": 1706
			}
		],
		"interiorImage": "0117",
	},
	"d2": {
		"id": "d2",
		"name": "D2: Bottle Grotto",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 696,
				"y": 276
			}
		],
		"interiorImage": "0136",
	},
	"d3": {
		"id": "d3",
		"name": "D3: Key Cavern",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 906,
				"y": 1446
			}
		],
		"interiorImage": "0152",
	},
	"d4": {
		"id": "d4",
		"name": "D4: Angler's Tunnel",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 1846,
				"y": 276
			}
		],
		"interiorImage": "017A",
	},
	"d5": {
		"id": "d5",
		"name": "D5: Catfish's Maw",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 1538,
				"y": 1738
			}
		],
		"interiorImage": "01A1",
	},
	"d6": {
		"id": "d6",
		"name": "D6: Face Shrine",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 1992,
				"y": 1080
			}
		],
		"interiorImage": "01D4",
	},
	"d7": {
		"id": "d7",
		"name": "D7: Eagle's Tower",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 2348,
				"y": 32
			}
		],
		"interiorImage": "020E",
	},
	"d8": {
		"id": "d8",
		"name": "D8: Turtle Rock",
		"index": 0,
		"icon": "",
		"type": "dungeon",
		"locations": [
			{
				"map": "overworld",
				"x": 80,
				"y": 130
			}
		],
		"interiorImage": "025D",
	},
	"phone_d8": {
		"id": "phone_d8",
		"name": "Phone Near D8",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 258,
				"y": 162
			}
		],
	},
	"fire_cave_exit": {
		"id": "fire_cave_exit",
		"name": "Flamethrower Cave Exit",
		"index": 0,
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 550,
				"y": 64
			}
		],
		"connector": "fire_cave",
		"interiorImage": "01EE",
	},
	"fire_cave_entrance": {
		"id": "fire_cave_entrance",
		"name": "Flamethrower Cave Entrance",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 566,
				"y": 130
			}
		],
		"connector": "fire_cave",
		"interiorImage": "01FE",
	},
	"madbatter_taltal": {
		"id": "madbatter_taltal",
		"name": "Mad Batter - Mountain",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 744,
				"y": 96
			}
		],
		"interiorImage": "01E2",
	},
	"left_taltal_entrance": {
		"id": "left_taltal_entrance",
		"name": "Bottom of West Tal Tal",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 938,
				"y": 178
			}
		],
		"connector": "west_taltal",
		"oneWayBlocked": true,
		"interiorImage": "02EA",
	},
	"obstacle_cave_entrance": {
		"id": "obstacle_cave_entrance",
		"name": "Mountain Access",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1182,
				"y": 162
			}
		],
		"connector": "mountain_access",
		"interiorImage": "02B6",
	},
	"left_to_right_taltalentrance": {
		"id": "left_to_right_taltalentrance",
		"name": "Path to West Tal Tal Entrance",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1182,
				"y": 64
			}
		],
		"connector": "west_taltal",
		"interiorImage": "02EE",
	},
	"obstacle_cave_outside_chest": {
		"id": "obstacle_cave_outside_chest",
		"name": "Mountain Access Outside Chest",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1392,
				"y": 130
			}
		],
		"connector": "mountain_access",
		"interiorImage": "02BB",
	},
	"obstacle_cave_exit": {
		"id": "obstacle_cave_exit",
		"name": "Mountain Access Exit",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1424,
				"y": 130
			}
		],
		"connector": "mountain_access",
		"interiorImage": "02BC",
	},
	"papahl_entrance": {
		"id": "papahl_entrance",
		"name": "Path to Papahl",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1586,
				"y": 178
			}
		],
		"connector": "papahl",
		"interiorImage": "0289",
	},
	"papahl_exit": {
		"id": "papahl_exit",
		"name": "Near Papahl",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1636,
				"y": 96
			}
		],
		"connector": "papahl",
		"interiorImage": "028B",
	},
	"rooster_house": {
		"id": "rooster_house",
		"name": "Luigi's House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1684,
				"y": 16
			}
		],
	},
	"bird_cave": {
		"id": "bird_cave",
		"name": "Rooster Key Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1732,
				"y": 96
			}
		],
		"interiorImage": "027E",
	},
	"multichest_left": {
		"id": "multichest_left",
		"name": "Before 5 Chest Game",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2122,
				"y": 162
			}
		],
		"connector": "multichest",
		"interiorImage": "02F9",
	},
	"multichest_right": {
		"id": "multichest_right",
		"name": "After 5 Chest Game",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2218,
				"y": 194
			}
		],
		"connector": "multichest",
		"interiorImage": "02FA",
	},
	"multichest_top": {
		"id": "multichest_top",
		"name": "Outside 5 Chest Game",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2122,
				"y": 96
			}
		],
		"connector": "multichest",
		"interiorImage": "02F2",
	},
	"right_taltal_connector1": {
		"id": "right_taltal_connector1",
		"name": "Outer Rainbow Cave Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2316,
				"y": 130
			}
		],
		"connector": "outer_rainbow",
		"interiorImage": "0280-1",
	},
	"right_taltal_connector2": {
		"id": "right_taltal_connector2",
		"name": "Outer Rainbow Cave Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2462,
				"y": 130
			}
		],
		"connector": "outer_rainbow",
		"interiorImage": "0282",
	},
	"right_taltal_connector3": {
		"id": "right_taltal_connector3",
		"name": "Inner Rainbow Cave Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2380,
				"y": 130
			}
		],
		"connector": "inner_rainbow",
		"interiorImage": "0280-2",
	},
	"right_taltal_connector4": {
		"id": "right_taltal_connector4",
		"name": "Inner Rainbow Cave Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2510,
				"y": 178
			}
		],
		"connector": "inner_rainbow",
		"oneWayBlocked": true,
		"interiorImage": "0287",
	},
	"right_taltal_connector5": {
		"id": "right_taltal_connector5",
		"name": "Path to D7",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2542,
				"y": 130
			}
		],
		"connector": "to_d7",
		"interiorImage": "028C",
	},
	"right_taltal_connector6": {
		"id": "right_taltal_connector6",
		"name": "House Near D7",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2494,
				"y": 64
			}
		],
		"connector": "to_d7",
		"interiorImage": "028E",
	},
	"right_fairy": {
		"id": "right_fairy",
		"name": "Fairy Near D7",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 2478,
				"y": 194
			}
		]
	},
	"writes_cave_left": {
		"id": "writes_cave_left",
		"name": "Write Cave Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 128,
				"y": 292
			}
		],
		"connector": "write",
		"interiorImage": "02AE",
	},
	"writes_cave_right": {
		"id": "writes_cave_right",
		"name": "Write Cave Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 178,
				"y": 292
			}
		],
		"connector": "write",
		"interiorImage": "02AF",
	},
	"writes_house": {
		"id": "writes_house",
		"name": "Mr. Write's House",
		"index": 0,
		"icon": "",
		"type": "trade",
		"locations": [
			{
				"map": "overworld",
				"x": 112,
				"y": 422
			}
		],
		"interiorImage": "02A8",
	},
	"writes_phone": {
		"id": "writes_phone",
		"name": "Swamp Phone",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 258,
				"y": 454
			}
		]
	},
	"moblin_cave": {
		"id": "moblin_cave",
		"name": "Moblin Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 906,
				"y": 454
			}
		],
		"interiorImage": "02F0",
	},
	"photo_house": {
		"id": "photo_house",
		"name": "Photo House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1198,
				"y": 438
			}
		]
	},
	"mambo": {
		"id": "mambo",
		"name": "Manbo's Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1716,
				"y": 292
			}
		],
	    "interiorImage":"02FD",
	},
	"heartpiece_swim_cave": {
		"id": "heartpiece_swim_cave",
		"name": "Damp Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 2348,
				"y": 276
			}
		],
		"interiorImage": "01F2",
	},
	"raft_return_exit": {
		"id": "raft_return_exit",
		"name": "Raft Return Exit",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2446,
				"y": 356
			}
		],
		"connector": "raft_return",
		"oneWayBlocked": true,
		"interiorImage": "01E7",
	},
	"raft_house": {
		"id": "raft_house",
		"name": "Raft Hut",
		"index": 0,
		"icon": "",
		"type": "insanity",
		"locations": [
			{
				"map": "overworld",
				"x": 2462,
				"y": 406
			}
		],
		"interiorImage": "02B0",
	},
	"raft_return_enter": {
		"id": "raft_return_enter",
		"name": "Raft Return Entrance",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2430,
				"y": 1056
			}
		],
		"connector": "raft_return",
		"interiorImage": "01F7",
	},
	"hookshot_cave": {
		"id": "hookshot_cave",
		"name": "Hookshot Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 372,
				"y": 568
			}
		],
		"interiorImage": "02B3",
	},
	"toadstool_exit": {
		"id": "toadstool_exit",
		"name": "Log Cave Mushroom Side",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 128,
				"y": 682
			}
		],
		"connector": "log_cave",
		"interiorImage": "02AB",
	},
	"forest_madbatter": {
		"id": "forest_madbatter",
		"name": "Mad Batter - Forest",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 436,
				"y": 682
			}
		],
		"interiorImage": "01E1",
	},
	"toadstool_entrance": {
		"id": "toadstool_entrance",
		"name": "Log Cave Entrance",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 436,
				"y": 828
			}
		],
		"connector": "log_cave",
		"interiorImage": "02BD",
	},
	"crazy_tracy": {
		"id": "crazy_tracy",
		"name": "Crazy Tracy's Hut",
		"index": 0,
		"icon": "",
		"type": "hell",
		"locations": [
			{
				"map": "overworld",
				"x": 938,
				"y": 568
			}
		],
		"interiorImage": "02AD",
	},
	"witch": {
		"id": "witch",
		"name": "Witch's Hut",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 874,
				"y": 812
			}
		],
		"interiorImage": "02A2",
	},
	"graveyard_cave_left": {
		"id": "graveyard_cave_left",
		"name": "Graveyard Connector Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 858,
				"y": 958
			}
		],
		"connector": "graveyard",
		"interiorImage": "02DE",
	},
	"graveyard_cave_right": {
		"id": "graveyard_cave_right",
		"name": "Graveyard Connector Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1068,
				"y": 958
			}
		],
		"connector": "graveyard",
		"interiorImage": "02DF",
	},
	"castle_jump_cave": {
		"id": "castle_jump_cave",
		"name": "Kanlet Jump Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1328,
				"y": 1006
			}
		],
		"interiorImage": "01FD",
	},
	"castle_main_entrance": {
		"id": "castle_main_entrance",
		"name": "Kanalet Front Door",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1538,
				"y": 828
			}
		],
		"connector": "castle",
		"interiorImage": "02D3",
	},
	"castle_upper_left": {
		"id": "castle_upper_left",
		"name": "Kanalet Top Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1474,
				"y": 682
			}
		],
		"connector": "castle",
		"interiorImage": "02D6",
	},
	"castle_upper_right": {
		"id": "castle_upper_right",
		"name": "Kanalet Top Right",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1538,
				"y": 698
			}
		],
		"interiorImage": "02D5",
	},
	"castle_secret_exit": {
		"id": "castle_secret_exit",
		"name": "Kanalet Tunnel Exit",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1554,
				"y": 584
			}
		],
		"connector": "secret_tunnel",
		"interiorImage": "01EB",
	},
	"castle_secret_entrance": {
		"id": "castle_secret_entrance",
		"name": "Kanalet Tunnel Entrance",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1748,
				"y": 552
			}
		],
		"connector": "secret_tunnel",
		"interiorImage": "01EC",
	},
	"castle_phone": {
		"id": "castle_phone",
		"name": "Kanalet Phone",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1846,
				"y": 536
			}
		]
	},
	"papahl_house_left": {
		"id": "papahl_house_left",
		"name": "Quadruplets' House Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 404,
				"y": 1104
			}
		],
		"connector": "quadruplets",
		"interiorImage": "02A5",
	},
	"papahl_house_right": {
		"id": "papahl_house_right",
		"name": "Quadruplets' House Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 436,
				"y": 1104
			}
		],
		"connector": "quadruplets",
		"interiorImage": "02A6",
	},
	"dream_hut": {
		"id": "dream_hut",
		"name": "Dream Hut",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 518,
				"y": 1088
			}
		],
		"interiorImage": "02AA",
	},
	"rooster_grave": {
		"id": "rooster_grave",
		"name": "Rooster's Grave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 404,
				"y": 1234
			}
		],
		"interiorImage": "01E4",
	},
	"shop": {
		"id": "shop",
		"name": "Town Tool Shop",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 550,
				"y": 1250
			}
		],
		"interiorImage": "02A1",
	},
	"madambowwow": {
		"id": "madambowwow",
		"name": "Madam MeowMeow's House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 210,
				"y": 1348
			}
		]
	},
	"kennel": {
		"id": "kennel",
		"name": "Doghouse",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 242,
				"y": 1348
			}
		],
		"interiorImage": "02B2",
	},
	"start_house": {
		"id": "start_house",
		"name": "Marin and Tarin's House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 404,
				"y": 1364
			}
		]
	},
	"library": {
		"id": "library",
		"name": "Town Library",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 48,
				"y": 1462
			}
		]
	},
	"ulrira": {
		"id": "ulrira",
		"name": "Ulrira's House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 226,
				"y": 1510
			}
		]
	},
	"mabe_phone": {
		"id": "mabe_phone",
		"name": "Mabe Phone",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 404,
				"y": 1494
			}
		]
	},
	"trendy_shop": {
		"id": "trendy_shop",
		"name": "Trendy Game",
		"index": 0,
		"icon": "",
		"type": "trade",
		"locations": [
			{
				"map": "overworld",
				"x": 566,
				"y": 1494
			}
		],
		"interiorImage": "02A0",
	},
	"prairie_left_phone": {
		"id": "prairie_left_phone",
		"name": "Phone East of Mabe",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 696,
				"y": 1348
			}
		]
	},
	"prairie_left_cave1": {
		"id": "prairie_left_cave1",
		"name": "East of Mabe Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 792,
				"y": 1120
			}
		],
		"interiorImage": "02CD",
	},
	"prairie_left_cave2": {
		"id": "prairie_left_cave2",
		"name": "Boots 'n' Bomb Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 988,
				"y": 1088
			}
		],
		"interiorImage": "02F4",
	},
	"prairie_left_fairy": {
		"id": "prairie_left_fairy",
		"name": "Honeycomb Fairy",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1166,
				"y": 1040
			}
		]
	},
	"mamu": {
		"id": "mamu",
		"name": "Mamu's Staircase",
		"index": 0,
		"icon": "",
		"type": "insanity",
		"locations": [
			{
				"map": "overworld",
				"x": 776,
				"y": 1722
			}
		],
	    "interiorImage":"02FB",
	},
	"prairie_right_phone": {
		"id": "prairie_right_phone",
		"name": "Central Koholint Phone",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1376,
				"y": 1104
			}
		]
	},
	"seashell_mansion": {
		"id": "seashell_mansion",
		"name": "Seashell Mansion",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1700,
				"y": 1088
			}
		],
		"interiorImage": "02E9",
	},
	"prairie_right_cave_top": {
		"id": "prairie_right_cave_top",
		"name": "Martha's Bay Cliff Bottom Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1408,
				"y": 1510
			}
		],
		"connector": "bay_cliff",
		"interiorImage": "0292",
	},
	"prairie_right_cave_bottom": {
		"id": "prairie_right_cave_bottom",
		"name": "Martha's Bay Cliff Bottom Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1328,
				"y": 1624
			}
		],
		"connector": "bay_cliff",
		"interiorImage": "0293",
	},
	"prairie_right_cave_high": {
		"id": "prairie_right_cave_high",
		"name": "Martha's Bay Cliff Top",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1376,
				"y": 1462
			}
		],
		"connector": "bay_cliff",
		"interiorImage": "0295",
	},
	"prairie_to_animal_connector": {
		"id": "prairie_to_animal_connector",
		"name": "Under the River Left",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1748,
				"y": 1364
			}
		],
		"connector": "under_river",
		"interiorImage": "02D0",
	},
	"animal_to_prairie_connector": {
		"id": "animal_to_prairie_connector",
		"name": "Under the River Right",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1894,
				"y": 1364
			}
		],
		"connector": "under_river",
		"interiorImage": "02D1",
	},
	"d6_connector_exit": {
		"id": "d6_connector_exit",
		"name": "Cave Near D6",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2024,
				"y": 1170
			}
		],
		"connector": "d6",
		"interiorImage": "01F0",
	},
	"d6_connector_entrance": {
		"id": "d6_connector_entrance",
		"name": "Armos Island",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 2138,
				"y": 1202
			}
		],
		"connector": "d6",
		"interiorImage": "01F1",
	},
	"armos_fairy": {
		"id": "armos_fairy",
		"name": "Fairy Near D6",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 2154,
				"y": 1056
			}
		]
	},
	"armos_maze_cave": {
		"id": "armos_maze_cave",
		"name": "Armos Maze Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 2332,
				"y": 1380
			}
		],
		"interiorImage": "02FC",
	},
	"armos_temple": {
		"id": "armos_temple",
		"name": "Southern Shrine",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 2024,
				"y": 1348
			}
		],
		"interiorImage": "028F",
	},
	"boomerang_cave": {
		"id": "boomerang_cave",
		"name": "Boomerang Salesman Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 664,
				"y": 1966
			}
		],
		"interiorImage": "01F5",
	},
	"banana_seller": {
		"id": "banana_seller",
		"name": "Sale's Hut",
		"index": 0,
		"icon": "",
		"type": "trade",
		"locations": [
			{
				"map": "overworld",
				"x": 550,
				"y": 1852
			}
		],
	    "interiorImage": "02FE",
	},
	"ghost_house": {
		"id": "ghost_house",
		"name": "Ghost House",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1052,
				"y": 1998
			}
		],
		"interiorImage": "01E3",
	},
	"richard_house": {
		"id": "richard_house",
		"name": "Richard's Villa",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1036,
				"y": 1754
			}
		],
		"connector": "richard",
		"interiorImage": "02C7",
	},
	"richard_maze": {
		"id": "richard_maze",
		"name": "Pothole Field",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1020,
				"y": 1624
			}
		],
		"connector": "richard",
		"interiorImage": "02C8",
	},
	"prairie_low_phone": {
		"id": "prairie_low_phone",
		"name": "Martha's Bay Phone",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1344,
				"y": 1900
			}
		]
	},
	"prairie_madbatter_connector_entrance": {
		"id": "prairie_madbatter_connector_entrance",
		"name": "Bay Batter Connector Entrance",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1570,
				"y": 2014
			}
		],
		"connector": "bay_batter",
		"interiorImage": "01F6",
	},
	"prairie_madbatter_connector_exit": {
		"id": "prairie_madbatter_connector_exit",
		"name": "Bay Batter Connector Exit",
		"index": 0,
		"icon": "",
		"type": "connector",
		"locations": [
			{
				"map": "overworld",
				"x": 1230,
				"y": 1836
			}
		],
		"connector": "bay_batter",
		"interiorImage": "01E5",
	},
	"prairie_madbatter": {
		"id": "prairie_madbatter",
		"name": "Mad Batter - Bay",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 1036,
				"y": 1868
			}
		],
		"interiorImage": "01E0",
	},
	"animal_phone": {
		"id": "animal_phone",
		"name": "Animal Village Phone",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1894,
				"y": 1754
			}
		]
	},
	"animal_house1": {
		"id": "animal_house1",
		"name": "Animal Village Lefter House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 1976,
				"y": 1624
			}
		]
	},
	"animal_house2": {
		"id": "animal_house2",
		"name": "Animal Village Left House",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 2056,
				"y": 1624
			}
		]
	},
	"animal_house3": {
		"id": "animal_house3",
		"name": "Animal Village Goat House",
		"index": 0,
		"icon": "",
		"type": "trade",
		"locations": [
			{
				"map": "overworld",
				"x": 2138,
				"y": 1624
			}
		],
		"interiorImage": "02D9",
	},
	"animal_house4": {
		"id": "animal_house4",
		"name": "Animal Village Zora House",
		"index": 0,
		"icon": "",
		"type": "bingo",
		"locations": [
			{
				"map": "overworld",
				"x": 2186,
				"y": 1624
			}
		],
		"interiorImage": "02DA",
	},
	"animal_house5": {
		"id": "animal_house5",
		"name": "Animal Village Bear Chef's House",
		"index": 0,
		"icon": "",
		"type": "trade",
		"locations": [
			{
				"map": "overworld",
				"x": 2186,
				"y": 1738
			}
		],
		"interiorImage": "02D7",
	},
	"animal_cave": {
		"id": "animal_cave",
		"name": "Bomb Arrow Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 2234,
				"y": 1576
			}
		],
		"interiorImage": "02F7",
	},
	"desert_cave": {
		"id": "desert_cave",
		"name": "Desert Cave",
		"index": 0,
		"icon": "",
		"type": "single",
		"locations": [
			{
				"map": "overworld",
				"x": 2510,
				"y": 1560
			}
		],
		"interiorImage": "01F9",
	},
	"landfill": {
		"id": "landfill",
		"name": "Landfill",
		"index": 0,
		"icon": "",
		"type": "dummy",
		"locations": [
			{
				"map": "overworld",
				"x": 0,
				"y": 0
			}
		]
	},
}