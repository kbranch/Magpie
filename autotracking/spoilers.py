import os
import sys
import uuid

# Deal with how pyinstaller's --onefile option packs things
if hasattr(sys, '_MEIPASS'):
    os.chdir(sys._MEIPASS)
    sys.path.append(os.path.abspath('LADXR/'))
else:
    sys.path.append(os.path.abspath('LADXR/'))
    sys.path.append(os.path.abspath('../LADXR/'))

from romTables import ROMWithTables
from settings import Settings
from spoilerLog import SpoilerLog

class SpoilerArgs:
    def __init__(self):
        self.dump = False
        self.test = False
        self.spoilerformat = 'json'

def getSpoilerLog(romData):
    rom = ROMWithTables(data=romData)
    args = SpoilerArgs()
    settings = Settings()
    settings.loadShortString(rom.readShortSettings())
    log = SpoilerLog(settings, args, [rom])
    
    filename = f'log-{uuid.uuid4()}.json'
    log.outputJson(filename)
    logJson = open(filename, 'r').read()
    os.remove(filename)

    return logJson