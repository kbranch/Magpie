class Check:
    def __init__(self, id, address, mask):
        self.id = id
        self.address = address
        self.mask = mask
        self.value = None
        self.diff = 0
    
    async def set(self, byte):
        oldValue = self.value

        if self.mask:
            byte = byte & self.mask
        
        self.value = int(byte > 0)

        if oldValue != self.value:
            self.diff += self.value - (oldValue or 0)

            if self.diff != 0:
                print(f'Found {self.id}: {"+" if self.diff > 0 else ""}{self.diff}')
