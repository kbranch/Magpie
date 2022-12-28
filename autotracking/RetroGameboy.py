import socket

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
            self.readRam(0xDB95, 1)
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

    def readRam(self, address, size=1):
        command = "READ_CORE_MEMORY"
        
        self.send(f'{command} {hex(address)} {size}\n')
        self.socket.settimeout(1)
        response = self.socket.recv(12288)
        
        splits = response.decode().split(" ", 2)

        assert(splits[0] == command)
        # if splits[2].startswith("-1"):
        #     print(splits[2])
        #     print(hex(address))
        #     print(size)
        return bytearray.fromhex(splits[2])

    def readRamByte(self, address):
        return self.readRam(address)[0]