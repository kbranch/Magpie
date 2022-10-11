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
    },
    "richard": {
        "id": "richard",
        "name": "Richard's Cave",
        "entrances": [
            "richard_maze",
            "richard_house",
        ],
        "obstacleTypes": [
            "FEATHER",
            "LEAVES",
        ],
        "checks": [
            "0x2C8",
        ],
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
    },
}

var connectors = Object.values(connectorDict);