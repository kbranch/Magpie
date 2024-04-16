"use strict"

function refreshItems() {
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
                let itemTooltips = document.querySelectorAll('.itemWrapper[data-bs-toggle="tooltip"]')
                tooltipList = [...itemTooltips].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, { delay: { "show": 500, "hide": 0 }, sanitize: false }))
            }

            if (localSettings.highlightItemsOnHover) {
                $('.itemImage').addClass('glow');
            }
            else {
                $('.itemImage').removeClass('glow');
            }

            initKnownItems();
            refreshCheckList();
         }
    });
}

function refreshCheckList() {
    if (!allowMap || !refreshMap) {
        return;
    }

    let tempInventory = structuredClone(inventory);

    // Kiki is logically important since they open the bridge
    if (Check.isChecked('0x07B-Trade')) {
        tempInventory['TRADING_ITEM_BANANAS'] = 1;
    }

    let bossList = getBossList();
    let minibossMap = getMinibossMap();

    $.ajax({
        type: "POST",
        url: rootPrefix + "/checkList",
        data: {
            args: JSON.stringify(args),
            inventory: JSON.stringify(tempInventory),
            entranceMap: JSON.stringify(entranceMap),
            bossList: JSON.stringify(bossList),
            minibossMap: JSON.stringify(minibossMap),
            localSettings: JSON.stringify(localSettings),
        },
        success: (response) => {
            response = JSON.parse(response);
            pruneEntranceMap();

            randomizedEntrances = response.randomizedEntrances;
            startLocations = response.startLocations;
            entranceAccessibility = response.accessibility.entrances;
            checksById = {};
            checkAccessibility = response.accessibility.checks.map(x => {
                let check = new Check(x);
                checksById[x.id] = check;
                return check;
            });

            logicHintAccessibility = response.accessibility.logicHints.map(x => new LogicHint(x));
            logicGraph = response.accessibility.graph;
            logicByCheck = {}

            for (const loc in logicGraph) {
                for (const check of logicGraph[loc].checks) {
                    logicByCheck[check] = logicGraph[loc];
                }

                if ('entrances' in logicGraph[loc]) {
                    for (const entrance of logicGraph[loc].entrances) {
                        logicByEntrance[entrance] = logicGraph[loc];
                    }
                }
            }

            vueApp.updateLogics(response.logics);

            let checkCount = new Set(checkAccessibility.filter(x => !x.isVanillaOwl() && x.id != 'egg' && !x.metadata.vanillaItem).map(x => x.id)).size;
            document.getElementById('checkCounter').innerHTML = `Total checks: ${checkCount}`;

            pruneEntranceMap();
            fillVanillaLogEntrances();
            updateEntrances();

            vueApp.updateCheckAccessibility(checkAccessibility);

            broadcastMap();

            setTimeout(drawActiveTab);
            setTimeout(refreshTextChecks, 20);
        }
    });
}

function loadShortString(saveOnLoad=false) {
    let shortString = $("#shortString")[0].value;

    $.ajax({
        type: "POST",
        url: rootPrefix + "/shortString",
        data: {
            shortString: shortString,
        },
        success: (response) => {
            let newArgs = JSON.parse(response);
            fixArgs(newArgs);
            setInputValues('flag', newArgs);

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
        url: rootPrefix + "/spoilerLog",
        data: {
            romData: btoa(romData),
        },
        success: (response) => {
            loadLogContents(response);
        }
    });
}

function errorHandler(e) {
    errorLog.push({
        col: e.colno,
        line: e.lineno,
        message: e.error.message,
        stack: e.error.stack,
        filename: e.filename,
        time: e.timeStamp,
    });
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

    $('.grid').masonry({
        transitionDuration: 0,
        columnWidth: '.text-check-card-wrapper:not(.hidden)',
    });

    modifyTooltipAllowList();
    initKnownItems();

    if ('args' in diskSettings) {
        setLocalStorage('args', diskSettings['args'])
    }

    if ('localSettings' in diskSettings) {
        setLocalStorage('settings', diskSettings['localSettings'])
    }

    let storage = { ...localStorage };
    let settingsErrors = loadSettings();
    let locationErrors = loadLocations();
    let checkErrors = loadCheckContents();

    loadBosses();

    $(document).keydown(keyDown);

    if (allowAutotracking) {
        document.addEventListener('DOMContentLoaded', function() {
            connectToAutotracker();

            setInterval(connectToAutotracker, 3 * 1000);
        });
    }

    $('#connectorModal').on('hide.bs.modal', () => { endGraphicalConnection(); });

    $(document).ready(function() {
        $('#bodyTextArea').summernote({
            height: 320,
        });
        $('#errorTextArea').summernote({
            height: 200,
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
        location.reload();
    }
}