import { resetColors } from '@/moduleWrappers.js';
import { SettingsItem } from '@/SettingsItem.js';

const types = SettingsItem.types;

const knownFlags = [
    'logic', 'heartpiece', 'seashells', 'heartcontainers', 'instruments', 'tradequest', 'witch', 'rooster', 'goal', 'bowwow', 
    'overworld', 'owlstatues', 'race', 'spoilerformat', 'superweapons', 'boss', 'randomstartlocation', 'dungeonshuffle', 'entranceshuffle', 
    'miniboss', 'doubletrouble', 'hardMode', 'hpmode', 'accessibility_rule', 'itempool', 'boomerang', 'steal', 'test', 'romdebugmode', 'exportmap',
    'removeFlashingLights', 'quickswap', 'textmode', 'removeNagMessages', 'lowhpbeep', 'music', 'input_filename', 'output_filename', 'dump',
    'spoiler_filename', 'seed', 'emptyplan', 'timeout', 'log_directory', 'plan', 'multiworld', 'forwardfactor', 'linkspalette', 'accessibility',
    'hardmode', 'shufflejunk', 'shuffleannoying', 'shufflewater', 'enemies', 'keyholesanity', 'shopsanity', 'evilshop', 'goalcount',
    'dungeonchainlength', 'dungeon_keys', 'dungeon_maps', 'nightmare_keys', 'dungeon_beaks',
];

const mainTemplateCredits = {
    'BusinessAlex.html': 'Created by <strong>BusinessAlex</strong>',
};

const dungeonTemplateCredits = {
};

const graphicsCredits = {
    'BusinessAlex': 'Created by <strong>BusinessAlex</strong>',
    'Sig': 'Created by <a href="https://www.twitch.tv/isabelle_zephyr">Madam Materia</a> and <strong>Techokami</strong>',
    'X': 'Created by <strong>AhziDahaka</strong>',
    'MarinAlpha': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Ricky': 'Created by <strong>Swordy</strong>',
    'Ninten': 'Created by <strong>Swordy</strong>',
    'NESLink': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Richard': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'GrandmaUlrira': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Marin': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'AgesGirl': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Tarin': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'Luigi': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'Bowwow': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'Matty': 'Created by <a href="https://www.twitch.tv/isabelle_zephyr">Madam Materia</a>',
    'Bunny': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'Meme': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'Martha': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Kirby': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Rosa': 'Created by <strong>Jill</strong>',
    'Rooster': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
    'Mario': 'Created by <a href="https://twitter.com/BenjaminMaksym">Linker</a>',
    'Subrosian': 'Created by <a href="https://www.twitch.tv/zeromeaning/">Zero Meaning</a>',
};

function getUnknownArgs(argDescriptions) {
    let newArgs = argDescriptions.filter(x => !knownFlags.includes(x.name));
    let newSettings = [];

    if (!newArgs.length) {
        return newSettings;
    }

    for (const arg of newArgs) {
        let newSetting = new SettingsItem({
            title: arg.name,
            settingBase: 'args',
            settingName: arg.name,
        })

        if (arg.type === 'bool') {
            newSetting.type = types.checkbox;
        }
        else if (arg.choices && arg.choices.length > 0) {
            newSetting.type = types.dropdown;
            newSetting.options = arg.choices.reduce((acc, x) => { acc[x] = x; return acc; }, {});
        }
        else {
            newSetting.type = types.text;
        }

        newSettings.push(newSetting);
    }

    return [
        new SettingsItem({
            type: types.column,
            includeRow: false,
            children: [
                new SettingsItem({
                    title: 'Unknown',
                    type: types.group,
                    includeRow: false,
                    children: newSettings,
                }),
            ]
        })
    ];
}

export function getLayout(args, argDescriptions, settings, graphicsDict, state) {
    let unknownArgs = getUnknownArgs(argDescriptions);

    return [
        new SettingsItem({
            type: types.column,
            includeCol: false,
            visibleCondition: () => { return ['send', 'none'].includes(window.broadcastMode) },
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
            visibleCondition: () => { return ['send', 'none'].includes(window.broadcastMode) },
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
                                    title: 'Archipelago mode',
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
                    title: 'Dungeon Items',
                    type: types.group,
                    includeRow: false,
                    colSize: 'auto',
                    children: [
                        new SettingsItem({
                            title: 'Dungeon keys',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'dungeon_keys',
                            icon: 'KEY1_1.png',
                            options: {
                                '': 'Standard',
                                'keysanity': 'Keysanity',
                                'removed': 'Removed',
                            },
                        }),
                        new SettingsItem({
                            title: 'Nightmare keys',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'nightmare_keys',
                            icon: 'NIGHTMARE_KEY1_1.png',
                            options: {
                                '': 'Standard',
                                'keysanity': 'Keysanity',
                                'removed': 'Removed',
                            },
                        }),
                        new SettingsItem({
                            title: 'Dungeon beaks',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'dungeon_beaks',
                            icon: 'STONE_BEAK1_1.png',
                            options: {
                                '': 'Standard',
                                'keysanity': 'Keysanity',
                                'removed': 'Removed',
                            },
                        }),
                        new SettingsItem({
                            title: 'Dungeon map/compass',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'dungeon_maps',
                            icon: 'MAP1_1.png',
                            options: {
                                '': 'Standard',
                                'keysanity': 'Keysanity',
                                'removed': 'Removed',
                                'custom': 'Custom',
                            },
                        }),
                        new SettingsItem({
                            type: types.column,
                            includeCol: false,
                            visibleCondition: () => { return args.dungeon_maps == 'custom' },
                            children: [
                                new SettingsItem({
                                    type: types.column,
                                    includeRow: false,
                                    colSize: '',
                                }),
                                new SettingsItem({
                                    type: types.checkbox,
                                    includeRow: false,
                                    icon: 'MAP1_1.png',
                                    settingBase: 'args',
                                    settingName: 'shuffle_maps',
                                }),
                                new SettingsItem({
                                    type: types.checkbox,
                                    includeRow: false,
                                    icon: 'COMPASS1_1.png',
                                    settingBase: 'args',
                                    settingName: 'shuffle_compasses',
                                }),
                                new SettingsItem({
                                    type: types.column,
                                    includeRow: false,
                                    colSize: '',
                                }),
                                // new SettingsItem({
                                //     type: types.checkbox,
                                //     includeRow: false,
                                //     icon: 'STONE_BEAK1_1.png',
                                //     settingBase: 'args',
                                //     settingName: 'shuffle_beaks',
                                // }),
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
                                    visibleCondition: () => { return !args.ap_logic },
                                }),
                                new SettingsItem({
                                    title: 'Entrance randomizer',
                                    type: types.dropdown,
                                    settingBase: 'args',
                                    settingName: 'entranceshuffle',
                                    icon: 'entrance.svg',
                                    options: {
                                        'none': 'Default',
                                        'simple': 'Simple',
                                    },
                                    visibleCondition: () => { return args.ap_logic },
                                }),
                                new SettingsItem({
                                    title: 'Random start location',
                                    type: types.checkbox,
                                    settingBase: 'args',
                                    settingName: 'randomstartlocation',
                                    icon: 'marin.png',
                                    visibleCondition: () => { return !args.ap_logic },
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
                                    visibleCondition: () => { return !args.ap_logic },
                                }),
                                new SettingsItem({
                                    title: 'Shuffle annoying entrances',
                                    type: types.checkbox,
                                    settingBase: 'args',
                                    settingName: 'shuffleannoying',
                                    icon: 'mamu.png',
                                    visibleCondition: () => { return !args.ap_logic },
                                }),
                                new SettingsItem({
                                    title: 'Shuffle water entrances',
                                    type: types.checkbox,
                                    settingBase: 'args',
                                    settingName: 'shufflewater',
                                    icon: 'manbo.png',
                                    visibleCondition: () => { return !args.ap_logic },
                                }),
                            ]
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
                                'vanilla': 'Vanilla',
                                'instruments': 'X instruments',
                                'specific': 'X specific instruments',
                                'open': 'Egg open',
                                'seashells': 'Seashell hunt (20)',
                                'bingo': 'Bingo!',
                                'bingo-double': 'Double Bingo!',
                                'bingo-triple': 'Triple Bingo!',
                                'bingo-full': 'Bingo-25!',
                            },
                        }),
                        new SettingsItem({
                            title: 'Goal count',
                            visibleCondition: () => { return ['specific', 'instruments'].includes(args.goal) },
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'goalcount',
                            icon: 'INSTRUMENT8_1.png',
                            options: {
                                '0': 'No instruments',
                                '1': '1 instruments',
                                '2': '2 instruments',
                                '3': '3 instruments',
                                '4': '4 instruments',
                                '5': '5 instruments',
                                '6': '6 instruments',
                                '7': '7 instruments',
                                '8': '8 instruments',
                            },
                        }),
                        new SettingsItem({
                            title: 'Item pool',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'itempool',
                            icon: 'pool.png',
                            options: {
                                '': 'Normal',
                                'casual': 'Casual',
                                'pain': 'Path of Pain',
                                'keyup': 'More keys',
                            },
                        }),
                        new SettingsItem({
                            title: 'Hard mode',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'hardmode',
                            icon: 'dead-link.png',
                            options: {
                                'none': 'Normal',
                                'oracle': 'Oracle',
                                'hero': 'Hero',
                                'ohko': 'One hit KO',
                            },
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
                        new SettingsItem({
                            title: 'Shopsanity',
                            type: types.dropdown,
                            settingBase: 'args',
                            settingName: 'shopsanity',
                            icon: 'shop.png',
                            options: {
                                '': 'Disabled',
                                'basic': 'Basic',
                                'important': 'Important',
                            },
                        }),
                        new SettingsItem({
                            title: 'Keyhole sanity',
                            type: types.checkbox,
                            settingBase: 'args',
                            settingName: 'keyholesanity',
                            icon: 'ANGLER_KEYHOLE_1.png',
                        }),
                        new SettingsItem({
                            title: 'Open mabe',
                            type: types.checkbox,
                            settingBase: 'args',
                            settingName: 'openmabe',
                            icon: 'rock.png',
                            visibleCondition: () => { return args.ap_logic },
                        }),
                        new SettingsItem({
                            title: 'Prerelease version',
                            type: types.checkbox,
                            settingBase: 'args',
                            settingName: 'prerelease',
                            icon: 'archipelago.png',
                            visibleCondition: () => { return args.ap_logic },
                        }),
                    ]
                }), // Args columns
            ].concat(unknownArgs), // Args section
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
                            detents: [25, 50, 75, 100]
                        }),
                        new SettingsItem({
                            title: 'Max page width',
                            type: types.slider,
                            settingBase: 'settings',
                            settingName: 'maxContainerWidth',
                            min: 960,
                            max: 3840,
                            step: 1,
                            detents: [1280, 1500, 1920, 2560, 3840],
                        }),
                        new SettingsItem({
                            title: 'Interact with unpinned tooltips',
                            type: types.checkbox,
                            settingBase: 'settings',
                            settingName: 'unpinnedInteract',
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
                        new SettingsItem({
                            title: 'Show legend',
                            type: types.checkbox,
                            settingBase: 'settings',
                            settingName: 'showLegend',
                        }),
                        new SettingsItem({
                            title: 'Combine in-logic difficulty icons',
                            type: types.checkbox,
                            settingBase: 'settings',
                            settingName: 'adjustDifficultyIcons',
                            helperText: 'When turned off, each logic level will have distinct icons, regardless of what logic level the seed was created on'
                        }),
                        new SettingsItem({
                            title: 'Show logic',
                            type: types.checkbox,
                            settingBase: 'settings',
                            settingName: 'showLogic',
                            helperText: 'When turned off, all checks will be marked as out of logic, and all entrances will be in logic. Useful for tracking entrances without Magpie doing all the thinking for you.'
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
                                                        <img src="/images/MAGIC_POWDER_1.png" class="node-item-overlay" data-node-item="MAGIC_POWDER" onmousedown="preventDoubleClick(event)">
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
                        new SettingsItem({
                            title: 'Show available hints',
                            type: types.checkbox,
                            settingBase: 'settings',
                            settingName: 'showHints',
                            icon: 'lightbulb-fill.svg',
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
                            placeholder: '127.0.0.1:17026',
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
            header: 'Offline Exclusives',
            type: types.column,
            visibleCondition: () => { return window.local },
        }),
        new SettingsItem({
            type: types.column,
            includeCol: false,
            visibleCondition: () => { return window.local },
            children: [
                new SettingsItem({
                    title: 'Non-browser broadcast view',
                    type: types.group,
                    includeRow: false,
                    colSize: 'auto',
                    children: [
                        new SettingsItem({
                            title: 'Items',
                            type: types.dropdown,
                            settingBase: 'settings',
                            settingName: 'broadcastItems',
                            visibleCondition: () => state.ndiEnabled,
                            options: {
                                'none': 'None',
                                'native': 'Native window',
                                'ndi': 'NDI',
                            },
                        }),
                        new SettingsItem({
                            title: 'Map',
                            type: types.dropdown,
                            settingBase: 'settings',
                            settingName: 'broadcastMap',
                            visibleCondition: () => state.ndiEnabled,
                            options: {
                                'none': 'None',
                                'native': 'Native window',
                                'ndi': 'NDI',
                            },
                        }),
                        new SettingsItem({
                            title: 'Items',
                            type: types.dropdown,
                            settingBase: 'settings',
                            settingName: 'broadcastItems',
                            visibleCondition: () => !state.ndiEnabled,
                            options: {
                                'none': 'None',
                                'native': 'Native window',
                            },
                        }),
                        new SettingsItem({
                            title: 'Map',
                            type: types.dropdown,
                            settingBase: 'settings',
                            settingName: 'broadcastMap',
                            visibleCondition: () => !state.ndiEnabled,
                            options: {
                                'none': 'None',
                                'native': 'Native window',
                            },
                        }),
                        new SettingsItem({
                            title: 'Native window background',
                            type: types.color,
                            includeRow: false,
                            colSize: 'auto',
                            settingBase: 'settings',
                            settingName: 'nativeBg',
                        }),
                    ],
                }),
                new SettingsItem({
                    type: types.group,
                    includeRow: false,
                    colSize: 'auto',
                    customHtml: `<h5 style="width: 325px; display: flex;">Also try these as browser sources or window captures in OBS</h5>`,
                    children: [
                        new SettingsItem({
                            title: new URL('/itemsBroadcast', document.baseURI).href,
                            header: 'Items',
                            headerSize: 6,
                            type: types.link,
                            href: '/itemsBroadcast',
                        }),
                        new SettingsItem({
                            title: new URL('/mapBroadcast', document.baseURI).href,
                            header: 'Map',
                            headerSize: 6,
                            type: types.link,
                            href: '/mapBroadcast',
                        }),
                    ],
                }),
                new SettingsItem({
                    title: 'NDI support is disabled',
                    type: types.group,
                    includeRow: false,
                    colSize: 'auto',
                    visibleCondition: () => !state.ndiEnabled,
                    customHtml: `<h5 style="width: 325px; display: flex;">Separate downloads with NDI support are available below</h5>`,
                    children: [
                        new SettingsItem({
                            title: 'Windows',
                            type: types.link,
                            href: 'https://magpietracker.us/static/builds/magpie-local-ndi.zip',
                        }),
                        new SettingsItem({
                            title: 'Linux',
                            type: types.link,
                            href: 'https://magpietracker.us/static/builds/magpie-local-linux-ndi.zip',
                        }),
                    ],
                }),
            ]
        }), // Offline Exclusives
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
                                'BusinessAlex.html': 'Inventory screen',
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
                        new SettingsItem({
                            type: types.link,
                            visibleCondition: () => state.settings.itemsTemplate in mainTemplateCredits,
                            customHtml: mainTemplateCredits[state.settings.itemsTemplate],
                        })
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
                        new SettingsItem({
                            type: types.link,
                            visibleCondition: () => state.settings.dungeonItemsTemplate in dungeonTemplateCredits,
                            customHtml: dungeonTemplateCredits[state.settings.dungeonItemsTemplate],
                        })
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
                        new SettingsItem({
                            type: types.link,
                            visibleCondition: () => state.settings.graphicsPack.substr(1) in graphicsCredits,
                            customHtml: graphicsCredits[state.settings.graphicsPack.substr(1)],
                        })
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
                    type: types.group,
                    includeRow: false,
                    colSize: 'auto',
                    children: [
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
                            ],
                        }),
                        new SettingsItem({
                            type: types.column,
                            includeCol: false,
                            padding: 'py-2',
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
                            ],
                        }),
                    ],
                }),
                new SettingsItem({
                    title: "Hero's path",
                    type: types.group,
                    includeRow: false,
                    colSize: 'auto',
                    children: [
                        new SettingsItem({
                            title: "Show hero's path",
                            type: types.checkbox,
                            settingBase: 'settings',
                            settingName: 'linkPathEnabled',
                        }),
                        new SettingsItem({
                            title: 'Max length',
                            type: types.slider,
                            settingBase: 'settings',
                            settingName: 'linkPathLength',
                            min: 10,
                            max: 1000,
                            step: 10,
                        }),
                        new SettingsItem({
                            title: 'Width',
                            type: types.slider,
                            settingBase: 'settings',
                            settingName: 'linkPathWidth',
                            min: 1,
                            max: 20,
                            step: 1,
                        }),
                        new SettingsItem({
                            title: 'Opacity',
                            type: types.slider,
                            settingBase: 'settings',
                            settingName: 'linkPathAlpha',
                            min: 10,
                            max: 100,
                            step: 1,
                        }),
                        new SettingsItem({
                            title: 'Path color',
                            type: types.color,
                            includeRow: false,
                            colSize: 'auto',
                            settingBase: 'settings',
                            settingName: 'linkPathColor',
                        }),
                        new SettingsItem({
                            title: 'Border color',
                            type: types.color,
                            includeRow: false,
                            colSize: 'auto',
                            settingBase: 'settings',
                            settingName: 'linkPathBorder',
                        }),
                    ],
                }),
            ],
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
            ],
        }), // Colors
    ]
}