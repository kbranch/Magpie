import ctypes.wintypes
import struct


# HANDLE OpenProcess([in] DWORD dwDesiredAccess, [in] BOOL bInheritHandle, [in] DWORD dwProcessId);
from typing import Optional

OpenProcess = ctypes.windll.kernel32.OpenProcess
OpenProcess.argtypes = [ctypes.wintypes.DWORD, ctypes.wintypes.BOOL, ctypes.wintypes.DWORD]
OpenProcess.restype = ctypes.wintypes.HANDLE
# BOOL EnumProcesses([out] DWORD *lpidProcess, [in] DWORD cb, [out] LPDWORD lpcbNeeded);
EnumProcesses = ctypes.windll.psapi.EnumProcesses
EnumProcesses.argtypes = [ctypes.wintypes.PDWORD, ctypes.wintypes.DWORD, ctypes.wintypes.LPDWORD]
EnumProcesses.restype = ctypes.wintypes.BOOL
# BOOL CloseHandle([in] HANDLE hObject);
CloseHandle = ctypes.windll.kernel32.CloseHandle
CloseHandle.argtypes = [ctypes.wintypes.HANDLE]
CloseHandle.restype = ctypes.wintypes.BOOL
# BOOL EnumProcessModules([in] HANDLE hProcess, [out] HMODULE *lphModule, [in] DWORD cb, [out] LPDWORD lpcbNeeded);
EnumProcessModules = ctypes.windll.psapi.EnumProcessModules
EnumProcessModules.argtypes = [ctypes.wintypes.HANDLE, ctypes.POINTER(ctypes.wintypes.HMODULE), ctypes.wintypes.DWORD, ctypes.wintypes.LPDWORD]
EnumProcessModules.restype = ctypes.wintypes.BOOL
# DWORD GetModuleBaseNameA([in] HANDLE hProcess, [in, optional] HMODULE hModule, [out] LPSTR lpBaseName, [in] DWORD nSize);
GetModuleBaseNameA = ctypes.windll.psapi.GetModuleBaseNameA
GetModuleBaseNameA.argtypes = [ctypes.wintypes.HANDLE, ctypes.wintypes.HMODULE, ctypes.wintypes.LPSTR, ctypes.wintypes.DWORD]
GetModuleBaseNameA.restype = ctypes.wintypes.DWORD
# BOOL ReadProcessMemory([in] HANDLE hProcess, [in] LPCVOID lpBaseAddress, [out] LPVOID lpBuffer, [in] SIZE_T nSize, [out] SIZE_T *lpNumberOfBytesRead);
ReadProcessMemory = ctypes.windll.kernel32.ReadProcessMemory
ReadProcessMemory.argtypes = [ctypes.wintypes.HANDLE, ctypes.wintypes.ULARGE_INTEGER, ctypes.wintypes.LPVOID, ctypes.wintypes.ULARGE_INTEGER, ctypes.wintypes.PULARGE_INTEGER]
ReadProcessMemory.restype = ctypes.wintypes.BOOL
# BOOL WriteProcessMemory([in] HANDLE hProcess, [in] LPCVOID lpBaseAddress, [in] LPVOID lpBuffer, [in] SIZE_T nSize, [out] SIZE_T *lpNumberOfBytesWritten);
WriteProcessMemory = ctypes.windll.kernel32.WriteProcessMemory
WriteProcessMemory.argtypes = [ctypes.wintypes.HANDLE, ctypes.wintypes.ULARGE_INTEGER, ctypes.wintypes.LPVOID, ctypes.wintypes.ULARGE_INTEGER, ctypes.wintypes.PULARGE_INTEGER]
WriteProcessMemory.restype = ctypes.wintypes.BOOL
class MODULEINFO(ctypes.Structure):
    _fields_ = [
        ("lpBaseOfDll", ctypes.wintypes.LPVOID),
        ("SizeOfImage", ctypes.wintypes.DWORD),
        ("EntryPoint", ctypes.wintypes.LPVOID),
    ]
# BOOL GetModuleInformation([in] HANDLE hProcess, [in] HMODULE hModule, [out] LPMODULEINFO lpmodinfo, [in] DWORD cb);
GetModuleInformation = ctypes.windll.psapi.GetModuleInformation
GetModuleInformation.argtypes = [ctypes.wintypes.HANDLE, ctypes.wintypes.HMODULE, ctypes.POINTER(MODULEINFO), ctypes.wintypes.DWORD]
GetModuleInformation.restype = ctypes.wintypes.BOOL

class MEMORY_BASIC_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("BaseAddress", ctypes.wintypes.ULARGE_INTEGER),
        ("AllocationBase", ctypes.wintypes.ULARGE_INTEGER),
        ("AllocationProtect", ctypes.wintypes.DWORD),
        ("PartitionId", ctypes.wintypes.WORD),
        ("RegionSize", ctypes.wintypes.ULARGE_INTEGER),
        ("State", ctypes.wintypes.DWORD),
        ("Protect", ctypes.wintypes.DWORD),
        ("Type", ctypes.wintypes.DWORD),
    ]
# SIZE_T VirtualQueryEx([in] HANDLE hProcess, [in, optional] LPCVOID lpAddress, [out] PMEMORY_BASIC_INFORMATION lpBuffer, [in] SIZE_T dwLength);
VirtualQueryEx = ctypes.windll.kernel32.VirtualQueryEx
VirtualQueryEx.argtypes = [ctypes.wintypes.HANDLE, ctypes.wintypes.LPCVOID, ctypes.POINTER(MEMORY_BASIC_INFORMATION), ctypes.wintypes.ULARGE_INTEGER]
VirtualQueryEx.restype = ctypes.wintypes.ULARGE_INTEGER


PROCESS_VM_OPERATION = 0x08
PROCESS_VM_READ = 0x10
PROCESS_VM_WRITE = 0x20
PROCESS_QUERY_INFORMATION = 0x0400


class Process:
    def __init__(self, name):
        self.__proc = None
        self.__proc = self.__find_process(name)

    def __del__(self):
        if self.__proc:
            CloseHandle(self.__proc)

    def __find_process(self, name: str) -> ctypes.wintypes.HANDLE:
        process_list = (ctypes.wintypes.DWORD * 2048)()
        process_count = ctypes.wintypes.DWORD(0)
        if not EnumProcesses(process_list, ctypes.sizeof(process_list), process_count):
            raise ValueError("EnumProcesses failed")
        process_count = min(2048, process_count.value // ctypes.sizeof(ctypes.wintypes.DWORD))
        for n in range(process_count):
            access = PROCESS_VM_READ | PROCESS_QUERY_INFORMATION | PROCESS_VM_WRITE | PROCESS_VM_OPERATION
            proc = OpenProcess(access, False, process_list[n])
            if proc is None:
                continue
            buffer = ctypes.create_string_buffer(128)
            GetModuleBaseNameA(proc, None, buffer, ctypes.sizeof(buffer))
            if buffer.value == name.encode("ascii"):
                return proc
            CloseHandle(proc)
        raise ValueError(f"Process {name} not found")

    def read_memory(self, addr: int, size: int) -> bytes:
        base_addr = addr & ~0xFFF
        base_size = ((size - 1) | 0xFFF) + 1
        mem_buffer = (ctypes.c_byte * base_size)()
        if not ReadProcessMemory(self.__proc, base_addr, mem_buffer, ctypes.sizeof(mem_buffer), None):
            raise ValueError("Failed to read process memory...")
        return bytes(mem_buffer)[addr - base_addr:addr - base_addr + size]

    def write_memory(self, addr: int, data: bytes) -> None:
        if not WriteProcessMemory(self.__proc, addr, data, len(data), None):
            raise ValueError("Failed to write process memory...")

    def read_pointer32(self, addr: int) -> int:
        return struct.unpack("<I", self.read_memory(addr, 4))[0]

    def read_pointer_chain32(self, addr: int, *offsets: int) -> int:
        ptr = self.read_pointer32(addr)
        for offset in offsets:
            ptr = self.read_pointer32(ptr + offset)
        return ptr

    def search_module_memory(self, data: bytes) -> Optional[int]:
        module_list = (ctypes.wintypes.HMODULE * 32)()
        module_count = ctypes.wintypes.DWORD(0)
        EnumProcessModules(self.__proc, module_list, ctypes.sizeof(module_list), module_count)
        info = MODULEINFO()
        GetModuleInformation(self.__proc, module_list[0], info, ctypes.sizeof(info))
        mem = self.read_memory(info.lpBaseOfDll, info.SizeOfImage)
        idx = mem.find(data)
        if idx == -1:
            return None
        return info.lpBaseOfDll + idx

    def search_all_memory(self, data: bytes) -> Optional[int]:
        info = MEMORY_BASIC_INFORMATION()
        ptr = 0
        while True:
            if VirtualQueryEx(self.__proc, ptr, info, ctypes.sizeof(info)) != ctypes.sizeof(info):
                break
            if info.State != 0x1000:
                ptr += info.RegionSize
                continue
            # if info.Type != 0x20000 and info.Type != 0x40000:
            #     continue
            mem = self.read_memory(ptr, info.RegionSize)
            idx = mem.find(data)
            if idx != -1:
                return ptr + idx
            ptr += info.RegionSize
        return None


class Gameboy:
    def __init__(self):
        self.detach()
        self.attach()
    
    def attach(self):
        try:
            if self.__proc == None:
                self.__proc = Process("bgb.exe")
                print('Found emulator')

            ptr = self.__proc.search_module_memory(b'\x6D\x61\x69\x6E\x6C\x6F\x6F\x70\x83\xC4\xF4\xA1')

            if ptr == None:
                raise ValueError('Failed to find ROM data')

            ptr = self.__proc.read_pointer_chain32(ptr + 12, 0, 0, 0x34)

            self.__rom_addr = self.__proc.read_pointer32(ptr + 0x10)
            self.__ram_addr = self.__proc.read_pointer32(ptr + 0x108)

            print('Found game memory')
        except ValueError as ex:
            print(f'Error attaching to game memory: {str(ex)}')

    def detach(self):
        self.__proc = None
        self.__rom_addr = None
        self.__ram_addr = None

    def attached(self):
        return self.__proc != None and self.__rom_addr != None and self.__ram_addr != None

    def memread(self, addr: int) -> int:
        if 0x0000 < addr < 0x8000:
            return self.__proc.read_memory(self.__rom_addr + addr, 1)[0]
        if 0xC000 < addr < 0xE000:
            return self.__proc.read_memory(self.__ram_addr + addr - 0xC000, 1)[0]
        return 0

    def memwrite(self, addr: int, data: int) -> None:
        if 0x0000 < addr < 0x8000:
            self.__proc.write_memory(self.__rom_addr + addr, bytes([data]))
        if 0xC000 < addr < 0xE000:
            self.__proc.write_memory(self.__ram_addr + addr - 0xC000, bytes([data]))

    def memwriteOR(self, addr, data):
         self.memwrite(addr, self.memread(addr) | data)

    def memwriteAND(self, addr, data):
         self.memwrite(addr, self.memread(addr) & data)

def setstate(name):
    print(name)