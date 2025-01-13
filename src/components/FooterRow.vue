<script setup>
import { useTextTooltipStore } from '@/stores/textTooltipStore';
import { computed } from 'vue';

const tip = useTextTooltipStore();

const props = defineProps(["version", "hostname"]);

const versionString = computed(() => {
  return props.version?.version == props.version?.build ?
    `b${props.version?.build}` :
    `v${props.version?.version} b${props.version?.build}`;
});
</script>

<template>
    <div class="pt-4"></div>
    <div class="bottom-right row">
    <div class="col footer">
        <a href="https://github.com/kbranch/Magpie" target="_blank" @mouseover="tip.tooltip('Code, documentation and bug reports on GitHub', $event)"><img src="/images/github.svg" class="dimvert footer-image"></a>
        <a href="https://ladxr.daid.eu/" target="_blank" @mouseover="tip.tooltip('LADX Randomizer', $event)"><img src="/images/ladxr.png" class="footer-image dim"></a>
        <img id="discordIcon" src="/images/discord.svg" class="dimvert footer-image">
        <a href="https://discord.gg/QhAKagk84e" target="_blank" @mouseover="tip.tooltip('Zelda 4 Randomizer Discord invite', $event)"><img src="/images/z4r-discord.png" class="footer-image dim"></a>
        <a href="https://discord.gg/YYSXW2HvT4" target="_blank" @mouseover="tip.tooltip('Magpie Tracker Discord invite', $event)"><img src="/images/magpie-big.png" class="footer-image dim"></a>
        <span class="hidden">{{hostname}}</span>
    </div>

    <div class="col-auto pe-2">
        <div class="version">
        <span>{{ versionString }}</span>
        </div>
    </div>

    <div class="col-auto ps-2 pe-0">
        <button type="button" class="btn btn-secondary" onclick="hardReset()">Hard reset state and settings</button>
    </div>
    </div>
</template>

<style scoped>
.bottom-right {
  position: absolute;
  bottom: 0px;
  right: 0px;
  display: flex;
  width: 100%;
  margin: 0px;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 12px;

}

.footer-image {
  height: 24px;
  padding-right: 8px;
}

.footer {
  display: flex;
  align-items: end;
  padding-left: 0px;
}

#discordIcon {
  padding-left: 6px;
}
</style>