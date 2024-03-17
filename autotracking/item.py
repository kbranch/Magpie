class Item:
    def __init__(self, id, address, threshold=0, mask=None, increaseOnly=False, count=False, max=None, encodedCount=True):
        self.id = id
        self.address = address
        self.threshold = threshold
        self.mask = mask
        self.increaseOnly = increaseOnly
        self.count = count
        self.value = 0 if increaseOnly else None
        self.rawValue = 0
        self.diff = 0
        self.max = max
        self.encodedCount = encodedCount

    def set(self, byte, extra):
        oldValue = self.value

        if self.mask:
            byte = byte & self.mask
        
        if not self.count:
            byte = int(byte > self.threshold)
        elif self.encodedCount:
            # LADX seems to store one decimal digit per nibble
            byte = byte - (byte // 16 * 6)
        
        byte += extra
        
        if self.max and byte > self.max:
            byte = self.max

        if self.increaseOnly:
            if byte > self.rawValue:
                self.value += byte - self.rawValue
        else:
            self.value = byte
        
        self.rawValue = byte

        if oldValue != self.value:
            self.diff += self.value - (oldValue or 0)

            if self.diff != 0:
                print(f'Found {self.id}: {"+" if self.diff > 0 else ""}{self.diff}')
    