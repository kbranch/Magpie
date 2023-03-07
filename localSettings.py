import json

class LocalSettings:
    def __init__(self):
        self.checkSize = 32
        self.mapBrightness = 50
        self.showOutOfLogic = False
        self.animateChecks = True
        self.swapMouseButtons = False
        self.swapItemsAndMap = False
        self.hideChecked = False
        self.ignoreHigherLogic = False
        self.hideVanilla = False
        self.dungeonItemsTemplate = 'default.html'
        self.itemsTemplate = 'default.html'
        self.customDungeonItems = None
        self.customItems = None
        self.showDungeonItemCount = False
        self.showItemsOnly = False
        self.highlightItemsOnHover = True
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