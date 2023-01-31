import json

class Message:
    def __init__(self, type, refresh=True):
        self.type = type
        self.refresh = refresh
        self.version = "1.0"
    
    async def send(self, socket):
        await socket.send(json.dumps(self.__dict__))