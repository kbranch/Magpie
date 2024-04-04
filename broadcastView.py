import io
import time
import traceback
import tkinter as tk
from enum import Enum
from queue import Queue
from threading import Thread
from PIL import Image, ImageTk

modes = Enum('Modes', ('none', 'native', 'ndi'))
types = Enum('Types', ('items', 'map'))

class BroadcastView:
    tkClaimed = False

    def __init__(self, queue, type):
        self.queue = queue
        self.actualWidth = -1
        self.actualHeight = -1
        self.mode = modes.none
        self.type = type

        self.ndiThread = None

    def setMode(self, mode):
        if self.mode == modes.native and mode != modes.native:
            self.queue.put((self.root.destroy, []))

        if self.mode != modes.native and mode == modes.native:
            self.queue.put((self.mainNativeInit, []))
        
        if self.mode != modes.ndi and mode == modes.ndi:
            self.ndiFrames = Queue()
            self.ndiThread = Thread(target=self.ndiTask, daemon=True)
            self.ndiThread.start()

        self.mode = mode

    def updateImage(self, bytes):
        if self.mode == modes.native:
            self.queue.put((self.mainUpdateNativeImage, (bytes,)))
        if self.mode == modes.ndi:
            self.ndiFrames.put(bytes)

    def updateWindow(self):
        if self.mode == modes.native:
            self.root.update()
    
    def mainNativeInit(self):
        if not BroadcastView.tkClaimed:
            self.tk = tk.Tk()
            self.tk.withdraw()
            BroadcastView.tkClaimed = True

        self.root = tk.Toplevel()
        self.root.title(f"Magpie {'Items' if self.type == types.items else 'Map'} Broadcast View")
        self.label = tk.Label(self.root)
        self.label.pack()
    
    def mainUpdateNativeImage(self, bytes):
        try:
            self.root.state() # Throws a TclError that we catch and ignore if the user closed the window
        except tk.TclError:
            return

        self.root.update()

        stream = io.BytesIO(bytes)
        image = Image.open(stream)
        tkImage = ImageTk.PhotoImage(image)

        self.label.config(image=tkImage)
        self.label.image = tkImage

        w = self.root.winfo_width()
        h = self.root.winfo_height()

        if w != self.actualWidth or h != self.actualHeight:
            x = self.root.winfo_x()
            y = self.root.winfo_y()

            self.root.geometry(f"{image.width}x{image.height}+{x}+{y}")
            self.root.maxsize(image.width, image.height)
            self.root.minsize(image.width, image.height)

            self.actualWidth = self.root.winfo_width()
            self.actualHeight = self.root.winfo_height()

        self.root.update()

    def ndiTask(self):
        import NDIlib as ndi
        from ndi import NdiStream

        ndi.initialize()

        stream = NdiStream(f"Magpie-{'Items' if self.type == types.items else 'Map'}")

        while self.mode == modes.ndi:
            try:
                if not self.ndiFrames.empty():
                    stream.LoadImage(self.ndiFrames.get())

                stream.Send()

            except Exception as e:
                print(f"Error in NDI stream: {e}, {traceback.format_exc()}")

            time.sleep(0.25)
        
        stream.Destroy()

        ndi.destroy()