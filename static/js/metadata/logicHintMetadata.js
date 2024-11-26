"use strict"

var logicHintDict = {
    "RiverRooster":{
      "id":"RiverRooster",
      "text":"Rooster Over the River",
      "image": "river_rooster.svg",
      "locations":[
        {
          "map": "overworld",
          "x": 1644,
          "y": 1463,
          "offsetX": 35,
          "offsetY": 35,
        },
      ],
    },
    "KanaletRooster":{
      "id":"KanaletRooster",
      "text":"Rooster Over the Moat",
      "image": "kanalet_rooster.svg",
      "locations":[
        {
          "map":"overworld",
          "x": 1755,
          "y": 400,
          "offsetX": 35,
          "offsetY": 55,
        },
      ],
    },
    "BirdPits":{
      "id":"BirdPits",
      "text":"Fall Down a Bird Key Cave Pit",
      "extraText": () => { return ` (found at ${entranceDict[entranceMap['bird_cave:inside']].name})` },
      "image": "bird_hole.svg",
      "condition": (flags, settings) => { return flags.entranceshuffle != 'none'; },
      "locations":[
        {
          "map":"overworld",
          "x": 1795,
          "y": 175,
          "offsetX": -65,
          "offsetY": 0,
        },
      ],
    },
    "LanmolaPit":{
      "id":"LanmolaPit",
      "text":"Fall Down Lanmola's Pit",
      "image": "lanmola-hole.svg",
      "condition": (flags, settings) => { return flags.entranceshuffle != 'none'; },
      "locations":[
        {
          "map":"overworld",
          "x": 2390,
          "y": 1535,
          "offsetX": -50,
          "offsetY": 35,
        },
      ],
    },
    "DampPit":{
      "id":"DampPit",
      "text":"Fall Down the Damp Cave Pit",
      "image": "lanmola-hole.svg",
      "condition": (flags, settings) => { return flags.entranceshuffle != 'none' && flags.shufflewater; },
      "locations":[
        {
          "map":"overworld",
          "x": 2438,
          "y": 210,
          "offsetX": -74,
          "offsetY": 0,
        },
      ],
    },
}