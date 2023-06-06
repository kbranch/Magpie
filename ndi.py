import time
import cv2 as cv
import numpy as np
import NDIlib as ndi
from queue import Queue
from threading import Thread

mapFrames = Queue()
itemFrames = Queue()
streamThread = None

def init():
    global streamThread

    if not streamThread:
        streamThread = Thread(target=streamsTask, daemon=True)
        streamThread.start()

def updateMapImage(pngBytes):
    mapFrames.put(pngBytes)

def updateItemsImage(pngBytes):
    itemFrames.put(pngBytes)

def cvImageFromPng(pngBytes):
    pngData = np.fromstring(pngBytes, np.uint8)

    cvImage = cv.imdecode(pngData, cv.IMREAD_COLOR)
    cvImage = cv.cvtColor(cvImage, cv.COLOR_BGR2RGBA)

    return cvImage

def createSender(name):
    settings = ndi.SendCreate()
    settings.ndi_name = name
    return ndi.send_create(settings)

def createFrame():
    frame = ndi.VideoFrameV2()
    frame.FourCC = ndi.FOURCC_VIDEO_TYPE_RGBX
    return frame

def streamsTask():
    global itemFrames, mapFrames

    mapReady = False
    itemReady = False

    itemData = None
    mapData = None

    itemSender = createSender('Magpie-Items')
    mapFrame = createFrame()

    mapSender = createSender('Magpie-Map')
    itemFrame = createFrame()

    while True:
        try:
            if not itemFrames.empty():
                itemBytes = itemFrames.get()
                image = cvImageFromPng(itemBytes)
                itemData = image

                itemFrame.data = itemData
                mapFrame.data = mapData if mapReady else mapFrame.data
                itemReady = True

            if not mapFrames.empty():
                mapBytes = mapFrames.get()
                image = cvImageFromPng(mapBytes)
                mapData = image

                itemFrame.data = itemData if itemReady else itemFrame.data
                mapFrame.data = mapData
                mapReady = True

            if itemReady:
                ndi.send_send_video_v2(itemSender, itemFrame)

            if mapReady:
                ndi.send_send_video_v2(mapSender, mapFrame)

            time.sleep(0.25)
        except Exception as e:
            print(e)
