import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import { allowAutotracking, getMapScaling, broadcastLocation, broadcastMode } from "@/moduleWrappers";
import { roomDict } from "@/metadata/mapMetadata.js";
import { useStateStore } from "./stateStore";

export const useLocationStore = defineStore('location', () => {
    const state = useStateStore();

    const currentRoom = ref(null);
    const currentX = ref(null);
    const currentY = ref(null);
    const overworldRoom = ref(null);
    const overworldX = ref(null);
    const overworldY = ref(null);
    const activeMap = ref('overworld');
    const mapContainer = ref(null);

    const locationCoords = computed(() => {
        if (activeMap.value == 'overworld') {
            return getLocationCoords(overworldRoom.value, overworldX.value, overworldY.value);
        }

        return getLocationCoords(currentRoom.value, currentX.value, currentY.value);
    });

    const scaling = computed(() => {
        if (!mapContainer.value) {
            return { x: 0, y: 0, offset: { x: 0, y: 0 } };
        }

        return getMapScaling(mapContainer.value);
    });

    const playerMap = computed(() => {
        return mapFromRoom(currentRoom.value);
    });

    function getLocationCoords(room, x, y) {
        let roomMap = mapFromRoom(room);

        let roomX;
        let roomY;
        
        if (roomMap == 'overworld') {
            let coords = room.split('0x')[1];
            roomX = Number('0x' + coords[1]) * 162 + x * 16;// + 72;
            roomY = Number('0x' + coords[0]) * 130 + y * 16;// + 58;
        }
        else {
            if (!(room in roomDict)) {
                return { x: 0, y: 0, map: 'unknown' };
            }

            let roomInfo = roomDict[room];
            roomX = roomInfo.x * 160 + x * 16;// + 72;
            roomY = roomInfo.y * 128 + y * 16;// + 58;

            if (roomMap == 'underworld') {
                roomX += 2 + roomInfo.x * 2;
                roomY += 2 + roomInfo.y * 2;
            }
        }

        return { x: roomX, y: roomY, map: roomMap };
    }

    function mapFromRoom(room) {
        if (room?.length == 4) {
            return 'overworld';
        }

        if (room in roomDict) {
            return roomDict[room].map;
        }

        return null;
    }

    function setCurrentLocation(room, x, y) {
        let newMap = mapFromRoom(room);

        if (newMap == 'overworld') {
            overworldRoom.value = room;
            overworldX.value = x;
            overworldY.value = y;
        }

        currentRoom.value = room;
        currentX.value = x;
        currentY.value = y;
    }

    function drawLocation() {
        // let roomMap = mapFromRoom(currentRoom);
        // let activeMap = getActiveMap();
    
        // vueApp.updateLinkFace(localSettings.linkFace && (!allowAutotracking || localSettings.enableAutotracking));
        state.linkFaceShowing = state.settings.linkFace && (!allowAutotracking || state.settings.enableAutotracking);
    
        if ((playerMap.value != activeMap.value
             && (activeMap.value != 'overworld'
                 || overworldRoom.value == null))
            || !state.linkFaceShowing) {
    
            // $('#linkFace').remove();
    
            return;
        }
    
        // let mapContainer = $(`img[data-mapname=${activeMap.value}]`).closest('.map-container');
        // let scaling = getMapScaling(mapContainer.value);
        // let coords = getLocationCoords(currentRoom.value, currentX.value, currentY.value);
    
        // if (activeMap.value == 'overworld') {
        //     coords = getLocationCoords(overworldRoom.value, overworldX.value, overworldY.value);
        // }
    
        // let linkFace = $('#linkFace');
    
        // if (linkFace.length == 0) {
        //     linkFace = $('<img>', {
        //         'id': 'linkFace',
        //         'draggable': false,
        //     });
    
        //     $(mapContainer).find('div.map-wrapper').append(linkFace);
        // }
    
        // linkFace.attr('src', `/images${localSettings.graphicsPack}/linkface.png`);
    
        // linkFace.css({
        //             'top': Math.round(coords.y * scaling.y + scaling.offset.y),
        //             'left': Math.round(coords.x * scaling.x + scaling.offset.x),
        //             'width': checkSize,
        //             'max-width': checkSize,
        //             'min-width': checkSize,
        //             'height': checkSize,
        //             'max-height': checkSize,
        //             'min-height': checkSize,
        //         });
        
        if (broadcastMode == 'send') {
            broadcastLocation();
        }
    }

    window.drawLocation = drawLocation;
    window.getLocationCoords = getLocationCoords;
    window.mapFromRoom = mapFromRoom;

    watch(currentRoom, () => {
        window.currentRoom = currentRoom.value;
    });
    watch(currentX, () => {
        window.currentX = currentX.value;
    });
    watch(currentY, () => {
        window.currentY = currentY.value;
    });
    watch(overworldRoom, () => {
        window.overworldRoom = overworldRoom.value;
    });
    watch(overworldX, () => {
        window.overworldX = overworldX.value;
    });
    watch(overworldY, () => {
        window.overworldY = overworldY.value;
    });

    return {
        currentRoom,
        currentX,
        currentY,
        overworldRoom,
        overworldX,
        overworldY,
        locationCoords,
        activeMap,
        playerMap,
        mapContainer,
        scaling,
        getLocationCoords,
        mapFromRoom,
        setCurrentLocation,
    };
});