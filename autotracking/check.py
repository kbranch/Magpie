class Check:
    def __init__(self, id, address, mask, alternateAddress=None, linkedItem=None):
        self.id = id
        self.address = address
        self.alternateAddress = alternateAddress
        self.mask = mask
        self.value = None
        self.diff = 0
        self.linkedItem = linkedItem
    
    def set(self, bytes):
        oldValue = self.value

        self.value = 0

        for byte in bytes:
            maskedByte = byte
            if self.mask:
                maskedByte &= self.mask
            
            self.value |= int(maskedByte > 0)

        if oldValue != self.value:
            self.diff += self.value - (oldValue or 0)

            if self.diff != 0:
                print(f'Found {self.id}: {"+" if self.diff > 0 else ""}{self.diff}')
