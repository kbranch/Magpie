class EvilGameboy:
    def __init__(self):
        self.canReadRom = True

    def findEmulator(self):
        import evilemu
        self.emulator = None

        for emulator in evilemu.find_gameboy_emulators():
            self.emulator = emulator
            return True
        
        return False

    def readRam(self, address, size):
        # return self.emulator.read_ram(address, size)
        if address < 0xE000:
            return self.emulator.read_ram(address - 0xC000, size)
        elif address >= 0xFF80 and address <= 0xFFFF:
            return self.emulator.read_hram(address - 0xFF80, size)

    def readRamByte(self, address):
        if address < 0xE000:
            return self.emulator.read_ram8(address - 0xC000)
        elif address >= 0xFF80 and address <= 0xFFFF:
            return self.emulator.read_hram8(address - 0xFF80)
        
        return 0
    
    def readRomByte(self, address):
        return self.readRom(address, 1)
    
    def readRom(self, address, size):
        return self.emulator.read_rom(address, size)
    
    def isConnected(self):
        return self.emulator != None