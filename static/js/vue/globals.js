"use strict"

const protocolVersion = '1.32';
var defaultArgs;// = tryParseJson('{{jsonArgs|safe}}');
var defaultSettings;// = tryParseJson('{{jsonSettings|safe}}');
var settingsOverrides;// = tryParseJson('{{jsonSettingsOverrides|safe}}');
var argsOverrides;// = tryParseJson('{{jsonArgsOverrides|safe}}');
var diskSettings;// = tryParseJson('{{diskSettings|safe}}');
var startLocations = [];
var randomizedEntrances = null;
var entranceAccessibility = null;
var checkAccessibility = null;
var logicHintAccessibility = null;
var checksById = {};
var localSettings = null;
var entranceMap = {};
var reverseEntranceMap = {};
var connections = [];
var bossMap = {};
var checkedChecks = new Set();
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
var romRequested = false;
var autotrackerFeatures = [];
var currentRoom = null;
var currentX = null;
var currentY = null;
var overworldRoom = null;
var overworldX = null;
var overworldY = null;
var iconStyles;// = $('link[href="./static/css/icons.css"]')[0].sheet;
var themeStyles;// = $('link[href="./static/css/theme.css"]')[0].sheet;
var local;// = '{{local}}' == 'True';
var remoteProtocolVersion = null;
var checkSize = 16;
var skipSettingsSave = false;
var maxInventory = {};
var errorLog = [];
var messageQueue = [];
var settingsPending = false;
var liveUpdate = false;
var allowAutotracking;// = '{{allowAutotracking}}' == 'True';
var allowMap;// = '{{allowMap}}' == 'True';
var refreshMap;// = !('{{refreshMap}}' == 'False');
var allowItems;// = '{{allowItems}}' == 'True';
var keepQueryArgs;// = '{{keepQueryArgs}}' == 'True';
var settingsPrefix;// = '{{settingsPrefix}}';
var players; // = {{players|safe}};
var playerInventories = {};
var lastViewport = viewportSnapshot();
var messageLog = [];
var maxMessageLogSize = 1000;
var updateInsideEntrances = false;
var stickyBehindKeys = false;
var logicGraph = null;
var logicByCheck = {};
var logicByEntrance = {};
var broadcastMode;// = '{{broadcastMode}}';
var rootPrefix = "";
var isVue = true;

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