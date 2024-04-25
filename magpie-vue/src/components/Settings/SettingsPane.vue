<script setup>
import { resetColors, getFile, importState, importLogicDiff, openExportStateDialog } from '@/moduleWrappers.js';
import { SettingsItem } from '@/SettingsItem.js';
import SettingsBlock from './SettingsBlock.vue';
import { ref, watch } from 'vue';

const props = defineProps({
    local: {
        type: Boolean,
        required: true,
    },
    broadcastMode: {
        type: String,
        required: true,
    },
    graphicsOptions: {
        required: true,
    },
    settings: {
        required: true,
    },
});

const stateInput = ref(null);
const logicDiffInput = ref(null);

const graphicsDict = ref({});

watch(props, (newValue) => {
    refreshItems(newValue.settings);

    let newGraphics = newValue.graphicsOptions.reduce((acc, val) => {
        acc[`/${val}`] = val;
        return acc;
    }, { '': 'Default' })

    Object.assign(graphicsDict.value, newGraphics);
})

const types = SettingsItem.types;

const layout = [
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                header: 'Randomizer Flags',
                type: types.column,
                includeRow: false,
            }),
            new SettingsItem({
                type: types.column,
                colSize: '',
                includeRow: false,
            }),
            new SettingsItem({
                type: types.column,
                includeRow: false,
                colSize: '5',
                customHtml: `<div class='row'>
                                <div class="col">
                                    <input type="text" id="shortString" class="form-control" aria-label="Short String">
                                </div>
                                <div class="col-auto">
                                    <button type="button" class="btn btn-primary" onclick="loadShortString()">Load Short String</button>
                                </div>
                            </div>`,
            }),
        ]
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                type: types.column,
                includeRow: false,
                children: [
                    new SettingsItem({
                        title: 'Main',
                        type: types.group,
                        includeRow: false,
                        children: [
                            new SettingsItem({
                                title: 'Logic',
                                type: types.dropdown,
                                settingBase: 'args',
                                settingName: 'logic',
                                options: {
                                    'casual': 'Casual',
                                    '': 'Normal',
                                    'hard': 'Hard',
                                    'glitched': 'Glitched',
                                    'hell': 'Hell',
                                }
                            }),
                            new SettingsItem({
                                title: 'Archipelago logic mode',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'ap_logic',
                                icon: 'archipelago.png',
                            }),
                        ],
                    }),
                    new SettingsItem({
                        title: 'Items',
                        type: types.group,
                        includeRow: false,
                        children: [
                            new SettingsItem({
                                title: 'Randomize heart pieces',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'heartpiece',
                                icon: 'HEART_PIECE_1.png',
                            }),
                            new SettingsItem({
                                title: 'Randomize hidden seashells',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'seashells',
                                icon: 'SEASHELL_1.png',
                            }),
                            new SettingsItem({
                                title: 'Randomize heart containers',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'heartcontainers',
                                icon: 'HEART_CONTAINER_1.png',
                            }),
                            new SettingsItem({
                                title: 'Randomize instruments',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'instruments',
                                icon: 'INSTRUMENT1_1.png',
                            }),
                            new SettingsItem({
                                title: 'Randomize trade quest',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'tradequest',
                                icon: 'TRADING_ITEM_YOSHI_DOLL_1.png',
                            }),
                            new SettingsItem({
                                title: 'Randomize item given by the witch',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'witch',
                                icon: 'TOADSTOOL_1.png',
                            }),
                            new SettingsItem({
                                title: 'Add the rooster',
                                type: types.checkbox,
                                settingBase: 'args',
                                settingName: 'rooster',
                                icon: 'ROOSTER_1.png',
                            }),
                        ],
                    }),
                    
                ]
            }),
            new SettingsItem({
                title: 'Gameplay',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Dungeon items',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'dungeon_items',
                        icon: 'KEY1_1.png',
                        options: {
                            '': 'Standard',
                            'smallkeys': 'Small keys',
                            'nightmarekeys': 'Nightmare keys',
                            'localkeys': 'Map/Compass/Beaks',
                            'localnightmarekey': 'MCB + SmallKeys',
                            'keysanity': 'Keysanity',
                            'keysy': 'Keysy',
                            'custom': 'Custom',
                        },
                    }),
                    new SettingsItem({
                        title: 'Boss shuffle',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'boss',
                        icon: 'b8.png',
                        options: {
                            'default': 'Normal',
                            'shuffle': 'Shuffle',
                            'random': 'Randomize',
                        },
                    }),
                    new SettingsItem({
                        title: 'Miniboss shuffle',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'miniboss',
                        icon: 'm1.png',
                        options: {
                            'default': 'Normal',
                            'shuffle': 'Shuffle',
                            'random': 'Randomize',
                        },
                    }),
                    new SettingsItem({
                        title: 'Goal',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'goal',
                        icon: 'egg.png',
                        options: {
                            '8': '8 instruments',
                            '7': '7 instruments',
                            '6': '6 instruments',
                            '5': '5 instruments',
                            '4': '4 instruments',
                            '3': '3 instruments',
                            '2': '2 instruments',
                            '1': '1 instruments',
                            '0': '0 instruments',
                            'open': 'Egg open',
                            'seashells': 'Seashell hunt (20)',
                            'bingo': 'Bingo!',
                            'bingo-full': 'Bingo-25!',
                        },
                    }),
                ]
            }),
            new SettingsItem({
                title: 'Entrances',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Entrance randomizer',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'entranceshuffle',
                        icon: 'entrance.svg',
                        options: {
                            'none': 'Default',
                            'simple': 'Simple',
                            'split': 'Split',
                            'mixed': 'Mixed',
                            'wild': 'Wild',
                            'chaos': 'Chaos',
                            'insane': 'Insane',
                        },
                    }),
                    new SettingsItem({
                        title: 'Random start location',
                        type: types.checkbox,
                        settingBase: 'args',
                        settingName: 'randomstartlocation',
                        icon: 'marin.png',
                    }),
                    new SettingsItem({
                        title: 'Dungeon shuffle',
                        type: types.checkbox,
                        settingBase: 'args',
                        settingName: 'dungeonshuffle',
                        icon: 'NIGHTMARE_KEY1_1.png',
                    }),
                    new SettingsItem({
                        title: 'Shuffle itemless entrances',
                        type: types.checkbox,
                        settingBase: 'args',
                        settingName: 'shufflejunk',
                        icon: 'phonebooth.png',
                    }),
                    new SettingsItem({
                        title: 'Shuffle annoying entrances',
                        type: types.checkbox,
                        settingBase: 'args',
                        settingName: 'shuffleannoying',
                        icon: 'mamu.png',
                    }),
                    new SettingsItem({
                        title: 'Shuffle water entrances',
                        type: types.checkbox,
                        settingBase: 'args',
                        settingName: 'shufflewater',
                        icon: 'manbo.png',
                    }),
                ]
            }),
            new SettingsItem({
                title: 'Special',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Good boy mode',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'bowwow',
                        icon: 'BOWWOW_1.png',
                        options: {
                            'normal': 'Disabled',
                            'always': 'Enabled',
                            'swordless': 'Enabled (swordless)',
                        },
                    }),
                    new SettingsItem({
                        title: 'Overworld',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'overworld',
                        icon: 'grass.png',
                        options: {
                            'normal': 'Normal',
                            'dungeondive': 'Dungeon dive',
                            'nodungeons': 'No dungeons',
                            'alttp': 'ALttP',
                        },
                    }),
                    new SettingsItem({
                        title: 'Owl statues',
                        type: types.dropdown,
                        settingBase: 'args',
                        settingName: 'owlstatues',
                        icon: 'owlstatue.png',
                        options: {
                            '': 'Never',
                            'dungeon': 'In dungeons',
                            'overworld': 'On the overworld',
                            'both': 'Dungeons and overworld',
                        },
                    }),
                ]
            }), // Args columns
        ], // Args section
    }),
    new SettingsItem({
        header: 'Personalization',
        type: types.column,
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                title: 'Map',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Icon size',
                        type: types.slider,
                        settingBase: 'settings',
                        settingName: 'checkSize',
                        min: 16,
                        max: 48,
                        step: 2,
                    }),
                    new SettingsItem({
                        title: 'Brightness',
                        type: types.slider,
                        settingBase: 'settings',
                        settingName: 'mapBrightness',
                        min: 25,
                        max: 100,
                        step: 1,
                    }),
                    new SettingsItem({
                        title: 'Swap mouse buttons',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'swapMouseButtons',
                    }),
                    new SettingsItem({
                        title: 'Animate checks',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'animateChecks',
                    }),
                    new SettingsItem({
                        title: 'Spoil collected items',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'spoilOnCollect',
                        helperText: 'Mark checked checks with the item they contained. Also automatically adds the contained item to your inventory. Requires a spoiler log to be loaded'
                    }),
                ],
            }),
            new SettingsItem ({
                title: 'Layout',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Swap items and map',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'swapItemsAndMap',
                    }),
                    new SettingsItem({
                        title: 'Stack map and items',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'stacked',
                    }),
                    new SettingsItem({
                        title: 'Show major dungeon item count',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showDungeonItemCount',
                    }),
                    new SettingsItem({
                        title: 'Show go mode button',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showGoMode',
                    }),
                    new SettingsItem({
                        title: 'Only show items',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showItemsOnly',
                    }),
                    new SettingsItem({
                        title: 'Highlight items on hover',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'highlightItemsOnHover',
                    }),
                    new SettingsItem({
                        title: 'Highlight owned items',
                        type: types.dropdown,
                        settingBase: 'settings',
                        settingName: 'ownedHighlight',
                        options: {
                            '': 'None',
                            'bar': 'Bar',
                            'square': 'Square',
                        },
                    }),
                ],
            }),
            new SettingsItem({
                title: 'Visibility',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Show out of logic',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showOutOfLogic',
                        customIcon: '<svg class="tooltip-check-graphic align-middle me-1"><use xlink:href="#difficulty-9"></use></svg>',
                    }),
                    new SettingsItem({
                        title: 'Show higher logic levels',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showHigherLogic',
                        icon: 'higher-logic.svg',
                    }),
                    new SettingsItem({
                        title: 'Show checked locations',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showChecked',
                        customIcon: '<svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-checked"></use></svg>',
                    }),
                    new SettingsItem({
                        title: 'Show vanilla checks',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showVanilla',
                        customIcon: '<svg class="tooltip-check-graphic align-middle"><use xlink:href="#difficulty-0-vanilla"></use></svg>',
                    }),
                    new SettingsItem({
                        title: 'Show owned vanilla pickups',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showOwnedPickups',
                        customIcon: `<div class="col-auto px-0">
                                        <div class="settings-wrapper">
                                            <div class="node-overlay-wrapper">
                                                <div class="icon-wrapper behind-tracker">
                                                    <div class="behind-tracker-overlay"></div>
                                                    <svg class="icon" style="width: 100%; height: 100%;">
                                                        <use xlink:href="#difficulty-0-vanilla"></use>
                                                    </svg>
                                                    <svg class="icon static-difficulty hollow">
                                                        <use xlink:href="#difficulty-0-hollow"></use>
                                                    </svg>
                                                    <img src="static/images/MAGIC_POWDER_1.png" class="node-item-overlay" data-node-item="MAGIC_POWDER" onmousedown="preventDoubleClick(event)">
                                                </div>
                                            </div>
                                        </div>
                                    </div>`,
                    }),
                    new SettingsItem({
                        title: 'Show vanilla entrances',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showVanillaEntrances',
                        icon: 'vanilla-entrance.svg',
                    }),
                    new SettingsItem({
                        title: 'Show logic hints',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'showLogicHints',
                        icon: 'logicHints.svg',
                    }),
                ],
            }),
            new SettingsItem({
                title: 'Autotracker',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Enable autotracker',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'enableAutotracking',
                    }),
                    new SettingsItem({
                        title: 'Server',
                        type: types.text,
                        settingBase: 'settings',
                        settingName: 'autotrackerAddress',
                        placeholder: '127.0.0.1',
                        helperText: 'Address of the device that the autotracker is running on. Hostname or IP only, no port. The autotracker listens on port 17026. Note that modern browsers will typically block insecure connections to remote addresses. Either download the offline version of Magpie or configure your browser to allow insecure WebSocket connections.',
                    }),
                    new SettingsItem({
                        title: 'Track items',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'autotrackItems',
                    }),
                    new SettingsItem({
                        title: 'Track checks',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'autotrackChecks',
                    }),
                    new SettingsItem({
                        title: 'Track entrances',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'autotrackEntrances',
                    }),
                    new SettingsItem({
                        title: 'Track settings',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'autotrackSettings',
                    }),
                    new SettingsItem({
                        title: 'Track spoilers',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'autotrackSpoilers',
                        helperText: 'Loads a spoiler log from the ROM but does not spoil anything until asked',
                    }),
                    new SettingsItem({
                        title: 'Track graphics pack',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'autotrackGraphicsPack',
                    }),
                    new SettingsItem({
                        title: 'Track location',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'linkFace',
                        icon: 'linkface.png',
                    }),
                    new SettingsItem({
                        title: 'Map follows location',
                        type: types.checkbox,
                        settingBase: 'settings',
                        settingName: 'followMap',
                    }),
                    new SettingsItem({
                        title: 'Map follows to underworld',
                        type: types.dropdown,
                        settingBase: 'settings',
                        settingName: 'followToUnderworld',
                        helperText: "'Advanced ER' means that the map will only automatically switch to the underworld when the entrance randomizer setting is set to Wild or higher",
                        options: {
                            'never': 'Never',
                            'advanced': 'Advanced ER',
                            'always': 'Always',
                        },
                    }),
                ],
            }), // Personalization columns
        ] // Personalization section
    }),
    new SettingsItem({
        header: 'Layouts',
        type: types.column,
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                title: '',
                type: types.group,
                includeRow: false,
                colSize: '3',
                children: [
                    new SettingsItem({
                        title: 'Main items',
                        type: types.dropdown,
                        settingBase: 'settings',
                        settingName: 'itemsTemplate',
                        customHtml: `<input type="file" accept=".html,.htm" class="hidden" id="customItemsInput" onchange="getFile(this, pickCustomItemsPath);">`,
                        options: {
                            'sevenbysix.html': 'Default',
                            'default.html': 'Classic',
                            'notrade.html': 'No trade items',
                            'empty.html': 'Empty',
                            'custom': 'Custom',
                        }
                    }),
                    new SettingsItem({
                        title: 'Pick Custom',
                        type: types.button,
                        action: () => { document.getElementById('customItemsInput').click(); },
                        maxWidth: true,
                    }),
                ],
            }),
            new SettingsItem({
                title: '',
                type: types.group,
                includeRow: false,
                colSize: '3',
                children: [
                    new SettingsItem({
                        title: 'Dungeon items',
                        type: types.dropdown,
                        settingBase: 'settings',
                        settingName: 'dungeonItemsTemplate',
                        customHtml: `<input type="file" accept=".html,.htm" class="hidden" id="customDungeonItemInput" onchange="getFile(this, pickCustomDungeonItemsPath);">`,
                        options: {
                            'default.html': 'Default',
                            'compact.html': 'Compact',
                            'empty.html': 'Empty',
                            'custom': 'Custom',
                        }
                    }),
                    new SettingsItem({
                        title: 'Pick Custom',
                        type: types.button,
                        action: () => { document.getElementById('customDungeonItemInput').click(); },
                        maxWidth: true,
                    }),
                ],
            }),
            new SettingsItem({
                title: '',
                type: types.group,
                includeRow: false,
                colSize: '3',
                children: [
                    new SettingsItem({
                        title: 'Graphics pack',
                        type: types.dropdown,
                        settingBase: 'settings',
                        settingName: 'graphicsPack',
                        options: graphicsDict.value,
                    }),
                ],
            }),
            new SettingsItem({
                title: 'Customization info',
                type: types.group,
                includeRow: false,
                colSize: 'auto',
                children: [
                    new SettingsItem({
                        title: 'Default main items template',
                        type: types.link,
                        href: 'https://raw.githubusercontent.com/kbranch/Magpie/master/templates/mainitems/sevenbysix.html',
                    }),
                    new SettingsItem({
                        title: 'Default dungeon items template',
                        type: types.link,
                        href: 'https://raw.githubusercontent.com/kbranch/Magpie/master/templates/dungeonitems/default.html',
                    }),
                    new SettingsItem({
                        title: 'Custom layout documentation',
                        type: types.link,
                        href: 'https://github.com/kbranch/Magpie/blob/master/CustomItemLayouts.md',
                    }),
                ],
            }),
        ]
    }), // Layouts
    new SettingsItem({
        header: 'Colors',
        type: types.column,
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff0Color',
                opacitySettingName: 'diff0Alpha',
                tooltip: 'In logic',
                customIcon: `<div class="difficulty-0 static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-0"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff0VColor',
                opacitySettingName: 'diff0VAlpha',
                tooltip: 'In logic, vanilla',
                customIcon: `<div class="difficulty-0 vanilla static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-0-vanilla"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff1Color',
                opacitySettingName: 'diff1Alpha',
                tooltip: '+1 difficulty',
                customIcon: `<div class="difficulty-1 static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-1"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff1VColor',
                opacitySettingName: 'diff1VAlpha',
                tooltip: '+1 difficulty, vanilla',
                customIcon: `<div class="difficulty-1 vanilla static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-1-vanilla"></use></svg></div>`,
            }),
        ]
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff2Color',
                opacitySettingName: 'diff2Alpha',
                tooltip: '+2 difficulty',
                customIcon: `<div class="difficulty-2 static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-2"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff2VColor',
                opacitySettingName: 'diff2VAlpha',
                tooltip: '+2 difficulty, vanilla',
                customIcon: `<div class="difficulty-2 vanilla static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-2-vanilla"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff3Color',
                opacitySettingName: 'diff3Alpha',
                tooltip: '+3, +4 difficulty',
                customIcon: `<div class="difficulty-3 static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-3"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff3VColor',
                opacitySettingName: 'diff3VAlpha',
                tooltip: '+3, +4 difficulty, vanilla',
                customIcon: `<div class="difficulty-3 vanilla static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-3-vanilla"></use></svg></div>`,
            }),
        ],
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff9Color',
                opacitySettingName: 'diff9Alpha',
                tooltip: 'Out of logic',
                customIcon: `<div class="difficulty-9 static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-9"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diff9VColor',
                opacitySettingName: 'diff9VAlpha',
                tooltip: 'Out of logic, vanilla',
                customIcon: `<div class="difficulty-9 vanilla static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-9-vanilla"></use></svg></div>`,
            }),
            new SettingsItem({
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'diffCheckedColor',
                opacitySettingName: 'diffCheckedAlpha',
                tooltip: 'Checked',
                customIcon: `<div class="difficulty-checked static-difficulty-wrapper align-middle"><svg class="icon static-difficulty"><use xlink:href="#difficulty-checked"></use></svg></div>`,
            }),
        ]
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
            new SettingsItem({
                title: 'Background color',
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'bgColor',
            }),
            new SettingsItem({
                title: 'Text color',
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'textColor',
            }),
            new SettingsItem({
                title: 'Item highlight color',
                type: types.color,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'highlightColor',
            }),
            new SettingsItem({
                title: 'Color assist maps',
                type: types.checkbox,
                includeRow: false,
                colSize: 'auto',
                settingBase: 'settings',
                settingName: 'colorAssistMaps',
            }),
        ]
    }),
    new SettingsItem({
        type: types.column,
        includeCol: false,
        children: [
        new SettingsItem({
                title: 'Reset Colors',
                type: types.button,
                includeRow: false,
                colSize: 'auto',
                action: () => { resetColors(); },
                icon: 'arrow-clockwise.svg',
                iconClass: 'invert',
                tooltip: 'Reset colors to default',
            }),
        ]
    }), // Colors
]

const settingsItems = layout.reduce((acc, item) => acc.concat(extractBindables(item)), []);

refreshItems(props.settings);

function extractBindables(item) {
    let items = [];

    for (const child of item.children) {
        if (child.settingName) {
            items.push(child);
        }
        else {
            items = items.concat(extractBindables(child));
        }
    }

    return items;
}

function refreshItems(obj) {
    for (const item of settingsItems) {
        item.refreshBind(obj);
    }
}

// {% set ns = namespace(group='') %}
//             {% set knownFlags = ['logic', 'heartpiece', 'seashells', 'heartcontainers', 'instruments', 'tradequest', 'witch', 'rooster', 'dungeon_items', 'goal', 'bowwow', 
//                                  'overworld', 'owlstatues', 'race', 'spoilerformat', 'superweapons', 'boss', 'randomstartlocation', 'dungeonshuffle', 'entranceshuffle', 
//                                  'miniboss', 'doubletrouble', 'hardMode', 'hpmode', 'accessibility_rule', 'itempool', 'boomerang', 'steal', 'test', 'romdebugmode', 'exportmap',
//                                  'removeFlashingLights', 'quickswap', 'textmode', 'removeNagMessages', 'lowhpbeep', 'music', 'input_filename', 'output_filename', 'dump',
//                                  'spoiler_filename', 'seed', 'emptyplan', 'timeout', 'log_directory', 'plan', 'multiworld', 'forwardfactor', 'linkspalette', 'accessibility',
//                                  'hardmode', 'shufflejunk', 'shuffleannoying', 'shufflewater', 'enemies'] %}

//             {% for arg in flags if  arg.name not in knownFlags %}
//                 {% if 'Other' != ns.group %}
//                     {% if ns.group != '' %}
//                         </fieldset>
//                     </div>
//                     {% endif %}
//                     <div class="col-auto">
//                         <fieldset class="form-group">
//                             <legend>Other</legend>
//                 {% endif %}

//                 <div class="row pb-3">
//                     <div class="col">
//                     {% if arg.type != 'bool' %}
//                         <label for="arg-{{arg.name}}" class="form-label">{{arg.name | title}}</label>
//                         <select id="arg-{{arg.name}}" class="form-select" data-flag="{{arg.name}}" aria-label="{{arg.name}}">
//                         {% if arg.choices != None %}
//                             {% for choice in arg.choices %}
//                                 {% if choice == arg.value %}
//                                     {% set selected = "selected" %}
//                                 {% else %}
//                                     {% set selected = "" %}
//                                 {% endif %}

//                                 <option value="{{choice}}" {{selected}}>{{choice | title}}</option>
//                             {% endfor %}
//                         {% endif %}
//                         </select>
//                     {% else %}
//                         {% if arg.value %}
//                             {% set checked = 'checked' %}
//                         {% else %}
//                             {% set checked = '' %}
//                         {% endif %}

//                         <input type="checkbox" id="arg-{{arg.name}}" class="form-check-input" data-flag="{{arg.name}}" {{checked}} value="">
//                         <label class="form-check-label" for="arg-{{arg.name}}">
//                             {{arg.name | title}}
//                         </label>
//                     {% endif %}
//                     </div>
//                 </div>

//                 {% set ns.group = 'Other' %}

//             {% endfor %}

//             {% if ns.group != '' %}
//                 </div>
//             </fieldset>
//             {% endif %}
</script>

<template>
    <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="argsOffcanvas" aria-labelledby="argsLabel">
        <div class="offcanvas-header">
            <div class="row align-items-center">
                <div class="col">
                    <h2 class="offcanvas-title" id="argsLabel">Settings</h2>
                </div>
                <div class="col">
                </div>
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas"
                aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <template v-for="item in layout" :key="item">
                <SettingsBlock v-if="(!item.settingName || item.settingBind) && item.visibleCondition()" v-model="item.settingBind" :item="item" />
            </template>
            
            <div class="row justify-content-end pt-4">
                <div class="col-auto">
                    <input ref="logicDiffInput" type="file" accept=".json" class="hidden" id="logicDiffInput"
                        @change="getFile($event.currentTarget, importLogicDiff);">
                    <button type="button" class="btn btn-secondary" @click="logicDiffInput.click();"
                        data-bs-toggle="tooltip" data-bs-title="Import Logic Diff" data-bs-trigger="hover">
                        <img class="invert" src="/images/download.svg">
                    </button>
                </div>
                <div class="col">
                </div>
                <div class="col-auto">
                    <button type="button" class="btn btn-secondary me-2" @click="openExportStateDialog()"
                        data-bs-toggle="tooltip" data-bs-title="Export Tracker State" data-bs-trigger="hover">
                        <img class="invert" src="/images/upload.svg">
                    </button>
                    <input ref="stateInput" type="file" accept=".json" class="hidden" id="stateInput"
                        @change="getFile($event.currentTarget, importState);">
                    <button type="button" class="btn btn-secondary" @click="stateInput.click();"
                        data-bs-toggle="tooltip" data-bs-title="Import Tracker State" data-bs-trigger="hover">
                        <img class="invert" src="/images/download.svg">
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>