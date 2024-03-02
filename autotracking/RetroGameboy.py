import socket
import consts

class RetroGameboy:
    socket = None
    address = None
    port = None
    def __init__(self, address="127.0.0.1", port=55355):
        self.address = address
        self.port = port
        self.canReadRom = False
    
    def send(self, b):
        if type(b) is str:
            b = b.encode('ascii')
        self.socket.settimeout(1)
        self.socket.sendto(b, (self.address, self.port))
    
    def isConnected(self):
        try:
            self.socket.settimeout(1)
            self.readRam(consts.gameStateAddress, 1)
            return True
        except:
            pass

        return False 

    def get_retroarch_version(self):
        self.send(b'VERSION\n')
        self.socket.settimeout(1)
        response_str, addr = self.socket.recvfrom(16)

        return response_str.rstrip()

    def findEmulator(self):
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            return self.isConnected()
        except:
            pass

        return False
    
    def readSnapshot(self):
        # A few bytes around 0xC100 are useful for location tracking and sensitive to timing with HRAM
        wramLow1 = None
        while wramLow1 == None or wramLow1[consts.transitionState - consts.wramLow] != wramLow2[consts.transitionState - consts.wramLow]:
            wramLow1 = self.readRam(consts.wramLow, consts.wramLowSize)
            hram = self.readRam(consts.hram, consts.hramSize)
            wramLow2 = self.readRam(consts.wramLow, consts.wramLowSize)

        wram = self.readRam(consts.wramHigh, consts.wramHighSize)

        ram = bytearray(consts.snapshotSize)
        ram[consts.wramLow - consts.wram:consts.wramLow - consts.wram + len(wramLow1)] = wramLow1
        ram[consts.hram - consts.wram:consts.hram - consts.wram + len(hram)] = hram
        ram[consts.wramHigh - consts.wram:consts.wramHigh - consts.wram + len(wram)] = wram

        return ram

    def readRam(self, address, size=1):
        command = "READ_CORE_MEMORY"
        
        self.send(f'{command} {hex(address)} {size}\n')
        self.socket.settimeout(10)
        response = self.socket.recv(size * 3 + len(command) + 1 + len(hex(address)) + 1)
        
        splits = response.decode().split(" ", 2)

        assert(splits[0] == command)

        return bytearray.fromhex(splits[2])

    def readRamByte(self, address):
        return self.readRam(address)[0]