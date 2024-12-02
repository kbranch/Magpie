<script setup>
</script>

<template>
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

<style scoped>
#connectorModal {
    z-index: 20002;
}
</style>