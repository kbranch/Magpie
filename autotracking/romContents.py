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
from spoilerLog import SpoilerLog, RaceRomException

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
    
    filename = f'log-{uuid.uuid4()}.json'
    logJson = {}

    try:
        log = SpoilerLog(settings, args, [rom])
        log.outputJson(filename)
        logJson = json.loads(open(filename, 'r').read())
        os.remove(filename)
    except RaceRomException:
        logJson['raceRom'] = True

    logJson['shortSettings'] = shortSettings

    return json.dumps(logJson)

def getSettings(romData):
    rom = ROM(io.BytesIO(romData))
    return rom.readShortSettings()

gfxDict = {
   "71087f57d498acbf51c3831e8c9949d5d3828c0f":"Subrosian",
   "0059dd3b44e740cb70a856717d70ebc4dafcb85a":"Mario",
   "e8568e8cd6ba62260bb6224be4a8b0676ee46471":"Rooster",
   "9f47a74c64a715bacabd66afab89f416d15c1237":"Rosa",
   "b5aeb6e2cd88a03fbc284787adc098c56c85f337":"Kirby",
   "6c3551c787354b971a6d2a505c5647fce7623d00":"Martha",
   "558b53286213d607a517864fefab0b491426c253":"Meme",
   "4a58f3432ad9cbc2011817c3abf4dcd5fa73be15":"Bunny",
   "be9d86151f4ee2d4d8a8b9beb0096cea7661f304":"Matty",
   "fc1251ab1000673d224d2d0e3a6759f00ace2a86":"Bowwow",
   "9bf7512f17bf7b632abfbbfacc97c0962770dbbe":"Luigi",
   "8ec67c1b492ed9439df04bdddd1f2f5a4bbf6661":"Tarin",
   "3cfa04f141127bfa4c23591bbe6b23af09b26b34":"AgesGirl",
   "2726558c2a536f305e32ba01a074071ca148f2e3":"Marin",
   "2e7ef7ef064ae9116631debd0fbd5f892faa462a":"GrandmaUlrira",
   "938a4fabaa34eb8323b2912b7dda78d88a0674b2":"Richard",
   "b4b1f305eef4c9979495ce71e69c923dfe2f1cf8":"NESLink",
   "ae96c94db9ec82e08d9f7ab1f4efc9072e0b72ed":"MarinAlpha"
}

def getGfx(gfxData):
    gfxHash = hashlib.sha1(gfxData).hexdigest()

    if gfxHash in gfxDict:
        return gfxDict[gfxHash]
    
    return ''