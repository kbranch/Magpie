import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

import { allowAutotracking, broadcastLocation, broadcastMode } from "@/moduleWrappers";
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
    const mapScaling = ref(null);
    const mapContainer = ref(null);

    const locationCoords = computed(() => {
        if (activeMap.value == 'overworld') {
            return getLocationCoords(overworldRoom.value, overworldX.value, overworldY.value);
        }

        return getLocationCoords(currentRoom.value, currentX.value, currentY.value);
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
        state.linkFaceShowing = state.settings.linkFace && (!allowAutotracking || state.settings.enableAutotracking);
    
        if ((playerMap.value != activeMap.value
             && (activeMap.value != 'overworld'
                 || overworldRoom.value == null))
            || !state.linkFaceShowing) {
    
            return;
        }

        if (broadcastMode == 'send') {
            broadcastLocation();
        }
    }

    window.drawLocation = drawLocation;
    window.getLocationCoords = getLocationCoords;
    window.mapFromRoom = mapFromRoom;
    window.setCurrentLocation = setCurrentLocation;

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
        mapScaling,
        getLocationCoords,
        mapFromRoom,
        setCurrentLocation,
    };
});