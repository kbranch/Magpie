import io
import os
import sys
import uuid
import json
import hashlib

# Deal with how pyinstaller's --onefile option packs things
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    sys.path.append(os.path.abspath('LADXR/'))
else:
    sys.path.append(os.path.abspath('LADXR/'))
    sys.path.append(os.path.abspath('../LADXR/'))

from rom import ROM
from romTables import ROMWithTables
from settings import Settings
from spoilerLog import SpoilerLog

class SpoilerArgs:
    def __init__(self):
        self.dump = False
        self.test = False
        self.spoilerformat = 'json'

def getSpoilerLog(romData):
    rom = ROMWithTables(io.BytesIO(romData))
    args = SpoilerArgs()
    shortSettings = rom.readShortSettings()
    settings = Settings()
    settings.loadShortString(shortSettings)
    log = SpoilerLog(settings, args, [rom])
    
    filename = f'log-{uuid.uuid4()}.json'
    log.outputJson(filename)
    logJson = json.loads(open(filename, 'r').read())
    os.remove(filename)

    logJson['shortSettings'] = shortSettings

    return json.dumps(logJson)

def getSettings(romData):
    rom = ROM(io.BytesIO(romData))
    return rom.readShortSettings()

gfxDict = {
   "97ffafcf5d69d954237c24bcb110ca46f6fe11bd":"Subrosian",
   "a64e194f2da62e43cf237479c79c0732c3ad4bdf":"Mario",
   "15813695f4f29e1ca230da72a695b294c50e9432":"Rooster",
   "c7ac387f3012b3586e8b7ae64f15c7b7be5ec7c0":"Rosa",
   "20c1c983afd0ac79db8f88084b00c6e1c2b66e13":"Kirby",
   "2dcf7df2ea40dfe10c66448c1e5f1f4b0f4bcb2d":"Martha",
   "08b9e4bfd8365ecb8926cc0a793a7d10d6302719":"Meme",
   "7ed541f907ee16f2747552815eb64300e2cc4833":"Bunny",
   "1c2dc985e1173098829ad72f03b846e71cb4ae8d":"Matty_LA",
   "f49d99d98c6b540662d8e0aa870d2ade3ed96595":"Bowwow",
   "cbd8bc8c24f401d81535548d9b6ffb5856c93f7b":"Luigi",
   "a0e2cc91fce373c19f37c06645d41fb6a063801e":"Tarin",
   "93e72284baf65946b9ae0aa0fc4019773c0fa9d7":"AgesGirl",
   "d93deb2175e416141046d8aef243d4276939f7fc":"Marin",
   "39987d5c51b3afe0bdb56c3d268d1393fd1ce956":"GrandmaUlrira",
   "c536903f896dd7de7db8b870d8605ef1888acb01":"Richard",
   "8e69926ed9fb30151c342c24119e18f9cc9d4c5e":"NESLink",
   "913caca99f174f166e8faef77065ef3ca82e89c0":"MarinAlpha"
}

def getGfx(romData):
    gfxHash = hashlib.sha1(romData[0x30000:0x30100]).hexdigest()

    if gfxHash in gfxDict:
        return gfxDict[gfxHash]
    
    return ''