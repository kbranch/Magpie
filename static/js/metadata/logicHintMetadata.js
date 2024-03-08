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
          "y": 1537,
          "offsetX": 35,
          "offsetY": -40,
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
}