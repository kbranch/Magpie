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
        self.frame.FourCC = ndi.FOURCC_VIDEO_TYPE_RGBA
    
    def LoadImage(self, bytes):
        data = np.fromstring(bytes, np.uint8)
        cvImage = cv.imdecode(data, cv.IMREAD_UNCHANGED)
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
itemsEnabled = False
mapEnabled = False

def setNdiStatus(items, map):
    global itemsEnabled, mapEnabled, itemFrames, mapFrames, streamThread

    if items and not itemsEnabled:
        itemFrames = Queue()
    if map and not mapEnabled:
        mapFrames = Queue()

    itemsEnabled = items
    mapEnabled = map

    if (itemsEnabled or mapEnabled) and not streamThread:
        streamThread = Thread(target=streamsTask, daemon=True)
        streamThread.start()
    
    if not itemsEnabled and not mapEnabled:
        streamThread = None

def updateMapImage(pngBytes):
    if mapEnabled:
        mapFrames.put(pngBytes)

def updateItemsImage(pngBytes):
    if itemsEnabled:
        itemFrames.put(pngBytes)

def streamsTask():
    global itemsEnabled, mapEnabled, itemFrames, mapFrames

    ndi.initialize()

    itemStream = NdiStream('Magpie-Items')
    mapStream = NdiStream('Magpie-Map')

    while itemsEnabled or mapEnabled:
        try:
            if itemsEnabled:
                if not itemFrames.empty():
                    itemStream.LoadImage(itemFrames.get())
                    mapStream.ReloadImage()

                itemStream.Send()

            if mapEnabled:
                if not mapFrames.empty():
                    mapStream.LoadImage(mapFrames.get())
                    itemStream.ReloadImage()

                mapStream.Send()

        except Exception as e:
            print(f"Error in NDI stream: {e}, {traceback.format_exc()}")

        time.sleep(0.25)
    
    itemStream.Destroy()
    mapStream.Destroy()

    ndi.destroy()
