import io
import time
import logging
import traceback
import tkinter as tk
from enum import Enum
from queue import Queue
from threading import Thread
from PIL import Image, ImageTk

import endpoints

try:
    import NDIlib as ndi
    from ndi import NdiStream

    endpoints.ndiEnabled = True
    logging.info(f"NDI support enabled")
except:
    endpoints.ndiEnabled = False
    logging.info(f"NDI support disabled: {traceback.format_exc()}")

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
        self.bgColor = None

        self.ndiThread = None

    def setMode(self, mode, bgColor=None):
        self.bgColor = bgColor

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
        self.root.config(bg=self.bgColor)
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

        if self.bgColor:
            # Weird transparency stuff happens if the browser zooms in, do our best to strip it out
            bgColor = (int(self.bgColor[1:3], 16), int(self.bgColor[3:5], 16), int(self.bgColor[5:7], 16), 255)
            width, height = image.size
            data = image.load()

            for y in range(height):
                for x in range(width):
                    if data[x, y][3] != 255:
                        data[x, y] = bgColor

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
        if not endpoints.ndiEnabled:
            logging.error(f"NDI support is not enabled")
            return

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