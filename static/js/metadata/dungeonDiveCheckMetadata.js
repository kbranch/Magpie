"use strict"

let dungeonDiveCoordDict = {
    "0x092":{
       "id":"0x092",
       "area":"Mabe Village",
       "name":"Ballad of the Wind Fish",
       "locations":[
          {
             "map":"overworld",
             "x":48,
             "y":698
          },
       ],
       "index":17,
    },
    "0x2A1-1":{
       "id":"0x2A1-1",
       "area":"Mabe Village",
       "name":"Shop 980 Item",
       "locations":[
          {
             "map":"overworld",
             "x":210,
             "y":454
          },
          {
              "map": "underworld",
              "x": 510,
              "y": 1202
          }
       ],
       "index":248,
       "requiredRupees": 980,
    },
    "0x2A1-0":{
       "id":"0x2A1-0",
       "area":"Mabe Village",
       "name":"Shop 200 Item",
       "locations":[
          {
             "map":"overworld",
             "x":210,
             "y":454
          },
          {
              "map": "underworld",
              "x": 510,
              "y": 1202
          }
       ],
       "index":249,
       "requiredRupees": 200,
    },
    "0x2A3":{
       "id":"0x2A3",
       "area":"Mabe Village",
       "name":"Tarin's Gift",
       "locations":[
          {
             "map":"overworld",
             "x":242,
             "y":584
          },
          {
              "map": "underworld",
              "x": 436,
              "y": 1364
          }
       ],
       "index":253,
    },
    "0x0F2":{
       "id":"0x0F2",
       "area":"Toronbo Shores",
       "name":"Sword on the Beach",
       "locations":[
          {
             "map":"overworld",
             "x":242,
             "y":730
          }
       ],
       "index":22,
    },
    "0x1F5":{
       "id":"0x1F5",
       "area":"Toronbo Shores",
       "name":"Boomerang Guy Item",
       "locations":[
          {
             "map":"overworld",
             "x":404,
             "y":682
          },
          {
              "map": "underworld",
              "x": 720,
              "y": 1966
          }
       ],
       "index":254,
       "linkedItem": "TRADING_ITEM_MAGNIFYING_GLASS_CHECKED",
    },
    "0x1E1":{
       "id":"0x1E1",
       "area":"Mysterious Woods",
       "name":"Mad Batter",
       "locations":[
          {
             "map":"overworld",
             "x":64,
             "y":666
          },
          {
              "map": "underworld",
              "x": 388,
              "y": 698
          }
       ],
       "index":81,
    },
  "0x30A-Owl": {
    "id": "0x30A-Owl",
    "area": "Color Dungeon",
    "name": "Puzzowl",
    "locations": [
      {
        "map": "d0",
        "x": 208,
        "y": 256
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 10
  },
  "0x307": {
    "id": "0x307",
    "area": "Color Dungeon",
    "name": "Bullshit Room",
    "locations": [
      {
        "map": "d0",
        "x": 544,
        "y": 176
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 9
  },
  "0x306": {
    "id": "0x306",
    "area": "Color Dungeon",
    "name": "Zol Chest",
    "locations": [
      {
        "map": "d0",
        "x": 448,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 8
  },
  "0x302": {
    "id": "0x302",
    "area": "Color Dungeon",
    "name": "Nightmare Key Chest",
    "locations": [
      {
        "map": "d0",
        "x": 704,
        "y": 16
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 7
  },
  "0x311": {
    "id": "0x311",
    "area": "Color Dungeon",
    "name": "Two Socket Chest",
    "locations": [
      {
        "map": "d0",
        "x": 768,
        "y": 416
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 3
  },
  "0x30F": {
    "id": "0x30F",
    "area": "Color Dungeon",
    "name": "Entrance Chest",
    "locations": [
      {
        "map": "d0",
        "x": 448,
        "y": 416
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 1
  },
  "0x30F-Owl": {
    "id": "0x30F-Owl",
    "area": "Color Dungeon",
    "name": "Entrance Owl",
    "locations": [
      {
        "map": "d0",
        "x": 400,
        "y": 384
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 2
  },
  "0x308": {
    "id": "0x308",
    "area": "Color Dungeon",
    "name": "Upper Small Key",
    "locations": [
      {
        "map": "d0",
        "x": 720,
        "y": 176
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 5
  },
  "0x308-Owl": {
    "id": "0x308-Owl",
    "area": "Color Dungeon",
    "name": "Upper Key Owl",
    "locations": [
      {
        "map": "d0",
        "x": 704,
        "y": 128
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 6
  },
  "0x314": {
    "id": "0x314",
    "area": "Color Dungeon",
    "name": "Lower Small Key",
    "locations": [
      {
        "map": "d0",
        "x": 512,
        "y": 592
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 4
  },
  "0x30E": {
    "id": "0x30E",
    "area": "Color Dungeon",
    "name": "Pot Powder",
    "locations": [
      {
        "map": "d0",
        "x": 176,
        "y": 400
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 0,
    "vanilla": true,
    "vanillaItem": "MAGIC_POWDER"
  },
  "0x230": {
    "id": "0x230",
    "area": "Turtle Rock",
    "name": "Thunder Drum",
    "locations": [
      {
        "map": "d8",
        "x": 552,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 23,
    "linkedItem": "INSTRUMENT8",
    "vanillaLink": "true"
  },
  "0x234": {
    "id": "0x234",
    "area": "Turtle Rock",
    "name": "Hot Head Heart Container",
    "locations": [
      {
        "map": "d8",
        "x": 552,
        "y": 224
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 22
  },
  "0x232": {
    "id": "0x232",
    "area": "Turtle Rock",
    "name": "Nightmare Key/Big Zamboni Chest",
    "locations": [
      {
        "map": "d8",
        "x": 128,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 15
  },
  "0x23A": {
    "id": "0x23A",
    "area": "Turtle Rock",
    "name": "West of Boss Door Ledge Chest",
    "locations": [
      {
        "map": "d8",
        "x": 448,
        "y": 272
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 17
  },
  "0x241-Owl": {
    "id": "0x241-Owl",
    "area": "Turtle Rock",
    "name": "Lava Arrow Statue Owl",
    "locations": [
      {
        "map": "d8",
        "x": 416,
        "y": 384
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 13
  },
  "0x241": {
    "id": "0x241",
    "area": "Turtle Rock",
    "name": "Lava Arrow Statue Key",
    "locations": [
      {
        "map": "d8",
        "x": 352,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 12
  },
  "0x000": {
    "id": "0x000",
    "area": "Tal Tal Mountains",
    "name": "Outside D8 Heart Piece",
    "locations": [
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      },
      {
        "map": "d8",
        "x": 400,
        "y": 256
      },
    ],
    "index": 16
  },
  "0x23D": {
    "id": "0x23D",
    "area": "Turtle Rock",
    "name": "Dodongo Chest",
    "locations": [
      {
        "map": "d8",
        "x": 928,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 20
  },
  "0x240": {
    "id": "0x240",
    "area": "Turtle Rock",
    "name": "Beamos Blocked Chest",
    "locations": [
      {
        "map": "d8",
        "x": 256,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 14
  },
  "0x237": {
    "id": "0x237",
    "area": "Turtle Rock",
    "name": "Magic Rod Chest",
    "locations": [
      {
        "map": "d8",
        "x": 1168,
        "y": 144
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 11
  },
  "0x235": {
    "id": "0x235",
    "area": "Turtle Rock",
    "name": "Lava Ledge Chest",
    "locations": [
      {
        "map": "d8",
        "x": 688,
        "y": 144
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 21
  },
  "0x2352": {
    "id": "0x2352",
    "area": "Turtle Rock",
    "name": "Lava Ledge Flying Powder",
    "locations": [
      {
        "map": "d8",
        "x": 752,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 21,
    "vanilla": true,
    "vanillaItem": "MAGIC_POWDER"
  },
  "0x23E": {
    "id": "0x23E",
    "area": "Turtle Rock",
    "name": "Gibdos on Cracked Floor Key",
    "locations": [
      {
        "map": "d8",
        "x": 992,
        "y": 304
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 18
  },
  "0x23E2": {
    "id": "0x23E2",
    "area": "Turtle Rock",
    "name": "Cracked Floor Flying Powder",
    "locations": [
      {
        "map": "d8",
        "x": 1040,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 18,
    "vanilla": true,
    "vanillaItem": "MAGIC_POWDER"
  },
  "0x245-Owl": {
    "id": "0x245-Owl",
    "area": "Turtle Rock",
    "name": "Bombable Blocks Owl",
    "locations": [
      {
        "map": "d8",
        "x": 1072,
        "y": 384
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 19
  },
  "0x25F": {
    "id": "0x25F",
    "area": "Turtle Rock",
    "name": "Four Ropes Pot Chest",
    "locations": [
      {
        "map": "d8",
        "x": 1248,
        "y": 928
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 9
  },
  "0x25A": {
    "id": "0x25A",
    "area": "Turtle Rock",
    "name": "Zamboni, Two Zol Key",
    "locations": [
      {
        "map": "d8",
        "x": 992,
        "y": 816
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 7
  },
  "0x259": {
    "id": "0x259",
    "area": "Turtle Rock",
    "name": "Right Lava Chest",
    "locations": [
      {
        "map": "d8",
        "x": 864,
        "y": 832
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 6
  },
  "0x258": {
    "id": "0x258",
    "area": "Turtle Rock",
    "name": "Pot Flying Powder",
    "locations": [
      {
        "map": "d8",
        "x": 720,
        "y": 832
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 6,
    "vanilla": true,
    "vanillaItem": "MAGIC_POWDER"
  },
  "0x253-Owl": {
    "id": "0x253-Owl",
    "area": "Turtle Rock",
    "name": "Beamos Owl",
    "locations": [
      {
        "map": "d8",
        "x": 1136,
        "y": 720
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 8
  },
  "0x246": {
    "id": "0x246",
    "area": "Turtle Rock",
    "name": "Two Torches Room Chest",
    "locations": [
      {
        "map": "d8",
        "x": 288,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 2
  },
  "0x255": {
    "id": "0x255",
    "area": "Turtle Rock",
    "name": "Spark, Pit Chest",
    "locations": [
      {
        "map": "d8",
        "x": 256,
        "y": 800
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 3
  },
  "0x24C": {
    "id": "0x24C",
    "area": "Turtle Rock",
    "name": "Left Vire Key",
    "locations": [
      {
        "map": "d8",
        "x": 32,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 4
  },
  "0x25C": {
    "id": "0x25C",
    "area": "Turtle Rock",
    "name": "Vacuum Mouth Chest",
    "locations": [
      {
        "map": "d8",
        "x": 64,
        "y": 944
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 5
  },
  "0x24D": {
    "id": "0x24D",
    "area": "Turtle Rock",
    "name": "Left of Hinox Zamboni Chest",
    "locations": [
      {
        "map": "d8",
        "x": 288,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 1
  },
  "0x24F": {
    "id": "0x24F",
    "area": "Turtle Rock",
    "name": "Push Block Chest",
    "locations": [
      {
        "map": "d8",
        "x": 528,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 146
      }
    ],
    "index": 10
  },
  "0x22C": {
    "id": "0x22C",
    "area": "Eagle's Tower",
    "name": "Organ of Evening Calm",
    "locations": [
      {
        "map": "d7",
        "x": 1032,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 141,
    "linkedItem": "INSTRUMENT7",
    "vanillaLink": "true"
  },
  "0x223": {
    "id": "0x223",
    "area": "Eagle's Tower",
    "name": "Evil Eagle Heart Container",
    "locations": [
      {
        "map": "d7",
        "x": 976,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 140
  },
  "0x220": {
    "id": "0x220",
    "area": "Eagle's Tower",
    "name": "Conveyor Beamos Chest",
    "locations": [
      {
        "map": "d7",
        "x": 1088,
        "y": 32
      },
      {
        "map": "d7",
        "x": 1088,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 139
  },
  "0x21A": {
    "id": "0x21A",
    "area": "Eagle's Tower",
    "name": "Mirror Shield Chest",
    "locations": [
      {
        "map": "d7",
        "x": 528,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 127
  },
  "0x224": {
    "id": "0x224",
    "area": "Eagle's Tower",
    "name": "Nightmare Key/After Grim Creeper Chest",
    "locations": [
      {
        "map": "d7",
        "x": 1248,
        "y": 160
      },
      {
        "map": "d7",
        "x": 1248,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 138
  },
  "0x21C": {
    "id": "0x21C",
    "area": "Eagle's Tower",
    "name": "Three of a Kind, Pit Chest",
    "locations": [
      {
        "map": "d7",
        "x": 288,
        "y": 416
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 137
  },
  "0x21C-Owl": {
    "id": "0x21C-Owl",
    "area": "Eagle's Tower",
    "name": "Three of a Kind, Pit Owl",
    "locations": [
      {
        "map": "d7",
        "x": 176,
        "y": 384
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 136
  },
  "0x201": {
    "id": "0x201",
    "area": "Eagle's Tower",
    "name": "Kirby Ledge Chest",
    "locations": [
      {
        "map": "d7",
        "x": 16,
        "y": 528
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 134
  },
  "0x21B": {
    "id": "0x21B",
    "area": "Eagle's Tower",
    "name": "Hinox Key",
    "locations": [
      {
        "map": "d7",
        "x": 32,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 133
  },
  "0x211": {
    "id": "0x211",
    "area": "Eagle's Tower",
    "name": "Three of a Kind, No Pit Chest",
    "locations": [
      {
        "map": "d7",
        "x": 288,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 130
  },
  "0x209": {
    "id": "0x209",
    "area": "Eagle's Tower",
    "name": "Switch Wrapped Chest",
    "locations": [
      {
        "map": "d7",
        "x": 80,
        "y": 800
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 135
  },
  "0x204": {
    "id": "0x204",
    "area": "Eagle's Tower",
    "name": "Beamos Ledge Chest",
    "locations": [
      {
        "map": "d7",
        "x": 608,
        "y": 528
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 131
  },
  "0x204-Owl": {
    "id": "0x204-Owl",
    "area": "Eagle's Tower",
    "name": "Beamos Owl",
    "locations": [
      {
        "map": "d7",
        "x": 544,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 132
  },
  "0x212": {
    "id": "0x212",
    "area": "Eagle's Tower",
    "name": "Horse Head, Bubble Chest",
    "locations": [
      {
        "map": "d7",
        "x": 448,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 129
  },
  "0x216-Owl": {
    "id": "0x216-Owl",
    "area": "Eagle's Tower",
    "name": "Ball Owl",
    "locations": [
      {
        "map": "d7",
        "x": 496,
        "y": 128
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 128
  },
  "0x210": {
    "id": "0x210",
    "area": "Eagle's Tower",
    "name": "Entrance Key",
    "locations": [
      {
        "map": "d7",
        "x": 512,
        "y": 944
      },
      {
        "map": "overworld",
        "x": 242,
        "y": 32
      }
    ],
    "index": 126
  },
  "0x1B5": {
    "id": "0x1B5",
    "area": "Face Shrine",
    "name": "Coral Triangle",
    "locations": [
      {
        "map": "d6",
        "x": 712,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 160,
    "linkedItem": "INSTRUMENT6",
    "vanillaLink": "true"
  },
  "0x1BC": {
    "id": "0x1BC",
    "area": "Face Shrine",
    "name": "Facade Heart Container",
    "locations": [
      {
        "map": "d6",
        "x": 712,
        "y": 352
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 159
  },
  "0x1B6": {
    "id": "0x1B6",
    "area": "Face Shrine",
    "name": "Pot Locked Chest",
    "locations": [
      {
        "map": "d6",
        "x": 1008,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 157
  },
  "0x1B6-Owl": {
    "id": "0x1B6-Owl",
    "area": "Face Shrine",
    "name": "Pot Owl",
    "locations": [
      {
        "map": "d6",
        "x": 1024,
        "y": 128
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 158
  },
  "0x1B1": {
    "id": "0x1B1",
    "area": "Face Shrine",
    "name": "Top Right Horse Heads Chest",
    "locations": [
      {
        "map": "d6",
        "x": 1152,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 156
  },
  "0x1C3": {
    "id": "0x1C3",
    "area": "Face Shrine",
    "name": "Tile Room Key",
    "locations": [
      {
        "map": "d6",
        "x": 512,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 155
  },
  "0x1D7-Owl": {
    "id": "0x1D7-Owl",
    "area": "Face Shrine",
    "name": "Blade Trap Owl",
    "locations": [
      {
        "map": "d6",
        "x": 976,
        "y": 768
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 152
  },
  "0x1D1": {
    "id": "0x1D1",
    "area": "Face Shrine",
    "name": "Four Wizrobe Ledge Chest",
    "locations": [
      {
        "map": "d6",
        "x": 1088,
        "y": 720
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 153
  },
  "0x1BE": {
    "id": "0x1BE",
    "area": "Face Shrine",
    "name": "Water Tektite Chest",
    "locations": [
      {
        "map": "d6",
        "x": 1056,
        "y": 272
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 154
  },
  "0x06C": {
    "id": "0x06C",
    "area": "Rapids Ride",
    "name": "Outside D6 Chest",
    "locations": [
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      },
      {
        "map": "d6",
        "x": 112,
        "y": 0
      },
    ],
    "index": 151
  },
  "0x1B0": {
    "id": "0x1B0",
    "area": "Face Shrine",
    "name": "Top Left Horse Heads Chest",
    "locations": [
      {
        "map": "d6",
        "x": 112,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 150
  },
  "0x1B4": {
    "id": "0x1B4",
    "area": "Face Shrine",
    "name": "Two Wizrobe Key",
    "locations": [
      {
        "map": "d6",
        "x": 512,
        "y": 176
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 149
  },
  "0x1B3": {
    "id": "0x1B3",
    "area": "Face Shrine",
    "name": "Switch, Star Above Statues Chest",
    "locations": [
      {
        "map": "d6",
        "x": 208,
        "y": 192
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 148
  },
  "0x1B9": {
    "id": "0x1B9",
    "area": "Face Shrine",
    "name": "Stairs Across Statues Chest",
    "locations": [
      {
        "map": "d6",
        "x": 208,
        "y": 272
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 147
  },
  "0x1C0": {
    "id": "0x1C0",
    "area": "Face Shrine",
    "name": "Three Wizrobe, Switch Chest",
    "locations": [
      {
        "map": "d6",
        "x": 128,
        "y": 416
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 146
  },
  "0x1CE": {
    "id": "0x1CE",
    "area": "Face Shrine",
    "name": "L2 Bracelet Chest",
    "locations": [
      {
        "map": "d6",
        "x": 176,
        "y": 656
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 144
  },
  "0x1BB-Owl": {
    "id": "0x1BB-Owl",
    "area": "Face Shrine",
    "name": "Corridor Owl",
    "locations": [
      {
        "map": "d6",
        "x": 560,
        "y": 336
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 145
  },
  "0x1C9": {
    "id": "0x1C9",
    "area": "Face Shrine",
    "name": "Flying Heart, Statue Chest",
    "locations": [
      {
        "map": "d6",
        "x": 432,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 143
  },
  "0x1CF": {
    "id": "0x1CF",
    "area": "Face Shrine",
    "name": "Mini-Moldorm, Spark Chest",
    "locations": [
      {
        "map": "d6",
        "x": 432,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 170
      }
    ],
    "index": 142
  },
  "0x182": {
    "id": "0x182",
    "area": "Catfish's Maw",
    "name": "Wind Marimba",
    "locations": [
      {
        "map": "d5",
        "x": 392,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 176,
    "linkedItem": "INSTRUMENT5",
    "vanillaLink": "true"
  },
  "0x185": {
    "id": "0x185",
    "area": "Catfish's Maw",
    "name": "Slime Eel Heart Container",
    "locations": [
      {
        "map": "d5",
        "x": 392,
        "y": 224
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 175
  },
  "0x186": {
    "id": "0x186",
    "area": "Catfish's Maw",
    "name": "Nightmare Key/Torch Cross Chest",
    "locations": [
      {
        "map": "d5",
        "x": 720,
        "y": 320
      },
      {
        "map": "d5",
        "x": 512,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 168
  },
  "0x183": {
    "id": "0x183",
    "area": "Catfish's Maw",
    "name": "Three Stalfos Chest",
    "locations": [
      {
        "map": "d5",
        "x": 544,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 172
  },
  "0x180": {
    "id": "0x180",
    "area": "Catfish's Maw",
    "name": "Master Stalfos Item",
    "locations": [
      {
        "map": "d5",
        "x": 64,
        "y": 48
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 174
  },
  "0x18F": {
    "id": "0x18F",
    "area": "Catfish's Maw",
    "name": "Flying Bomb Chest East",
    "locations": [
      {
        "map": "d5",
        "x": 1088,
        "y": 304
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 170
  },
  "0x188": {
    "id": "0x188",
    "area": "Catfish's Maw",
    "name": "Sword Stalfos, Star, Bridge Chest",
    "locations": [
      {
        "map": "d5",
        "x": 928,
        "y": 144
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 171
  },
  "0x18E": {
    "id": "0x18E",
    "area": "Catfish's Maw",
    "name": "Two Stalfos, Star Pit Chest",
    "locations": [
      {
        "map": "d5",
        "x": 912,
        "y": 272
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 169
  },
  "0x18A-Owl": {
    "id": "0x18A-Owl",
    "area": "Catfish's Maw",
    "name": "Star Owl",
    "locations": [
      {
        "map": "d5",
        "x": 240,
        "y": 256
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 167
  },
  "0x196": {
    "id": "0x196",
    "area": "Catfish's Maw",
    "name": "Hookshot Note Chest",
    "locations": [
      {
        "map": "d5",
        "x": 832,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 166
  },
  "0x197": {
    "id": "0x197",
    "area": "Catfish's Maw",
    "name": "Three Iron Mask Chest",
    "locations": [
      {
        "map": "d5",
        "x": 208,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 164
  },
  "0x19B": {
    "id": "0x19B",
    "area": "Catfish's Maw",
    "name": "Flying Bomb Chest South",
    "locations": [
      {
        "map": "d5",
        "x": 448,
        "y": 800
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 163
  },
  "0x19A-Owl": {
    "id": "0x19A-Owl",
    "area": "Catfish's Maw",
    "name": "Crystal Owl",
    "locations": [
      {
        "map": "d5",
        "x": 752,
        "y": 640
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 165
  },
  "0x181": {
    "id": "0x181",
    "area": "Catfish's Maw",
    "name": "Crystal Key",
    "locations": [
      {
        "map": "d5",
        "x": 192,
        "y": 48
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 173
  },
  "0x19E": {
    "id": "0x19E",
    "area": "Catfish's Maw",
    "name": "Spark, Two Iron Mask Chest",
    "locations": [
      {
        "map": "d5",
        "x": 592,
        "y": 928
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 162
  },
  "0x1A0": {
    "id": "0x1A0",
    "area": "Catfish's Maw",
    "name": "Entrance Hookshottable Chest",
    "locations": [
      {
        "map": "d5",
        "x": 912,
        "y": 912
      },
      {
        "map": "overworld",
        "x": 420,
        "y": 292
      }
    ],
    "index": 161
  },
  "0x162": {
    "id": "0x162",
    "area": "Angler's Tunnel",
    "name": "Surf Harp",
    "locations": [
      {
        "map": "d4",
        "x": 74,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 192,
    "linkedItem": "INSTRUMENT4",
    "vanillaLink": "true"
  },
  "0x166": {
    "id": "0x166",
    "area": "Angler's Tunnel",
    "name": "Angler Fish Heart Container",
    "locations": [
      {
        "map": "d4",
        "x": 72,
        "y": 336
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 191
  },
  "0x176": {
    "id": "0x176",
    "area": "Angler's Tunnel",
    "name": "Nightmare Key Ledge Chest",
    "locations": [
      {
        "map": "d4",
        "x": 192,
        "y": 656
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 190
  },
  "0x160": {
    "id": "0x160",
    "area": "Angler's Tunnel",
    "name": "Flippers Chest",
    "locations": [
      {
        "map": "d4",
        "x": 384,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 188
  },
  "0x168": {
    "id": "0x168",
    "area": "Angler's Tunnel",
    "name": "Spark Chest",
    "locations": [
      {
        "map": "d4",
        "x": 352,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 187
  },
  "0x16D": {
    "id": "0x16D",
    "area": "Angler's Tunnel",
    "name": "Blob Chest",
    "locations": [
      {
        "map": "d4",
        "x": 256,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 186
  },
  "0x16E": {
    "id": "0x16E",
    "area": "Angler's Tunnel",
    "name": "Flipper Locked After Boots Pit Chest",
    "locations": [
      {
        "map": "d4",
        "x": 416,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 189
  },
  "0x169": {
    "id": "0x169",
    "area": "Angler's Tunnel",
    "name": "Pit Key",
    "locations": [
      {
        "map": "d4",
        "x": 752,
        "y": 288
      },
      {
        "map": "d4",
        "x": 512,
        "y": 304
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 184
  },
  "0x16F-Owl": {
    "id": "0x16F-Owl",
    "area": "Angler's Tunnel",
    "name": "Spiked Beetle Owl",
    "locations": [
      {
        "map": "d4",
        "x": 528,
        "y": 448
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 185
  },
  "0x175": {
    "id": "0x175",
    "area": "Angler's Tunnel",
    "name": "Flipper Locked Before Boots Pit Chest",
    "locations": [
      {
        "map": "d4",
        "x": 672,
        "y": 560
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 183
  },
  "0x165": {
    "id": "0x165",
    "area": "Angler's Tunnel",
    "name": "Upper Bomb Locked Watery Chest",
    "locations": [
      {
        "map": "d4",
        "x": 880,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 182
  },
  "0x171": {
    "id": "0x171",
    "area": "Angler's Tunnel",
    "name": "Lower Bomb Locked Watery Chest",
    "locations": [
      {
        "map": "d4",
        "x": 912,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 181
  },
  "0x17B": {
    "id": "0x17B",
    "area": "Angler's Tunnel",
    "name": "Crystal Chest",
    "locations": [
      {
        "map": "d4",
        "x": 544,
        "y": 832
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 180
  },
  "0x178": {
    "id": "0x178",
    "area": "Angler's Tunnel",
    "name": "Two Spiked Beetle, Zol Chest",
    "locations": [
      {
        "map": "d4",
        "x": 576,
        "y": 704
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 179
  },
  "0x16A": {
    "id": "0x16A",
    "area": "Angler's Tunnel",
    "name": "NW of Boots Pit Ledge Chest",
    "locations": [
      {
        "map": "d4",
        "x": 656,
        "y": 336
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 178
  },
  "0x179": {
    "id": "0x179",
    "area": "Angler's Tunnel",
    "name": "Watery Statue Chest",
    "locations": [
      {
        "map": "d4",
        "x": 704,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 276
      }
    ],
    "index": 177
  },
  "0x159": {
    "id": "0x159",
    "area": "Key Cavern",
    "name": "Sea Lily's Bell",
    "locations": [
      {
        "map": "d3",
        "x": 872,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 214,
    "linkedItem": "INSTRUMENT3",
    "vanillaLink": "true"
  },
  "0x15A": {
    "id": "0x15A",
    "area": "Key Cavern",
    "name": "Slime Eye Heart Container",
    "locations": [
      {
        "map": "d3",
        "x": 872,
        "y": 848
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 213
  },
  "0x15B": {
    "id": "0x15B",
    "area": "Key Cavern",
    "name": "Nightmare Door Key",
    "locations": [
      {
        "map": "d3",
        "x": 832,
        "y": 944
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 212
  },
  "0x140-Owl": {
    "id": "0x140-Owl",
    "area": "Key Cavern",
    "name": "Flying Bomb Owl",
    "locations": [
      {
        "map": "d3",
        "x": 64,
        "y": 0
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 205
  },
  "0x144": {
    "id": "0x144",
    "area": "Key Cavern",
    "name": "Two Zol, Stalfos Ledge Chest",
    "locations": [
      {
        "map": "d3",
        "x": 128,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 206
  },
  "0x148": {
    "id": "0x148",
    "area": "Key Cavern",
    "name": "Two Zol, Two Pairodd Key",
    "locations": [
      {
        "map": "d3",
        "x": 32,
        "y": 304
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 204
  },
  "0x141": {
    "id": "0x141",
    "area": "Key Cavern",
    "name": "Three Bombite Key",
    "locations": [
      {
        "map": "d3",
        "x": 192,
        "y": 48
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 211
  },
  "0x142": {
    "id": "0x142",
    "area": "Key Cavern",
    "name": "Three Zol, Stalfos Chest",
    "locations": [
      {
        "map": "d3",
        "x": 384,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 210
  },
  "0x146": {
    "id": "0x146",
    "area": "Key Cavern",
    "name": "Boots Chest",
    "locations": [
      {
        "map": "d3",
        "x": 384,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 207
  },
  "0x147": {
    "id": "0x147",
    "area": "Key Cavern",
    "name": "Tile Arrow Ledge Chest",
    "locations": [
      {
        "map": "d3",
        "x": 608,
        "y": 144
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 208
  },
  "0x147-Owl": {
    "id": "0x147-Owl",
    "area": "Key Cavern",
    "name": "Tile Arrow Owl",
    "locations": [
      {
        "map": "d3",
        "x": 528,
        "y": 128
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 209
  },
  "0x14D": {
    "id": "0x14D",
    "area": "Key Cavern",
    "name": "After Stairs Key",
    "locations": [
      {
        "map": "d3",
        "x": 352,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 203
  },
  "0x158": {
    "id": "0x158",
    "area": "Key Cavern",
    "name": "South Key Room Key",
    "locations": [
      {
        "map": "d3",
        "x": 832,
        "y": 560
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 202
  },
  "0x155": {
    "id": "0x155",
    "area": "Key Cavern",
    "name": "West Key Room Key",
    "locations": [
      {
        "map": "d3",
        "x": 672,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 201
  },
  "0x14C": {
    "id": "0x14C",
    "area": "Key Cavern",
    "name": "Zol Switch Chest",
    "locations": [
      {
        "map": "d3",
        "x": 208,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 200
  },
  "0x150": {
    "id": "0x150",
    "area": "Key Cavern",
    "name": "Sword Stalfos, Keese Switch Chest",
    "locations": [
      {
        "map": "d3",
        "x": 400,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 196
  },
  "0x154-Owl": {
    "id": "0x154-Owl",
    "area": "Key Cavern",
    "name": "North Key Room Owl",
    "locations": [
      {
        "map": "d3",
        "x": 848,
        "y": 304
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 199
  },
  "0x154": {
    "id": "0x154",
    "area": "Key Cavern",
    "name": "North Key Room Key",
    "locations": [
      {
        "map": "d3",
        "x": 832,
        "y": 304
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 198
  },
  "0x14E": {
    "id": "0x14E",
    "area": "Key Cavern",
    "name": "Two Stalfos, Zol Chest",
    "locations": [
      {
        "map": "d3",
        "x": 288,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 197
  },
  "0x14F": {
    "id": "0x14F",
    "area": "Key Cavern",
    "name": "Four Zol Chest",
    "locations": [
      {
        "map": "d3",
        "x": 272,
        "y": 672
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 195
  },
  "0x151": {
    "id": "0x151",
    "area": "Key Cavern",
    "name": "Two Bombite, Sword Stalfos, Zol Chest",
    "locations": [
      {
        "map": "d3",
        "x": 288,
        "y": 816
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 194
  },
  "0x153": {
    "id": "0x153",
    "area": "Key Cavern",
    "name": "Vacuum Mouth Chest",
    "locations": [
      {
        "map": "d3",
        "x": 448,
        "y": 928
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 422
      }
    ],
    "index": 193
  },
  "0x12A": {
    "id": "0x12A",
    "area": "Bottle Grotto",
    "name": "Conch Horn",
    "locations": [
      {
        "map": "d2",
        "x": 712,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 231,
    "linkedItem": "INSTRUMENT2",
    "vanillaLink": "true"
  },
  "0x12B": {
    "id": "0x12B",
    "area": "Bottle Grotto",
    "name": "Genie Heart Container",
    "locations": [
      {
        "map": "d2",
        "x": 872,
        "y": 312
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 230
  },
  "0x127": {
    "id": "0x127",
    "area": "Bottle Grotto",
    "name": "Enemy Order Room Chest",
    "locations": [
      {
        "map": "d2",
        "x": 768,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 229
  },
  "0x122": {
    "id": "0x122",
    "area": "Bottle Grotto",
    "name": "Second Switch Locked Chest",
    "locations": [
      {
        "map": "d2",
        "x": 432,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 228
  },
  "0x120": {
    "id": "0x120",
    "area": "Bottle Grotto",
    "name": "Boo Buddies Room Chest",
    "locations": [
      {
        "map": "d2",
        "x": 128,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 227
  },
  "0x12F-Owl": {
    "id": "0x12F-Owl",
    "area": "Bottle Grotto",
    "name": "Before First Staircase Owl",
    "locations": [
      {
        "map": "d2",
        "x": 832,
        "y": 512
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 223
  },
  "0x129-Owl": {
    "id": "0x129-Owl",
    "area": "Bottle Grotto",
    "name": "After Hinox Owl",
    "locations": [
      {
        "map": "d2",
        "x": 240,
        "y": 256
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 224
  },
  "0x121": {
    "id": "0x121",
    "area": "Bottle Grotto",
    "name": "Outside Boo Buddies Room Chest",
    "locations": [
      {
        "map": "d2",
        "x": 272,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 226
  },
  "0x1212": {
    "id": "0x1212",
    "area": "Bottle Grotto",
    "name": "Outside Boo Buddies Flying Powder",
    "locations": [
      {
        "map": "d2",
        "x": 240,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 226,
    "vanilla": true,
    "vanillaItem": "MAGIC_POWDER"
  },
  "0x126": {
    "id": "0x126",
    "area": "Bottle Grotto",
    "name": "Vacuum Mouth Chest",
    "locations": [
      {
        "map": "d2",
        "x": 192,
        "y": 160
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 225
  },
  "0x134": {
    "id": "0x134",
    "area": "Bottle Grotto",
    "name": "Mask-Mimic Key",
    "locations": [
      {
        "map": "d2",
        "x": 672,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 220
  },
  "0x139": {
    "id": "0x139",
    "area": "Bottle Grotto",
    "name": "Button Spawn Chest",
    "locations": [
      {
        "map": "d2",
        "x": 768,
        "y": 800
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 222
  },
  "0x1392": {
    "id": "0x1392",
    "area": "Bottle Grotto",
    "name": "Pit Flying Powder",
    "locations": [
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      },
      {
        "map": "d2",
        "x": 720,
        "y": 832
      }
    ],
    "index": 222,
    "vanilla": true,
    "vanillaItem": "MAGIC_POWDER"
  },
  "0x138": {
    "id": "0x138",
    "area": "Bottle Grotto",
    "name": "First Switch Locked Chest",
    "locations": [
      {
        "map": "d2",
        "x": 528,
        "y": 832
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 221
  },
  "0x133-Owl": {
    "id": "0x133-Owl",
    "area": "Bottle Grotto",
    "name": "Switch Owl",
    "locations": [
      {
        "map": "d2",
        "x": 544,
        "y": 640
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 219
  },
  "0x137": {
    "id": "0x137",
    "area": "Bottle Grotto",
    "name": "Mask-Mimic Chest",
    "locations": [
      {
        "map": "d2",
        "x": 448,
        "y": 800
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 218
  },
  "0x132": {
    "id": "0x132",
    "area": "Bottle Grotto",
    "name": "Two Stalfos Key",
    "locations": [
      {
        "map": "d2",
        "x": 352,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 217
  },
  "0x12E": {
    "id": "0x12E",
    "area": "Bottle Grotto",
    "name": "Hardhat Beetle Pit Chest",
    "locations": [
      {
        "map": "d2",
        "x": 64,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 216
  },
  "0x136": {
    "id": "0x136",
    "area": "Bottle Grotto",
    "name": "Entrance Chest",
    "locations": [
      {
        "map": "d2",
        "x": 176,
        "y": 800
      },
      {
        "map": "overworld",
        "x": 80,
        "y": 422
      }
    ],
    "index": 215
  },
  "0x102": {
    "id": "0x102",
    "area": "Tail Cave",
    "name": "Full Moon Cello",
    "locations": [
      {
        "map": "d1",
        "x": 1032,
        "y": 32
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 246,
    "linkedItem": "INSTRUMENT1",
    "vanillaLink": "true"
  },
  "0x106": {
    "id": "0x106",
    "area": "Tail Cave",
    "name": "Moldorm Heart Container",
    "locations": [
      {
        "map": "d1",
        "x": 1032,
        "y": 200
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 245
  },
  "0x10A-Owl": {
    "id": "0x10A-Owl",
    "area": "Tail Cave",
    "name": "Three of a Kind Owl",
    "locations": [
      {
        "map": "d1",
        "x": 880,
        "y": 256
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 244
  },
  "0x10A": {
    "id": "0x10A",
    "area": "Tail Cave",
    "name": "Three of a Kind Chest",
    "locations": [
      {
        "map": "d1",
        "x": 928,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 243
  },
  "0x108": {
    "id": "0x108",
    "area": "Tail Cave",
    "name": "Nightmare Key Chest",
    "locations": [
      {
        "map": "d1",
        "x": 544,
        "y": 272
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 242
  },
  "0x11D": {
    "id": "0x11D",
    "area": "Tail Cave",
    "name": "Feather Chest",
    "locations": [
      {
        "map": "d1",
        "x": 64,
        "y": 288
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 241
  },
  "0x104-Owl": {
    "id": "0x104-Owl",
    "area": "Tail Cave",
    "name": "Movable Block Owl",
    "locations": [
      {
        "map": "d1",
        "x": 368,
        "y": 128
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 239
  },
  "0x103-Owl": {
    "id": "0x103-Owl",
    "area": "Tail Cave",
    "name": "Spiked Beetle Owl",
    "locations": [
      {
        "map": "d1",
        "x": 240,
        "y": 128
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 240
  },
  "0x10C": {
    "id": "0x10C",
    "area": "Tail Cave",
    "name": "Bombable Wall Seashell Chest",
    "locations": [
      {
        "map": "d1",
        "x": 224,
        "y": 432
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 238
  },
  "0x114": {
    "id": "0x114",
    "area": "Tail Cave",
    "name": "Two Stalfos, Two Keese Chest",
    "locations": [
      {
        "map": "d1",
        "x": 768,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 235
  },
  "0x10D": {
    "id": "0x10D",
    "area": "Tail Cave",
    "name": "Mini-Moldorm Spawn Chest",
    "locations": [
      {
        "map": "d1",
        "x": 448,
        "y": 416
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 237
  },
  "0x116": {
    "id": "0x116",
    "area": "Tail Cave",
    "name": "Hardhat Beetles Key",
    "locations": [
      {
        "map": "d1",
        "x": 352,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 232
  },
  "0x10E": {
    "id": "0x10E",
    "area": "Tail Cave",
    "name": "Spark, Mini-Moldorm Chest",
    "locations": [
      {
        "map": "d1",
        "x": 544,
        "y": 416
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 236
  },
  "0x115": {
    "id": "0x115",
    "area": "Tail Cave",
    "name": "Four Zol Chest",
    "locations": [
      {
        "map": "d1",
        "x": 208,
        "y": 688
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 233
  },
  "0x113": {
    "id": "0x113",
    "area": "Tail Cave",
    "name": "Pit Button Chest",
    "locations": [
      {
        "map": "d1",
        "x": 608,
        "y": 544
      },
      {
        "map": "overworld",
        "x": 64,
        "y": 552
      }
    ],
    "index": 234
  },
  "0x301-1": {
    "id": "0x301-1",
    "area": "Color Dungeon",
    "name": "Tunic Fairy Item 2",
    "locations": [
      {
        "map": "d0",
        "x": 232,
        "y": 64
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 12,
    "linkedItem": "GREAT_FAIRY"
  },
  "0x301-0": {
    "id": "0x301-0",
    "area": "Color Dungeon",
    "name": "Tunic Fairy Item 1",
    "locations": [
      {
        "map": "d0",
        "x": 232,
        "y": 64
      },
      {
        "map": "overworld",
        "x": 404,
        "y": 568
      }
    ],
    "index": 11,
    "linkedItem": "GREAT_FAIRY"
  }
}