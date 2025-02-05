"use strict"

let bosses = [
    {
        'id': 'b0',
        'name': 'Hardhit Beetle',
        'value': 8,
        'type': 'boss',
        'locations': [
            {
                "map": "d0",
                "x": 72,
                "y": 40
            },
        ],
    },
    {
        'id': 'b1',
        'name': 'Moldorm',
        'value': 0,
        'type': 'boss',
        'locations': [
            {
                "map": "d1",
                "x": 1008,
                "y": 160
            },
        ],
    },
    {
        'id': 'b2',
        'name': 'Genie',
        'value': 1,
        'type': 'boss',
        'locations': [
            {
                "map": "d2",
                "x": 872,
                "y": 272
            },
        ],
    },
    {
        'id': 'b3',
        'name': 'Slime Eye',
        'value': 2,
        'type': 'boss',
        'locations': [
            {
                "map": "d3",
                "x": 872,
                "y": 816
            },
        ],
    },
    {
        'id': 'b4',
        'name': 'Angler Fish',
        'value': 3,
        'type': 'boss',
        'locations': [
            {
                "map": "d4",
                "x": 72,
                "y": 288
            },
        ],
    },
    {
        'id': 'b5',
        'name': 'Slime Eel',
        'value': 4,
        'type': 'boss',
        'locations': [
            {
                "map": "d5",
                "x": 392,
                "y": 184
            },
        ],
    },
    {
        'id': 'b6',
        'name': 'Facade',
        'value': 5,
        'type': 'boss',
        'locations': [
            {
                "map": "d6",
                "x": 712,
                "y": 312
            },
        ],
    },
    {
        'id': 'b7',
        'name': 'Evil Eagle',
        'value': 6,
        'type': 'boss',
        'locations': [
            {
                "map": "d7",
                "x": 976,
                "y": 240
            },
        ],
    },
    {
        'id': 'b8',
        'name': 'Hothead',
        'value': 7,
        'type': 'boss',
        'locations': [
            {
                "map": "d8",
                "x": 552,
                "y": 176
            },
        ],
    },
    {
        'id': 'mc1',
        'name': 'Avalaunch',
        'key': 'c1',
        'value': 'AVALAUNCH',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d0",
                "x": 552,
                "y": 272
            },
        ],
    },
    {
        'id': 'mc2',
        'name': 'Giant Buzz Blob',
        'key': 'c2',
        'value': 'GIANT_BUZZ_BLOB',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d0",
                "x": 872,
                "y": 32
            },
        ],
    },
    {
        'id': 'm0',
        'name': 'Rolling Bones',
        'key': 0,
        'value': 'ROLLING_BONES',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d1",
                "x": 1088,
                "y": 432
            },
        ],
    },
    {
        'id': 'm1',
        'name': 'Hinox',
        'key': 1,
        'value': 'HINOX',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d2",
                "x": 80,
                "y": 280
            },
        ],
    },
    {
        'id': 'm2',
        'name': 'Dodongo Snakes',
        'key': 2,
        'value': 'DODONGO',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d3",
                "x": 224,
                "y": 160
            },
        ],
    },
    {
        'id': 'm3',
        'name': 'Cueball',
        'key': 3,
        'value': 'CUE_BALL',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d4",
                "x": 600,
                "y": 160
            },
        ],
    },
    {
        'id': 'm4',
        'name': 'Gohma',
        'key': 4,
        'value': 'GHOMA',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d5",
                "x": 352,
                "y": 576
            },
        ],
    },
    {
        'id': 'm5',
        'name': 'Smasher',
        'key': 5,
        'value': 'SMASHER',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d6",
                "x": 912,
                "y": 440
            }
        ],
    },
    {
        'id': 'm6',
        'name': 'Grim Creeper',
        'key': 6,
        'value': 'GRIM_CREEPER',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d7",
                "x": 1192,
                "y": 272
            },
            {
                "map": "d7",
                "x": 1192,
                "y": 784
            }
        ],
    },
    {
        'id': 'm7',
        'name': 'Blaino',
        'key': 7,
        'value': 'BLAINO',
        'type': 'miniboss',
        'locations': [
            {
                "map": "d8",
                "x": 1192,
                "y": 280,
            }
        ]
    },
    {
        'id': 'moblin_cave',
        'name': 'Moblin King',
        'key': 'moblin_cave',
        'value': 'MOBLIN_KING',
        'type': 'miniboss',
        'locations': [
            {
                "map": "overworld",
                "x": 906,
                "y": 374,
            },
        ],
    },
    {
        'id': 'armos_temple',
        'name': 'Armos Knight',
        'key': 'armos_temple',
        'value': 'ARMOS_KNIGHT',
        'type': 'miniboss',
        'locations': [
            {
                "map": "overworld",
                "x": 2024,
                "y": 1266,
            },
        ],
    },
];

var bossDataDict = {};

for (const boss of bosses) {
    bossDataDict[boss.id] = boss;
}

window.bosses = bosses;
window.bossDataDict = bossDataDict;