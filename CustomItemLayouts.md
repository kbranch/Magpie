# Custom Item Layouts

## How to create a layout
The items pane is split into two pieces:
- [Main items](templates/mainitems)
  - [sevenbysix.html](templates/mainitems/sevenbysix.html) (the actual default these days)
  - [default.html](templates/mainitems/default.html) (the legacy default)
  - [notrade.html](templates/mainitems/notrade.html)
- [Dungeon items](templates/dungeonitems)
  - [default.html](templates/dungeonitems/default.html)
  - [compact.html](templates/dungeonitems/compact.html)

Start by downloading the section(s) you want to change. For changes like adding, removing or moving items, you can work with whole lines without having to dig into how they work.

To force a group of items to be on their own row, wrap them in a new div, like this:
```
<div class="row item-width">
    {{ item("OCARINA", max="1") }}
    {{ item("SONG1", max="1") }}
    {{ item("SONG2", max="1") }}
    {{ item("SONG3", max="1") }}
</div>
```

For more complicated changes, you may need to look at how the [`item` macro](#the-item-macro) works.

Once you have something you want to try, click the 'Pick Custom' button that matches the template you edited (main or dungeon) and select your edited file:

![image](https://github.com/kbranch/Magpie/assets/6884577/837663d9-03c9-48e4-994c-47d16d98ad88)

## How layouts work
Most of the layout definition happens in [Jinja templates](https://jinja.palletsprojects.com/en/3.1.x/). Simple changes can be done purely in the templates, but more complicated changes may involve Javascript or the `item` macro. Improvements and updates are always welcome.

The item layouts are defined in [templates/mainitems](templates/mainitems) and [templates/dungeonitems](templates/dungeonitems). Each file is selectable from a dropdown in the settings pane. Contributions are welcome - send me a new template or make a pull request and I'll get it added!

[templates/item.html](templates/item.html) contains a macro that abstracts away most of the details.

## How items work
Items associated with buttons are automatically passed to LADXR for use in logic. Items that LADXR doesn't know about are ignored in logic.

Item images must be in the form `{ITEM_NAME}_{COUNT}.png`, e.g. `SWORD_2.png` for the L2 sword.

Additional items can be added without code changes. Either the associated images must be placed in `static/images/`, or the `src` parameter must be specified in the `item` macro.

<details>
  <summary>List of items that already have images</summary>
  
- `SWORD`
- `FEATHER`
- `HOOKSHOT`
- `BOW`
- `BOMB`
- `MAGIC_POWDER`
- `MAGIC_ROD`
- `OCARINA`
- `PEGASUS_BOOTS`
- `POWER_BRACELET`
- `BOOMERANG`
- `SHIELD`
- `SHOVEL`
- `TOADSTOOL`
- `TAIL_KEY`
- `SLIME_KEY`
- `ANGLER_KEY`
- `FACE_KEY`
- `BIRD_KEY`
- `FLIPPERS`
- `BOWWOW`
- `SONG1`
- `SONG2`
- `SONG3`
- `BLUE_TUNIC`
- `RED_TUNIC`
- `MAX_ARROWS_UPGRADE`
- `MAX_BOMBS_UPGRADE`
- `MAX_POWDER_UPGRADE`
- `SEASHELL`
- `HEART_CONTAINER`
- `HEART_PIECE`
- `RUPEES_100`
- `RUPEES_20`
- `RUPEES_200`
- `RUPEES_50`
- `RUPEES_500`
- `MEDICINE`
- `GEL`
- `MESSAGE`
- `GOLD_LEAF`,`MEDICINE2`
- `CASTLE_BUTTON`
- `SINGLE_ARROW`
- `ARROWS_10`
- `ANGLER_KEYHOLE`
- `RAFT`
- `ROOSTER`,`MAP1`
- `MAP2`
- `MAP3`
- `MAP4`
- `MAP5`
- `MAP6`
- `MAP7`
- `MAP8`
- `MAP0`,  `COMPASS1`
- `COMPASS2`
- `COMPASS3`
- `COMPASS4`
- `COMPASS5`
- `COMPASS6`
- `COMPASS7`
- `COMPASS8`
- `COMPASS0`,`KEY1`
- `KEY2`
- `KEY3`
- `KEY4`
- `KEY5`
- `KEY6`
- `KEY7`
- `KEY8`
- `KEY0`
- `ITEM1` (the dungeon item counters)
- `ITEM2`
- `ITEM3`
- `ITEM4`
- `ITEM5`
- `ITEM6`
- `ITEM7`
- `ITEM8`
- `ITEM0`
- `REQ1` (the required instrument indicators)
- `REQ2`
- `REQ3`
- `REQ4`
- `REQ5`
- `REQ6`
- `REQ7`
- `REQ8`
- `REQ0`
- `NIGHTMARE_KEY1`
- `NIGHTMARE_KEY2`
- `NIGHTMARE_KEY3`
- `NIGHTMARE_KEY4`
- `NIGHTMARE_KEY5`
- `NIGHTMARE_KEY6`
- `NIGHTMARE_KEY7`
- `NIGHTMARE_KEY8`
- `NIGHTMARE_KEY0`
- `STONE_BEAK1`
- `STONE_BEAK2`
- `STONE_BEAK3`
- `STONE_BEAK4`
- `STONE_BEAK5`
- `STONE_BEAK6`
- `STONE_BEAK7`
- `STONE_BEAK8`
- `STONE_BEAK0`
- `INSTRUMENT1`
- `INSTRUMENT2`
- `INSTRUMENT3`
- `INSTRUMENT4`
- `INSTRUMENT5`
- `INSTRUMENT6`
- `INSTRUMENT7`
- `INSTRUMENT8`
- `INSTRUMENT0`
- `TRADING_ITEM_YOSHI_DOLL`
- `TRADING_ITEM_RIBBON`
- `TRADING_ITEM_DOG_FOOD`
- `TRADING_ITEM_BANANAS`
- `TRADING_ITEM_STICK`
- `TRADING_ITEM_HONEYCOMB`
- `TRADING_ITEM_PINEAPPLE`
- `TRADING_ITEM_HIBISCUS`
- `TRADING_ITEM_LETTER`
- `TRADING_ITEM_BROOM`
- `TRADING_ITEM_FISHING_HOOK`
- `TRADING_ITEM_NECKLACE`
- `TRADING_ITEM_SCALE`
- `TRADING_ITEM_MAGNIFYING_GLASS`
- `TRADING_ITEM_YOSHI_DOLL_CHECKED`
- `TRADING_ITEM_RIBBON_CHECKED`
- `TRADING_ITEM_DOG_FOOD_CHECKED`
- `TRADING_ITEM_BANANAS_CHECKED`
- `TRADING_ITEM_STICK_CHECKED`
- `TRADING_ITEM_HONEYCOMB_CHECKED`
- `TRADING_ITEM_PINEAPPLE_CHECKED`
- `TRADING_ITEM_HIBISCUS_CHECKED`
- `TRADING_ITEM_LETTER_CHECKED`
- `TRADING_ITEM_BROOM_CHECKED`
- `TRADING_ITEM_FISHING_HOOK_CHECKED`
- `TRADING_ITEM_NECKLACE_CHECKED`
- `TRADING_ITEM_SCALE_CHECKED`
- `TRADING_ITEM_MAGNIFYING_GLASS_CHECKED`
- `TOADSTOOL_CHECKED`
- `HAMMER`
</details>

## The `item` macro

[The `item` macro](templates/item.html) is a [Jinja macro](https://jinja.palletsprojects.com/en/3.1.x/templates/#macros) that creates HTML for a single item button from a simpler set of parameters:

| Parameter | Default | Description |
| --------- | ------- | ----------- |
| `primary` | | The name of the item linked to the left mouse button. The item name is case sensitive and must match LADXR's internal item name, e.g. `MAGIC_POWDER` |
| `secondary` | | The name of the item linked to the right mouse button. The item name is case sensitive and must match LADXR's internal item name, e.g. `MAX_POWDER_UPGRADE` |
| `classes` | `pt-2 px-1 col text-center` | Custom CSS classes to assign to the button |
| `max` | | Overrides the automatic maximum count detection. If omitted, the maximum count for this item will be automatically determined based on the current settings. |
| `secondaryMax` | | Same as `max`, but for the `secondary` item |
| `src` | | A JavaScript function that dynamically overrides the default image |
| `max_image` | | Caps the maximum count used for retrieving images without capping the numeric max. Useful e.g. for seashells and keys where the image shouldn't change as the count goes over 1. |
| `width` | `32px` | Width of the button, inserted as an embedded style |
| `height` | `32px` | Height of the button, inserted as an embedded style |
| `top` | | `style="top: ` applied to the button, useful for specifying position outside of the grid (e.g. the `GO_MODE` button) |
| `left` | | `style="left: ` applied to the button, useful for specifying position outside of the grid (e.g. the `GO_MODE` button) |
| `overlay_count` | | Displays a numeric count of the specified item, e.g. `overlay_count="SEASHELL"` |
| `invert_count` | `False` | If `True`, the number displayed by `overlay_count` will start at `max` (whether manual or automatic) and count down to 0 as the actual count of the item increases. Used for major dungeon items, e.g. `overlay_count="ITEM8", invert_count=True`. |
| `hideIfZero` | `False` | Whether the entire button should be hidden if the automatically determined maximum count for this item is 0 |
| `condition` | `True` | A condition that must be true for the button to be shown, e.g. `condition=allItems['ROOSTER'] == 0)` `allItems` is a dictionary of `item name`: `automatically determined maximum count` |
| `gfx` | `True` | Whether graphics packs are allowed to change this button's images |
| `highlightOwnedSecondary` | `False` | Whether the `Highlight owned items` indicator (`Bar` or `Square`) is shown when the secondary is owned. By default, this indicator only appears when the button's primary item is owned |
