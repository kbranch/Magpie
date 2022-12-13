import json

class Message:
    def __init__(self, type, category, refresh=True):
        self.type = type
        self.category = category
        self.items = []
        self.refresh = refresh
    
    async def send(self, socket):
        await socket.send(json.dumps(self.__dict__))