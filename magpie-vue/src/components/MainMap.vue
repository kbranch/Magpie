<script setup>
defineProps({
    broadcastMode: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <ul class="nav" id="mapTabs">
    <li class="tab-button active" data-mapname="overworld">
        <button class="btn tab-link" id="overworldTab" type="button" onclick="drawTab(this, clear=true)">Overworld</button>
    </li>
    <li class="tab-button" data-mapname="underworld">
        <button class="btn tab-link" id="underworldTab" type="button" onclick="drawTab(this, clear=true)">Underworld</button>
    </li>
    <li class="tab-button" data-mapname="d1" data-bs-toggle="tooltip" data-bs-title="Tail Cave" data-bs-trigger="hover">
        <button class="btn tab-link" id="d1Tab" type="button" onclick="drawTab(this, clear=true)">D1</button>
    </li>
    <li class="tab-button" data-mapname="d2" data-bs-toggle="tooltip" data-bs-title="Bottle Grotto" data-bs-trigger="hover">
        <button class="btn tab-link" id="d2Tab" type="button" onclick="drawTab(this, clear=true)">D2</button>
    </li>
    <li class="tab-button" data-mapname="d3" data-bs-toggle="tooltip" data-bs-title="Key Cavern" data-bs-trigger="hover">
        <button class="btn tab-link" id="d3Tab" type="button" onclick="drawTab(this, clear=true)">D3</button>
    </li>
    <li class="tab-button" data-mapname="d4" data-bs-toggle="tooltip" data-bs-title="Angler's Tunnel" data-bs-trigger="hover">
        <button class="btn tab-link" id="d4Tab" type="button" onclick="drawTab(this, clear=true)">D4</button>
    </li>
    <li class="tab-button" data-mapname="d5" data-bs-toggle="tooltip" data-bs-title="Catfish's Maw" data-bs-trigger="hover">
        <button class="btn tab-link" id="d5Tab" type="button" onclick="drawTab(this, clear=true)">D5</button>
    </li>
    <li class="tab-button" data-mapname="d6" data-bs-toggle="tooltip" data-bs-title="Face Shrine" data-bs-trigger="hover">
        <button class="btn tab-link" id="d6Tab" type="button" onclick="drawTab(this, clear=true)">D6</button>
    </li>
    <li class="tab-button" data-mapname="d7" data-bs-toggle="tooltip" data-bs-title="Eagle's Tower" data-bs-trigger="hover">
        <button class="btn tab-link" id="d7Tab" type="button" onclick="drawTab(this, clear=true)">D7</button>
    </li>
    <li class="tab-button" data-mapname="d8" data-bs-toggle="tooltip" data-bs-title="Turtle Rock" data-bs-trigger="hover">
        <button class="btn tab-link" id="d8Tab" type="button" onclick="drawTab(this, clear=true)">D8</button>
    </li>
    <li class="tab-button" data-mapname="d0" data-bs-toggle="tooltip" data-bs-title="Color Dungeon" data-bs-trigger="hover">
        <button class="btn tab-link" id="d0Tab" type="button" onclick="drawTab(this, clear=true)">D0</button>
    </li>
    <template v-if="broadMode == 'send'">
        <div class="col"></div>
        <div v-if="broadcastMode == 'send'" class="col-auto pt-2">
            <a href="/mapBroadcast" target="_blank" onclick="openMapBroadcastView(); return false;" class="me-2" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-title="Open map broadcast view"><img class="dimvert" src="/images/pop-out.svg"></a>
        </div>
    </template>
</ul>

<div class="tabs" id="tabContents">
    <div class="tab map-container text-center active" id="overworldTabContent">
        <div class="content map-wrapper">
            <img class="map" data-mapname="overworld" src="/images/overworld.png" width="2592" height="2079" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
        </div>
    </div>
    <div class="tab map-container text-center" id="underworldTabContent">
        <div class="content map-wrapper">
            <img class="map" data-mapname="underworld" src="/images/underworld.png" width="2592" height="2079" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            <img class="map-overlay" src="/images/underworld_borders.png" width="2592" height="2079" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
        </div>
    </div>
    <div class="tab map-container text-center" id="d1TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d1" src="/images/d1.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d2TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d2" src="/images/d2.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d3TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d3" src="/images/d3.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d4TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d4" src="/images/d4.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d5TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d5" src="/images/d5.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d6TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d6" src="/images/d6.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d7TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d7" src="/images/d7.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d8TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d8" src="/images/d8.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
    <div class="tab map-container text-center" id="d0TabContent">
        <div class="content map-wrapper">
            <div>
                <img class="map" data-mapname="d0" src="/images/d0.png" onclick="closeAllTooltips();" oncontextmenu="return false;" draggable="false">
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="connectorModal" tabindex="-1" aria-labelledby="connectorModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="connectorModalLabel">Connector Info</h6>
                <button id="modalClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div data-page="1">
                    <div>
                        <h4>Pick the connector you found</h4>
                    </div>

                    <div id="connector-blockers" class="row">
                        <div class="col-auto">
                            <h6>Filter by obstacle type:</h6>
                            <div class="row">
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-sword" data-item="SWORD" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-sword"><img class="filter-image" src="/images/SWORD_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-feather" data-item="FEATHER" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-feather"><img class="filter-image" src="/images/FEATHER_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-bracelet" data-item="BRACELET" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-bracelet"><img class="filter-image" src="/images/POWER_BRACELET_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-hookshot" data-item="HOOKSHOT" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-hookshot"><img class="filter-image" src="/images/HOOKSHOT_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-boots" data-item="BOOTS" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-boots"><img class="filter-image" src="/images/PEGASUS_BOOTS_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-leaves" data-item="LEAVES" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-leaves"><img class="filter-image" src="/images/GOLD_LEAF_5.png"></label>
                                </div>
                            </div>
                            <div class="row">
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-bombs" data-item="BOMBS" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-bombs"><img class="filter-image" src="/images/BOMB_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-flippers" data-item="FLIPPERS" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-flippers"><img class="filter-image" src="/images/FLIPPERS_1.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-shield2" data-item="SHIELD2" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-shield2"><img class="filter-image" src="/images/SHIELD_2.png"></label>
                                </div>
                                <div class="filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-yoshi" data-item="YOSHI" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-yoshi"><img class="filter-image" src="/images/TRADING_ITEM_YOSHI_DOLL_1.png"></label>
                                </div>
                                <div class="filter-col end-filter-col">
                                    <input type="checkbox" class="form-check-input item-requirement" id="item-oneway" data-item="ONEWAY" onclick="filterConnectors()">
                                    <label class="form-check-label" for="item-oneway">One Way</label>
                                </div>
                            </div>
                        </div>
                        <div class="col spoil-connector d-none">
                            <div id="#spoilConnectorButton" class="row btn btn-primary big-button" onclick="spoilConnectors()">
                                <h5 class="big-button big-button-text">
                                    Spoil
                                </h5>
                            </div>
                        </div>
                        <div class="col simple-connector">
                            <div id="#simpleButton" class="row btn btn-primary big-button" onclick="connectConnectors()">
                                <h5 class="big-button big-button-text">
                                    Simple Connector
                                </h5>
                            </div>
                        </div>
                    </div>
                    <hr class="my-1">

                    <div id="connectorGrid">
                    </div>

                    <div id="connectToWarning" class="row">
                        <div class="col">
                            <h5>Can't find your connector?</h5>
                            <ul>
                                <li>
                                    If you were able to go through two different entrances, you probably found a simple connector. Click the big blue button up top!
                                </li>
                                <li>
                                    If you only went through one entrance and hit a dead end, close this and choose "Connect one end..." instead
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div data-page="2">
                    <div id="entranceAlert" class="alert alert-danger" role="alert">
                        Select the entrance you don't want to connect
                    </div>
                    <div class="row">
                        <h4>Select the entrance you didn't go through:</h4>
                    </div>
                    <div id="connectorDetailGrid" class="row" data-connector-id="">
                    </div>
                </div>

                <div data-page="3">
                    <div id="deadEndEntranceAlert" class="alert alert-danger" role="alert">
                        Select the entrance you entered through
                    </div>
                    <div class="row">
                        <h4>Select the entrance you were able to reach:</h4>
                    </div>
                    <div id="deadEndConnectorDetailGrid" class="row" data-connector-id="">
                    </div>
                </div>
            </div>
            <div class="modal-footer" data-page="2">
                <button id="connectorDoneButton" type="button" class="btn btn-primary big-button" onclick="connectConnectors(false)">Connect</button>
            </div>
            <div class="modal-footer" data-page="3">
                <button id="connectorDoneButton" type="button" class="btn btn-primary big-button" onclick="connectConnectors(false)">Connect</button>
            </div>
        </div>
    </div>
</div>
</template>