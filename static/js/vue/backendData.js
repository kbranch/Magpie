"use strict"

function refreshItems(doCheckList=true) {
    // If this is the local version, we want to let the request go through so that the settings get saved to disk
    if (!allowItems && !local) {
        return;
    }

    $.ajax({
        type: "POST",
        url: rootPrefix + "/items",
        data: {
            args: JSON.stringify(args),
            localSettings: JSON.stringify(localSettings),
            settingsPrefix: settingsPrefix,
            isVue: true,
        },
        success: (response) => {
            if (!allowItems) {
                return;
            }

            if (localSettings.showItemsOnly) {
                $('#checkList').hide();
                $('#mapContainer').hide();
            }
            else {
                $('#checkList').show();
                $('#mapContainer').show();
            }

            for (const player of players) {
                let container = $(`[data-player="${player}"] #itemContainer`);
                container.html(response);

                let containerElement = container[0];
                for (const element of containerElement.querySelectorAll('[data-parent-player]')) {
                    element.dataset.parentPlayer = player;
                }
            }

            if (players.length <= 1) {
                //Activate the bootstrap tooltips
                let tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]:not(.itemWrapper)')
                let tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, { sanitize: false }))
            }

            if (localSettings.highlightItemsOnHover) {
                $('.itemImage').addClass('glow');
            }
            else {
                $('.itemImage').removeClass('glow');
            }

            initKnownItems();
            if (doCheckList) {
                refreshCheckList();
            }
         }
    });
}

function refreshCheckList() {
    if (!allowMap || !refreshMap) {
        return;
    }

    rateLimit(() => {
        let tempInventory = structuredClone(inventory);

        // Kiki is logically important since they open the bridge
        if (Check.isChecked('0x07B-Trade')) {
            tempInventory['TRADING_ITEM_BANANAS'] = 1;
        }

        let bossList = getBossList();
        let minibossMap = getMinibossMap();
        let originalLogic = args.logic;

        if (!localSettings.adjustDifficultyIcons) {
            args.logic = '';
        }

        let data = {
            args: JSON.stringify(args),
            inventory: JSON.stringify(tempInventory),
            entranceMap: JSON.stringify(entranceMap),
            bossList: JSON.stringify(bossList),
            minibossMap: JSON.stringify(minibossMap),
            localSettings: JSON.stringify(localSettings),
        }

        args.logic = originalLogic;

        $.ajax({
            type: "POST",
            url: rootPrefix + "/api/checkList",
            data: data,
            success: (response) => {
                console.log("Received checkList response");

                if (response.error) {
                    console.error("Error retrieving check list", response.error);
                    errorLog.push(response.error);
                    vueApp.setErrorMessage(response.error);
                    return;
                }

                pruneEntranceMap();

                let newEntrances = false;
                if (response.randomizedEntrances?.length) {
                    newEntrances = true;
                    if (randomizedEntrances) {
                        newEntrances = false;

                        for (const entrance of response.randomizedEntrances) {
                            if (!(randomizedEntrances.includes(entrance))) {
                                newEntrances = true;
                                break;
                            }
                        }
                    }
                }

                randomizedEntrances = response.randomizedEntrances;
                startLocations = response.startLocations;
                vueApp.updateAccessibility(response.accessibility);

                logicHintAccessibility = response.accessibility.logicHints.map(x => new LogicHint(x));
                vueApp.updateLogicGraph(response.accessibility.graph);

                pruneEntranceMap();
                fillVanillaLogEntrances();
                updateEntrances();

                broadcastMap();

                if (newEntrances) {
                    // We have at least one new entrance, do our best to reload old mappings
                    let reload = false;

                    for (const entrance of randomizedEntrances) {
                        if (!(entrance in entranceMap) && entrance in entranceBackup) {
                            if (!advancedER() && Entrance.isConnector(entranceBackup[entrance])) {
                                connectOneEndConnector(entrance, entranceBackup[entrance], false);
                            }
                            else {
                                connectEntrances(entrance, entranceBackup[entrance], false);
                                updateReverseMap();

                                if (advancedER()) {
                                    Connection.advancedErConnection([entrance, entranceBackup[entrance]], 'overworld');
                                }
                            }

                            updateReverseMap();

                            reload = true;
                        }
                    }

                    if (reload) {
                        saveEntrances();

                        // This will get rate limited, don't have to worry about recursion
                        refreshCheckList();
                    }

                    if (autotrackerIsConnected()) {
                        loadFromAutotracker();
                    }
                }

                setTimeout(drawActiveTab);
                setTimeout(() => {
                    vueApp.updateLogics(response.logics);
                    vueApp.updateServerVersion(response.versionDisplay, response.version, response.updateMessage);
                    vueApp.updateSidebarMessage(response.sidebarMessage);
                }, 20);
            }
        });
    }, 500);
}

function loadShortString(saveOnLoad=false) {
    let shortString = $("#shortString")[0].value;

    $.ajax({
        type: "POST",
        url: rootPrefix + "/api/shortString",
        data: {
            shortString: shortString,
        },
        success: (response) => {
            Object.keys(args).map(x => delete args[x]);
            Object.assign(args, response);
            args.flags = {};

            if (saveOnLoad) {
                saveSettings();
            }

            settingsPending = false;

            for (const message of messageQueue) {
                processMessage(message);
            }

            messageQueue = [];
        }
    });
}

function loadSpoilerLog(romData) {
    $.ajax({
        type: "POST",
        url: rootPrefix + "/api/spoilerLog",
        data: {
            romData: btoa(romData),
        },
        success: (response) => {
            loadLogContents(response);
        }
    });
}

function spoilerLogExists() {
    return Boolean(spoilerLog);
}

function errorHandler(e) {
    let entry = null

    if (e.reason) {
        entry = {
            type: e.reason.name,
            col: e.reason.columnNumber,
            line: e.reason.lineNumber,
            message: e.reason.message,
            stack: e.reason.stack,
            filename: e.reason.fileName,
        };
    }
    else {
        entry = {
            type: e.error?.name,
            col: e.colno,
            line: e.lineno,
            message: e.error ? e.error.message : e.message,
            stack: e.error ? e.error.stack : e.message,
            filename: e.filename,
        };
    }

    entry.eventTime = e.timeStamp;
    entry.unixTime = Date.now();

    errorLog.push(entry);
}

function openItemsBroadcastView() {
    window.open(rootPrefix + "/itemsBroadcast", "_blank", "width=700, height=700");
}

function openMapBroadcastView() {
    window.open(rootPrefix + "/mapBroadcast", "_blank", "width=800, height=700");
}

function init() {
    if (!players) {
        players = [''];
    }

    players.sort();

    for (const player of players) {
        if (!player) {
            continue;
        }

        playerInventories[player] = {};
    }

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', errorHandler);

    modifyTooltipAllowList();
    initKnownItems();

    if ('args' in diskSettings) {
        setLocalStorage('args', diskSettings['args'])
    }

    if ('localSettings' in diskSettings) {
        setLocalStorage('settings', diskSettings['localSettings'])
    }

    if ('localStorage' in diskSettings) {
        let state = JSON.parse(diskSettings.localStorage);
        setLocalStorage('everything', state);
    }

    let storage = { ...localStorage };
    let settingsErrors = loadSettings();
    let locationErrors = loadLocations();
    let checkErrors = loadCheckContents();

    loadBosses();

    $(document).keydown(keyDown);

    if (allowAutotracking) {
        connectToAutotracker();

        setInterval(connectToAutotracker, 3 * 1000);
    }

    $('#connectorModal').on('hide.bs.modal', () => { endGraphicalConnection(); });

    $(document).ready(function() {
        $('#bodyTextArea').summernote({
            height: 320,
        });

        broadcastInit();
    });

    if (settingsErrors.length || locationErrors.length || checkErrors.length) {
        let payload = {
            'settingsErrors': settingsErrors.map(x => x.toString()),
            'locationErrors': locationErrors.map(x => x.toString()),
            'checkErrors': checkErrors.map(x => x.toString()),
            'storage': storage,
        };

        showErrorDialog("An error occurred while loading one or more types of data. Defaults will be loaded.", JSON.stringify(payload, null, 3));
    }

    $("#argsOffcanvas").on("hide.bs.offcanvas", function() {
        /*if(skipSettingsSave) {
            skipSettingsSave = false;
            console.log("skipping");
            return;
        }

        console.log("saving");*/
        saveSettings();
    });

    applySettings();

    liveUpdatePlayers();

    var popoverTriggerList = document.querySelectorAll('button[data-bs-toggle="popover"]')
    var popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

    var timeoutId;
    function resizeTimeout(a, b, c, d) {
        removeNodes();
        clearTimeout(timeoutId);
        skipNextAnimation = true;
        timeoutId = setTimeout(drawActiveTab, 100);
    }

    function viewportResizeTimeout(a, b, c, d) {
        if (lastViewport.height != window.visualViewport.height
            || lastViewport.width != window.visualViewport.width
            || lastViewport.scale != window.visualViewport.scale
            || lastViewport.left != window.visualViewport.offsetLeft
            || lastViewport.top != window.visualViewport.offsetTop) {
            removeNodes();
            clearTimeout(timeoutId);
            skipNextAnimation = true;
            timeoutId = setTimeout(drawActiveTab, 100);
        }

        lastViewport = viewportSnapshot();
    }

    window.addEventListener("resize", resizeTimeout); // Window size
    window.visualViewport.addEventListener('resize', viewportResizeTimeout); // Pinch zoom

    let exportModal = document.getElementById('exportModal');

    if (exportModal) {
        exportModal.addEventListener('shown.bs.modal', () => {
            let textbox = document.getElementById('exportFilename');
            textbox.focus();
            textbox.select();
        });

        exportModal.addEventListener('hidden.bs.modal', () => {
            document.getElementById('argsOffcanvas').focus();
        });
    }
}

function hardReset() {
    if (confirm("Completely clear all tracker data, including settings and trackable objects?")) {
        localStorage.clear();

        uploadLocalStorage();

        location.reload();
    }
}