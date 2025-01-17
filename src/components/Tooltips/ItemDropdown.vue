<script setup>
import { setCheckContents, spoilLocation, itemsByLocation } from '@/moduleWrappers.js';
import { onMounted, ref, watch } from 'vue';

const props = defineProps(['active', 'checkId', 'node']);
const emit = defineEmits(['dropdown_opened']);

const includeItems = ref(false);
const button = ref(null);

onMounted(() => {
    button.value.addEventListener('show.bs.dropdown', () => {
        includeItems.value = true;
        emit('dropdown_opened', button.value);
    });
    button.value.addEventListener('hide.bs.dropdown', () => {
    });
});

watch(props, () => {
    includeItems.value = false;
})

const itemList = [
    ['GOOD', 'Something Good'],
    ['AP_ITEM', 'Archipelago Item'],
    ['SHIELD', 'Shield'],
    ['SWORD', 'Sword'],
    ['TOADSTOOL', 'Toadstool'],
    ['MAGIC_POWDER', 'Magic Powder'],
    ['MAX_POWDER_UPGRADE', 'Magic Powder Capacity'],
    ['SHOVEL', 'Shovel'],
    ['BOMB', 'Bomb'],
    ['MAX_BOMBS_UPGRADE', 'Bomb Capacity'],
    ['BOW', 'Bow'],
    ['MAX_ARROWS_UPGRADE', 'Arrow Capacity'],
    ['FEATHER', 'Feather'],
    ['ROOSTER', 'Rooster'],
    ['POWER_BRACELET', 'Power Bracelet'],
    ['PEGASUS_BOOTS', 'Pegasus Boots'],
    ['FLIPPERS', 'Flippers'],
    ['HOOKSHOT', 'Hookshot'],
    ['MAGIC_ROD', 'Magic Rod'],
    ['BLUE_TUNIC', 'Blue Tunic'],
    ['RED_TUNIC', 'Red Tunic'],
    ['OCARINA', 'Ocarina'],
    ['SONG1', 'Ballad of the Windfish'],
    ['SONG2', "Manbo's Mambo"],
    ['SONG3', "Frog's Song of Soul"],
    ['BOWWOW', 'Bow Wow'],
    ['BOOMERANG', 'Boomerang'],
    ['SEASHELL', 'Secret Seashell'],
    ['TAIL_KEY', 'Tail Key'],
    ['ANGLER_KEY', 'Angler Key'],
    ['FACE_KEY', 'Face Key'],
    ['BIRD_KEY', 'Bird Key'],
    ['SLIME_KEY', 'Slime Key'],
    ['GOLD_LEAF', 'Golden Leaf'],
    ['TRADING_ITEM_YOSHI_DOLL', 'Yoshi Doll'],
    ['TRADING_ITEM_RIBBON', 'Ribbon'],
    ['TRADING_ITEM_DOG_FOOD', 'Dog Food'],
    ['TRADING_ITEM_BANANAS', 'Bananas'],
    ['TRADING_ITEM_STICK', 'Stick'],
    ['TRADING_ITEM_HONEYCOMB', 'Honeycomb'],
    ['TRADING_ITEM_PINEAPPLE', 'Pineapple'],
    ['TRADING_ITEM_HIBISCUS', 'Hibiscus'],
    ['TRADING_ITEM_LETTER', 'Letter'],
    ['TRADING_ITEM_BROOM', 'Broom'],
    ['TRADING_ITEM_FISHING_HOOK', 'Fishing Hook'],
    ['TRADING_ITEM_NECKLACE', "Mermaid's Necklace"],
    ['TRADING_ITEM_SCALE', "Mermaid's Scale"],
    ['TRADING_ITEM_MAGNIFYING_GLASS', 'Magnifying Glass'],
    ['HEART_CONTAINER', 'Heart Container'],
    ['HEART_PIECE', 'Piece of Heart'],
    ['RUPEES_20', '20 Rupees'],
    ['RUPEES_50', '50 Rupees'],
    ['RUPEES_100', '100 Rupees'],
    ['RUPEES_200', '200 Rupees'],
    ['RUPEES_500', '500 Rupees'],
    ['INSTRUMENT1', 'Full Moon Cello'],
    ['INSTRUMENT2', 'Conch Horn'],
    ['INSTRUMENT3', "Sea Lily's Bell"],
    ['INSTRUMENT4', 'Surf Harp'],
    ['INSTRUMENT5', 'Wind Marimba'],
    ['INSTRUMENT6', 'Coral Triangle'],
    ['INSTRUMENT7', 'Organ of Evening Calm'],
    ['INSTRUMENT8', 'Thunder Drum'],
    ['KEY1', 'D1 Small Key'],
    ['KEY2', 'D2 Small Key'],
    ['KEY3', 'D3 Small Key'],
    ['KEY4', 'D4 Small Key'],
    ['KEY5', 'D5 Small Key'],
    ['KEY6', 'D6 Small Key'],
    ['KEY7', 'D7 Small Key'],
    ['KEY8', 'D8 Small Key'],
    ['KEY0', 'D0 Small Key'],
    ['NIGHTMARE_KEY1', 'D1 Nightmare Key'],
    ['NIGHTMARE_KEY2', 'D2 Nightmare Key'],
    ['NIGHTMARE_KEY3', 'D3 Nightmare Key'],
    ['NIGHTMARE_KEY4', 'D4 Nightmare Key'],
    ['NIGHTMARE_KEY5', 'D5 Nightmare Key'],
    ['NIGHTMARE_KEY6', 'D6 Nightmare Key'],
    ['NIGHTMARE_KEY7', 'D7 Nightmare Key'],
    ['NIGHTMARE_KEY8', 'D8 Nightmare Key'],
    ['NIGHTMARE_KEY0', 'D0 Nightmare Key'],
    ['MAP1', 'D1 Map'],
    ['MAP2', 'D2 Map'],
    ['MAP3', 'D3 Map'],
    ['MAP4', 'D4 Map'],
    ['MAP5', 'D5 Map'],
    ['MAP6', 'D6 Map'],
    ['MAP7', 'D7 Map'],
    ['MAP8', 'D8 Map'],
    ['MAP0', 'D0 Map'],
    ['COMPASS1', 'D1 Compass'],
    ['COMPASS2', 'D2 Compass'],
    ['COMPASS3', 'D3 Compass'],
    ['COMPASS4', 'D4 Compass'],
    ['COMPASS5', 'D5 Compass'],
    ['COMPASS6', 'D6 Compass'],
    ['COMPASS7', 'D7 Compass'],
    ['COMPASS8', 'D8 Compass'],
    ['COMPASS0', 'D0 Compass'],
    ['STONE_BEAK1', 'D1 Stone Beak'],
    ['STONE_BEAK2', 'D2 Stone Beak'],
    ['STONE_BEAK3', 'D3 Stone Beak'],
    ['STONE_BEAK4', 'D4 Stone Beak'],
    ['STONE_BEAK5', 'D5 Stone Beak'],
    ['STONE_BEAK6', 'D6 Stone Beak'],
    ['STONE_BEAK7', 'D7 Stone Beak'],
    ['STONE_BEAK8', 'D8 Stone Beak'],
    ['STONE_BEAK0', 'D0 Stone Beak'],
    ['MEDICINE', 'Medicine'],
    ['SINGLE_ARROW', '1 Arrow'],
    ['ARROWS_10', '10 Arrows'],
    ['GEL', 'Zol'],
    ['MESSAGE', "Master Stalfos' Message"]
];
</script>

<template>
<button ref="button" type="button" :id="`itemDropdown${checkId}`"
  class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end"
  data-bs-toggle="dropdown" aria-expanded="false"></button>

<ul class="dropdown-menu">
    <template v-if="includeItems">
        <li>
            <button class="dropdown-item tooltip-item plando-item" type="button" @click="setCheckContents(checkId, '')">
                <div class="check-item-image-wrapper me-2"></div>
                Unknown
            </button>
        </li>
        <li v-if="checkId in itemsByLocation">
            <button class="dropdown-item tooltip-item plando-item" type="button" @click="spoilLocation(checkId);">
                <div class="check-item-image-wrapper me-2"></div>
                Load from spoiler log
            </button>
        </li>
        <li v-for="item in itemList" :key="item[0]">
            <button class="dropdown-item tooltip-item plando-item" type="button" :data-item="item[0]" @click="setCheckContents(checkId, item[0])">
                <div class="check-item-image-wrapper me-2">
                    <img class="check-item-image" :src="`/images/${item[0]}_1.png`">
                </div>
                {{ item[1] }}
            </button>
        </li>
    </template>
</ul>
</template>

<style scoped>
.dropdown-menu {
    background-color: black;
}
</style>