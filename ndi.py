import cv2
import numpy as np

mapFrame = None
itemsFrame = None

def updateMapImage(pngBytes):
    with open('maptest.png', 'wb') as oFile:
        oFile.write(pngBytes)

    img = cvFrameFromPng(pngBytes)
    pass

def updateItemsImage(pngBytes):
    with open('itemtest.png', 'wb') as oFile:
        oFile.write(pngBytes)

    img = cvFrameFromPng(pngBytes)
    pass

def cvFrameFromPng(pngBytes):
    pngData = np.fromstring(pngBytes, np.uint8)
    return cv2.imdecode(pngData, cv2.IMREAD_COLOR)