import os
import bdb
import sys

sys.path.append(os.path.abspath('LADXR/'))

import logic
from logic.requirements import AND, OR, COUNT, COUNTS, FOUND, RequirementsSettings
from locations.items import *

class Debug(bdb.Bdb):
    def user_line(self, frame):
        for k, v in frame.f_locals.items():
            if isinstance(v, logic.Location) and k not in {"self", "location", "                                                                                                             other", "connection"}:
                v.local_name = k

def build(args, worldSetup):
    r = RequirementsSettings(args)
    r.bush = OR(SWORD, MAGIC_POWDER, MAGIC_ROD, POWER_BRACELET, BOOMERANG, BOMB)

    # log = Debug().runcall(logic.Logic, args, world_setup=worldSetup, requirements_settings=r)
    log = logic.Logic(args, world_setup=worldSetup, requirements_settings=r)
    log.name = 'tracker'

    for loc in log.location_list:
        for item in loc.items:
            if item.nameId == '0x2B1': #Fishing game
                loc.connect(loc.gated_connections[0][0], COUNT("RUPEES", 20))

    return log