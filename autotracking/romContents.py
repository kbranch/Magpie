import io
import os
import sys
import uuid
import json

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