import time
import traceback
import cv2 as cv
import numpy as np
import NDIlib as ndi
from queue import Queue
from threading import Thread

class NdiStream:
    def __init__(self, name):
        self.name = name

        self.image = None

        self.settings = ndi.SendCreate()
        self.settings.ndi_name = name
        self.sender = ndi.send_create(self.settings)
        self.frame = ndi.VideoFrameV2()
        self.frame.FourCC = ndi.FOURCC_VIDEO_TYPE_RGBX
    
    def LoadImage(self, bytes):
        data = np.fromstring(bytes, np.uint8)
        cvImage = cv.imdecode(data, cv.IMREAD_COLOR)
        self.image = cv.cvtColor(cvImage, cv.COLOR_BGR2RGBA)

        self.frame.data = self.image
    
    def ReloadImage(self):
        if self.Ready():
            self.frame.data = self.image
    
    def Ready(self):
        return not (self.image is None)

    def Send(self):
        if self.Ready():
            ndi.send_send_video_v2(self.sender, self.frame)

    def Destroy(self):
        ndi.send_destroy(self.sender)

mapFrames = Queue()
itemFrames = Queue()
streamThread = None
enabled = False

def enableNdi():
    global enabled, itemFrames, mapFrames, streamThread

    if not streamThread:
        streamThread = Thread(target=streamsTask, daemon=True)
        streamThread.start()

    enabled = True
    itemFrames = Queue()
    mapFrames = Queue()

def disableNdi():
    global enabled, streamThread

    enabled = False
    streamThread = None

def updateMapImage(pngBytes):
    if enabled:
        mapFrames.put(pngBytes)

def updateItemsImage(pngBytes):
    if enabled:
        itemFrames.put(pngBytes)

def streamsTask():
    global enabled, itemFrames, mapFrames

    ndi.initialize()

    itemStream = NdiStream('Magpie-Items')
    mapStream = NdiStream('Magpie-Map')

    while enabled:
        try:
            if not itemFrames.empty():
                itemStream.LoadImage(itemFrames.get())
                mapStream.ReloadImage()

            if not mapFrames.empty():
                mapStream.LoadImage(mapFrames.get())
                itemStream.ReloadImage()

            itemStream.Send()
            mapStream.Send()

        except Exception as e:
            print(f"Error in NDI stream: {e}, {traceback.format_exc()}")

        time.sleep(0.25)
    
    itemStream.Destroy()
    mapStream.Destroy()

    ndi.destroy()
