import evilemu

class Gameboy:
    def __init__(self):
        self.emulator = None
    
    def findEmulator(self):
        self.emulator = None

        for emulator in evilemu.find_gameboy_emulators():
            self.emulator = emulator
            return True
        
        return False

    def readRamByte(self, address):
        if address < 0xE000:
            return self.emulator.read_ram8(address - 0xC000)
        elif address >= 0xFF80 and address <= 0xFFFF:
            return self.emulator.read_hram8(address - 0xFF80)
        
        return 0
    
    def readRomByte(self, address):
        return self.emulator.read_rom8(address)
    
    def search(self, bytes):
        process = self.emulator._Emulator__process
        for match in process.search(bytes, all_memory=True):
            pass
        pass
