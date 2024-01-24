class Entrance:
    def __init__(self, outdoor, indoor, name, indoorAddress=None):
        self.outdoorRoom = outdoor
        self.indoorMap = indoor
        self.indoorAddress = indoorAddress
        self.name = name
        self.changed = False
        self.mappedIndoor = None

    def map(self, indoor):
        if indoor != self.mappedIndoor:
            self.changed = True
        
        self.mappedIndoor = indoor

class EntranceCoord:
    def __init__(self, name, room, x, y):
        self.name = name
        self.room = room
        self.x = x
        self.y = y
    
    def __repr__(self):
        return EntranceCoord.coordString(self.room, self.x, self.y)
    
    def coordString(room, x, y):
        return f"{room:#05x}, {x}, {y}"
