var connectorDict = {
    "fire_cave": {
        "id": "fire_cave",
        "name": "Fire Cave",
        "entrances": [
            "fire_cave_exit",
            "fire_cave_entrance",
        ],
        "obstacleTypes": [
			"SHIELD2",
        ],
        "checks": [],
        "map": "overworld",
    },
    "west_taltal": {
        "id": "west_taltal",
        "name": "West TalTal",
        "entrances": [
            "left_to_right_taltalentrance",
            "left_taltal_entrance",
        ],
        "obstacleTypes": [
			"HOOKSHOT",
			"BOMBS",
            "ONEWAY",
        ],
        "checks": [
            "0x2BA",
        ],
        "map": "overworld",
    },
    "mountain_access": {
        "id": "mountain_access",
        "name": "Mountain Access",
        "entrances": [
            "obstacle_cave_entrance",
            "obstacle_cave_outside_chest",
            "obstacle_cave_exit",
        ],
        "obstacleTypes": [
			"SWORD",
			"BOOTS",
			"HOOKSHOT",
        ],
        "checks": [
            "0x2BB",
        ],
        "map": "overworld",
    },
    "papahl": {
        "id": "papahl",
        "name": "Path to Papahl",
        "entrances": [
            "papahl_entrance",
            "papahl_exit",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "overworld",
    },
    "multichest": {
        "id": "multichest",
        "name": "To Five Chest Game",
        "entrances": [
            "multichest_left",
            "multichest_right",
            "multichest_top",
        ],
        "obstacleTypes": [
			"BOMBS",
        ],
        "checks": [],
        "map": "overworld",
    },
    "outer_rainbow": {
        "id": "outer_rainbow",
        "name": "Outer Rainbow Cave",
        "entrances": [
            "right_taltal_connector1",
            "right_taltal_connector2",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "overworld",
    },
    "inner_rainbow": {
        "id": "inner_rainbow",
        "name": "Inner Rainbow Cave",
        "entrances": [
            "right_taltal_connector3",
            "right_taltal_connector4",
        ],
        "obstacleTypes": [
			"HOOKSHOT",
			"FEATHER",
            "ONEWAY",
        ],
        "checks": [],
        "map": "overworld",
    },
    "to_d7": {
        "id": "to_d7",
        "name": "Path to D7",
        "entrances": [
            "right_taltal_connector5",
            "right_taltal_connector6",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "overworld",
    },
    "write": {
        "id": "write",
        "name": "Write Cave",
        "entrances": [
            "writes_cave_left",
            "writes_cave_right",
        ],
        "obstacleTypes": [
            "HOOKSHOT",
            "BRACELET",
        ],
        "checks": [
            "0x2AF",
            "0x2AE",
        ],
        "map": "overworld",
    },
    "raft_return": {
        "id": "raft_return",
        "name": "Raft Return",
        "entrances": [
            "raft_return_exit",
            "raft_return_enter",
        ],
        "obstacleTypes": [
            "ONEWAY",
        ],
        "checks": [],
        "map": "overworld",
    },
    "log_cave": {
        "id": "log_cave",
        "name": "Forest Log Cave",
        "entrances": [
            "toadstool_exit",
            "toadstool_entrance",
        ],
        "obstacleTypes": [
            "SWORD",
            "BRACELET",
        ],
        "checks": [
            "0x2AB",
            "0x2BD",
        ],
        "map": "overworld",
    },
    "graveyard": {
        "id": "graveyard",
        "name": "Graveyard Connector",
        "entrances": [
            "graveyard_cave_left",
            "graveyard_cave_right",
        ],
        "obstacleTypes": [
			"FEATHER",
			"HOOKSHOT",
        ],
        "checks": [
            "0x2DF",
        ],
        "map": "overworld",
    },
    "castle": {
        "id": "castle",
        "name": "Kanalet Castle",
        "entrances": [
            "castle_upper_left",
            "castle_main_entrance",
        ],
        "obstacleTypes": [
			"BOMBS",
			"SWORD",
        ],
        "checks": [
            "0x2C5",
            "0x2D2",
            "0x2C6",
        ],
        "map": "overworld",
    },
    "secret_tunnel": {
        "id": "secret_tunnel",
        "name": "Kanalet Secret Tunnel",
        "entrances": [
            "castle_secret_exit",
            "castle_secret_entrance",
        ],
        "obstacleTypes": [
            "FEATHER",
        ],
        "checks": [],
        "map": "overworld",
    },
    "quadruplets": {
        "id": "quadruplets",
        "name": "Quadruplets' House",
        "entrances": [
            "papahl_house_left",
            "papahl_house_right",
        ],
        "obstacleTypes": [
            "YOSHI",
        ],
        "checks": [
            "0x2A6-Trade",
        ],
        "map": "overworld",
    },
    "bay_cliff": {
        "id": "bay_cliff",
        "name": "Martha's Bay Cliff",
        "entrances": [
            "prairie_right_cave_top",
            "prairie_right_cave_bottom",
            "prairie_right_cave_high",
        ],
        "obstacleTypes": [
            "BOMBS",
            "FEATHER",
        ],
        "checks": [],
        "map": "overworld",
    },
    "under_river": {
        "id": "under_river",
        "name": "Under the River",
        "entrances": [
            "prairie_to_animal_connector",
            "animal_to_prairie_connector",
        ],
        "obstacleTypes": [
            "BOOTS",
        ],
        "checks": [],
        "map": "overworld",
    },
    "d6": {
        "id": "d6",
        "name": "Path to D6",
        "entrances": [
            "d6_connector_exit",
            "d6_connector_entrance",
        ],
        "obstacleTypes": [
            "FLIPPERS",
            "HOOKSHOT",
        ],
        "checks": [],
        "map": "overworld",
    },
    "richard": {
        "id": "richard",
        "name": "Richard's Cave",
        "entrances": [
            "richard_house",
            "richard_maze",
        ],
        "obstacleTypes": [
            "FEATHER",
            "LEAVES",
        ],
        "checks": [
            "0x2C8",
        ],
        "map": "overworld",
    },
    "bay_batter": {
        "id": "bay_batter",
        "name": "Bay Mad Batter",
        "entrances": [
            "prairie_madbatter_connector_entrance",
            "prairie_madbatter_connector_exit",
        ],
        "obstacleTypes": [
            "FLIPPERS",
        ],
        "checks": [],
        "map": "overworld",
    },
    "d1_feather": {
        "id": "d1_feather",
        "name": "To Feather",
        "entrances": [
            "d1_feather_entrance",
            "d1_feather_exit",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d1",
    },
    "d2_miniboss": {
        "id": "d2_miniboss",
        "name": "To Miniboss",
        "entrances": [
            "d2_to_miniboss",
            "d2_from_miniboss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d2",
    },
    "d2_enemy_order": {
        "id": "d2_enemy_order",
        "name": "To Enemy Order",
        "entrances": [
            "d2_to_enemy_order",
            "d2_from_enemy_order",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d2",
    },
    "d2_boss": {
        "id": "d2_boss",
        "name": "To Boss",
        "entrances": [
            "d2_to_boss",
            "d2_from_boss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d2",
    },
    "d3_crossroads": {
        "id": "d3_crossroads",
        "name": "To Crossroads",
        "entrances": [
            "d3_to_crossroads",
            "d3_from_crossroads",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d3",
    },
    "d3_zols": {
        "id": "d3_zols",
        "name": "To Zols",
        "entrances": [
            "d3_to_zols",
            "d3_from_zols",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d3",
    },
    "d3_boss": {
        "id": "d3_boss",
        "name": "To Boss",
        "entrances": [
            "d3_to_boss",
            "d3_from_boss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d3",
    },
    "d4_nightmare_key": {
        "id": "d4_nightmare_key",
        "name": "To Nightmare Key",
        "entrances": [
            "d4_to_nightmare_key",
            "d4_from_nightmare_key",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d4",
    },
    "d4_boss": {
        "id": "d4_boss",
        "name": "To boss",
        "entrances": [
            "d4_to_boss",
            "d4_from_boss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d4",
    },
    "d5_ms_4": {
        "id": "d5_ms_4",
        "name": "To Master Stalfos Four",
        "entrances": [
            "d5_to_ms_4",
            "d5_from_ms_4",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d5",
    },
    "d5_nightmare_key": {
        "id": "d5_nightmare_key",
        "name": "To Nightmare Key",
        "entrances": [
            "d5_to_nightmare_key",
            "d5_from_nightmare_key",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d5",
    },
    "d5_boss": {
        "id": "d5_boss",
        "name": "To Boss",
        "entrances": [
            "d5_to_boss",
            "d5_from_boss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d5",
    },
    "d5_owl": {
        "id": "d5_owl",
        "name": "To Owl",
        "entrances": [
            "d5_to_owl",
            "d5_from_owl",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d5",
    },
    "d6_bracelet": {
        "id": "d6_bracelet",
        "name": "To Bracelet",
        "entrances": [
            "d6_to_bracelet",
            "d6_from_bracelet",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d6",
    },
    "d6_boss": {
        "id": "d6_boss",
        "name": "To Boss",
        "entrances": [
            "d6_to_boss",
            "d6_from_boss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d6",
    },
    "d6_nightmare_key": {
        "id": "d6_nightmare_key",
        "name": "To Nightmare Key",
        "entrances": [
            "d6_to_nightmare_key",
            "d6_from_nightmare_key",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d6",
    },
    "d7_ball": {
        "id": "d7_ball",
        "name": "To Ball",
        "entrances": [
            "d7_to_ball",
            "d7_from_ball",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d7",
    },
    "d7_pillar_1": {
        "id": "d7_pillar_1",
        "name": "To Pillar One",
        "entrances": [
            "d7_to_pillar_1",
            "d7_from_pillar_1",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d7",
    },
    "d7_three_of_a_kind": {
        "id": "d7_three_of_a_kind",
        "name": "To Three of a Kind",
        "entrances": [
            "d7_to_three_of_a_kind",
            "d7_from_three_of_a_kind",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d7",
    },
    "d7_hinox": {
        "id": "d7_hinox",
        "name": "To Hinox",
        "entrances": [
            "d7_to_hinox",
            "d7_from_hinox",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d7",
    },
    "d7_top": {
        "id": "d7_top",
        "name": "To Top",
        "entrances": [
            "d7_to_top",
            "d7_from_top",
            "d7_from_3f",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d7",
    },
    "d8_mimic": {
        "id": "d8_mimic",
        "name": "To Mimic",
        "entrances": [
            "d8_to_mimic",
            "d8_from_mimic",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
    "d8_nightmare_key": {
        "id": "d8_nightmare_key",
        "name": "To Nightmare Key",
        "entrances": [
            "d8_to_nightmare_key",
            "d8_from_nightmare_key",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
    "d8_boss": {
        "id": "d8_boss",
        "name": "To Boss",
        "entrances": [
            "d8_to_boss",
            "d8_from_boss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
    "d8_miniboss": {
        "id": "d8_miniboss",
        "name": "To Miniboss",
        "entrances": [
            "d8_to_miniboss",
            "d8_from_miniboss",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
    "d8_ropes": {
        "id": "d8_ropes",
        "name": "To Ropes",
        "entrances": [
            "d8_to_ropes",
            "d8_from_ropes",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
    "d8_back": {
        "id": "d8_back",
        "name": "To Back",
        "entrances": [
            "d8_to_back",
            "d8_from_back",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
    "d8_pickups": {
        "id": "d8_pickups",
        "name": "To Pickups",
        "entrances": [
            "d8_to_pickups",
            "d8_from_pickups",
        ],
        "obstacleTypes": [],
        "checks": [],
        "map": "d8",
    },
}

var connectors = Object.values(connectorDict);