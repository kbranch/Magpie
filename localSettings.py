import os
import json

class LocalSettings:
    def __init__(self):
        self.checkSize = 32
        self.mapBrightness = 50
        self.showOutOfLogic = False
        self.animateChecks = True
        self.swapMouseButtons = False
        self.swapItemsAndMap = False
        self.showChecked = True
        self.showHigherLogic = True
        self.showVanilla = True
        self.dungeonItemsTemplate = 'default.html'
        self.itemsTemplate = 'default.html'
        self.customDungeonItems = None
        self.customItems = None
        self.showDungeonItemCount = False
        self.showItemsOnly = False
        self.highlightItemsOnHover = True
        self.ownedHighlight = 'bar'
        self.enableAutotracking = False
        self.autotrackItems = True
        self.autotrackChecks = True
        self.autotrackEntrances = True
        self.autotrackSettings = True
        self.autotrackSpoilers = True
        self.autotrackGraphicsPack = True
        self.autotrackerAddress = ''
        self.gps = True
        self.followMap = True
        self.linkFace = True
        self.spoilOnCollect = False
        self.showOwnedPickups = False
        self.graphicsPack = ''

        self.diff0Color = '#0066ff'
        self.diff0VColor = '#ffffff'
        self.diff1Color = '#ffff00'
        self.diff1VColor = '#ffffff'
        self.diff2Color = '#ff8800'
        self.diff2VColor = '#ffffff'
        self.diff3Color = '#ff0000'
        self.diff3VColor = '#ffffff'
        self.diff8Color = '#0066ff'
        self.diff8VColor = '#ffffff'
        self.diff9Color = '#444444'
        self.diff9VColor = '#aaaaaa'
        self.diffCheckedColor = '#00ff00'
        self.colorAssistMaps = False

        self.bgColor = '#212529'
        self.textColor = '#f8f9fa'
    
    def parse(settingsString):
        localSettings = json.loads(settingsString)
        
        if 'py/object' in localSettings:
            del localSettings['py/object']

        obj = LocalSettings()
        obj.__dict__ = localSettings

        return obj
    
    def graphicsPacks():
        return ["Subrosian", "Mario", "Rooster", "Rosa", "Kirby", "Martha", "Meme", "Bunny", "Matty", "Bowwow", "Luigi", "Tarin", "AgesGirl", "Marin", "GrandmaUlrira", "Richard", "NESLink", "Ninten", "MarinAlpha"]
        # gfxPath = 'LADXR/gfx/'

        # options = []

        # with os.scandir(gfxPath) as ls:
        #     for entry in ls:
        #         if entry.name.endswith('.bin') and entry.is_file():
        #             options.append(entry.name[:-4])
        
        # return options

nested = False

def settingsPath():
    return 'settings.json' if not nested else os.path.join('..', 'settings.json')


def updateSettings(argsText, settingsText):
    settings = readSettings()

    settings['args'] = argsText
    settings['localSettings'] = settingsText

    writeSettings(settings)

def writeSettings(settings):
    try:
        with open(settingsPath(), 'w') as file:
            file.write(json.dumps(settings))
    except Exception as e:
        print(f"Error writing settings: {e}")

def readSettings():
    try:
        with open(settingsPath(), 'r') as file:
            return json.loads(file.read())
    except Exception as e:
        print(f"Error reading settings, loading defaults: {e}")
        return defaultSettings()

def defaultSettings():
    return {
        'width': 1150,
        'height': 720,
    }