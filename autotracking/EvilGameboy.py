import consts

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

    def readSnapshot(self):
        wram1 = None
        wram2 = None
        hram1 = None
        hram2 = None
        while wram1 == None or wram1 != wram2 or hram1 != hram2:
            wram1 = self.readRam(consts.wram, consts.wramSize)
            hram1 = self.readRam(consts.hram, consts.hramSize)
            wram2 = self.readRam(consts.wram, consts.wramSize)
            hram2 = self.readRam(consts.hram, consts.hramSize)

        ram = bytearray(consts.snapshotSize)
        ram[0:len(wram1)] = wram1
        ram[consts.hram - consts.wram:consts.hram - consts.wram + len(hram1)] = hram1

        return ram

    def readRam(self, address, size):
        # return self.emulator.read_ram(address, size)
        if address < consts.wram + consts.wramSize:
            return self.emulator.read_ram(address - consts.wram, size)
        elif address >= consts.hram and address <= consts.hram + consts.hramSize:
            return self.emulator.read_hram(address - consts.hram, size)

    def readRamByte(self, address):
        if address < consts.wram + consts.wramSize:
            return self.emulator.read_ram8(address - consts.wram)
        elif address >= consts.hram and address <= consts.hram + consts.hramSize:
            return self.emulator.read_hram8(address - consts.hram)
        
        return 0
    
    def readRomByte(self, address):
        return self.readRom(address, 1)
    
    def readRom(self, address, size):
        return self.emulator.read_rom(address, size)
    
    def isConnected(self):
        return self.emulator != None