import cv2 as cv
import numpy as np
import NDIlib as ndi

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