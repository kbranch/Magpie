import sys
from EvilGameboy import EvilGameboy
from RetroGameboy import RetroGameboy

class Gameboy:
    def __init__(self):
        self.emulator = None
        self.wramSnapshot = None
        self.hramSnapshot = None
        self.gfxSnapshot = None
    
    def canReadRom(self):
        return self.emulator != None and self.emulator.canReadRom
    
    def snapshot(self):
        #WRAM actually starts at 0xC000, but we only care about 0xD800 and up for now
        self.wramSnapshot = self.emulator.readRam(0xD800, 0x800)
        self.hramSnapshot = self.emulator.readRam(0xFF80, 0x80)

        if self.canReadRom():
            self.gfxSnapshot = self.emulator.readRom(0xB0000, 0x040)
    
    def findEmulator(self):
        if sys.platform == "win32":
            client = EvilGameboy()
            if client.findEmulator():
                self.emulator = client
                return True
            else:
                self.emulator = None

        if self.emulator != None and self.emulator.isConnected():
            return True

        client = RetroGameboy()
        if client.findEmulator():
            self.emulator = client
            return True

        return False

    def readRamByte(self, address):
        if address < 0xE000:
            return self.wramSnapshot[address - 0xD800]
        elif address >= 0xFF80 and address <= 0xFFFF:
            return self.hramSnapshot[address - 0xFF80]
        
        return 0
    
    def readRomByte(self, address):
        assert(self.emulator.canReadRom)

        return self.emulator.readRomByte(address)
    
    def readRom(self, address, size):
        assert(self.emulator.canReadRom)

        return self.emulator.readRom(address, size)