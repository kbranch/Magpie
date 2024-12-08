"use strict"

const protocolVersion = '1.32';
var defaultArgs;
var defaultSettings;
var settingsOverrides;
var argsOverrides;
var diskSettings;
var startLocations = [];
var randomizedEntrances = null;
var entranceAccessibility = null;
var checkAccessibility = null;
var logicHintAccessibility = null;
var checksById = {};
var allChecksById = {};
var localSettings = null;
var entranceMap = {};
var reverseEntranceMap = {};
var connections = [];
var bossMap = {};
var checkedChecks = new Set();
var hints = [];
var checkContents = {};
var itemLocations = {};
var hoveredItems = [];
var inventory = {};
var args = null;
var skipNextAnimation = true;
var undoStack = [];
var redoStack = [];
var graphicalMapSource = null;
var graphicalMapChoices = null;
var graphicalMapType = null;
var graphicalMapOriginalMap = null;
var autotrackerSocket = null;
var autotrackerFeatures = [];
var currentRoom = null;
var currentX = null;
var currentY = null;
var overworldRoom = null;
var overworldX = null;
var overworldY = null;
var iconStyles;
var themeStyles;
var local;
var remoteProtocolVersion = null;
var checkSize = 16;
var skipSettingsSave = false;
var maxInventory = {};
var errorLog = [];
var messageQueue = [];
var settingsPending = false;
var liveUpdate = false;
var allowAutotracking;
var allowMap;
var refreshMap;
var allowItems;
var keepQueryArgs;
var settingsPrefix;
var players;
var playerInventories = {};
var lastViewport = viewportSnapshot();
var messageLog = [];
var maxMessageLogSize = 1000;
var updateInsideEntrances = false;
var stickyBehindKeys = false;
var logicGraph = null;
var logicByCheck = {};
var logicByEntrance = {};
var broadcastMode;
var rootPrefix = "";

const renamedItems = {
    "KEY9": "KEY0",
    "NIGHTMARE_KEY9": "NIGHTMARE_KEY0",
    "MAP9": "MAP0",
    "COMPASS9": "COMPASS0",
    "STONE_BEAK9": "STONE_BEAK0",
    "INSTRUMENT9": "INSTRUMENT0",
    "REQ9": "REQ0",
    "ITEM9": "ITEM0",
};

var startHouse = 'start_house:inside';