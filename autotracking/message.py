import json

class Message:
    def __init__(self, type, category):
        self.type = type
        self.category = category
        self.items = []
    
    async def send(self, socket):
        await socket.send(json.dumps(self.__dict__))