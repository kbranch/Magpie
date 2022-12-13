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