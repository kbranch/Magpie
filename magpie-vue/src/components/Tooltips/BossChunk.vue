<script setup>
import { mapBoss } from '@/moduleWrappers';

defineProps(['node', 'args']);
</script>

<template>

<div class='tooltip-text align-middle p-2'>
    {{ node.boss.mappedToMetadata().name }}
</div>

<div class="btn-group dropend">
    <button type="button" class="btn tooltip-item text-start p-0">Change</button>
    <button type="button" class="btn tooltip-item dropdown-toggle dropdown-toggle-split ps-4 pe-2 text-end" data-bs-toggle="dropdown" aria-expanded="false"></button>
    <ul class="dropdown-menu">
        <li v-for="boss in node.boss.mapOptions()" :key="boss">
            <button class="dropdown-item tooltip-item boss-item" type="button" @click="mapBoss(node.boss.id, boss.id)">
                <div class="boss-menu-image-wrapper me-2">
                    <img class="boss-menu-image" :src="`/images/${boss.id}.png`">
                </div>
                {{ boss.name }}
            </button>
        </li>
    </ul>
</div>

</template>

<style scoped>
.dropdown-menu {
    background-color: black;
    color: white;
}
</style>