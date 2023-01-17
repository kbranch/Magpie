from json import dumps
import os
import sys
import math
import time
import hashlib
sys.path.append("LADXR")

from PIL import Image, ImageOps, ImageEnhance

from romTables import ROMWithTables

class Sprite:
    def __init__(self, item, row, col, width, palettes, mirror=False):
        self.item = item
        self.row = row
        self.col = col
        self.width = width
        self.palettes = palettes if type(palettes) == tuple else [palettes]
        self.mirror = mirror

palettes = [
    [248, 248, 168, 255,    32, 176, 72, 255,   8, 72, 40, 255,     0, 0, 0, 255],
    [248, 248, 168, 255,    136, 136, 160, 255, 40, 48, 80, 255,    0, 0, 0, 255],
    [248, 248, 168, 255,    248, 24, 88, 255,   112, 0, 40, 255,    0, 0, 0, 255],
    [248, 248, 168, 255,    200, 112, 32, 255,  112, 48, 32, 255,   0, 0, 0, 255],
    [248, 248, 168, 255,    112, 168, 248, 255, 0, 0, 248, 255,     0, 0, 0, 255],
    [248, 248, 168, 255,    248, 248, 248, 255, 16, 144, 8, 255,    0, 0, 0, 255],
    [248, 248, 168, 255,    216, 168, 32, 255,  136, 80, 0, 255,    0, 0, 0, 255],
    [248, 248, 168, 255,    16, 192, 80, 255,   0, 128, 16, 255,    0, 0, 0, 255],
    [248, 248, 168, 255,    0, 0, 0, 255,       16, 168, 64, 255,   248, 184, 152, 255],
    [0, 0, 248, 255,        0, 0, 0, 255,       248, 120, 8, 255,   248, 184, 152, 255],
    [0, 0, 248, 255,        0, 0, 0, 255,       24, 128, 248, 255,  248, 184, 152, 255],
    [0, 0, 248, 255,        0, 0, 0, 255,       136, 136, 160, 255, 248, 248, 248, 255],
    [0, 0, 248, 255,        248, 176, 48, 255,  232, 24, 48, 255,   0, 0, 0, 255],
    [0, 0, 248, 255,        0, 0, 0, 255,       16, 168, 64, 255,   248, 248, 248, 255],
    [0, 0, 248, 255,        0, 0, 0, 255,       248, 0, 0, 255,     248, 248, 248, 255],
    [0, 0, 248, 255,        0, 0, 0, 255,       0, 0, 248, 255,     248, 248, 248, 255],
    [255, 0, 0, 0,          248, 216, 24, 255,  0, 120, 16, 255,    0, 0, 0, 255],
    [255, 0, 0, 0,          255, 255, 255, 255, 232, 8, 16, 255,    0, 0, 0, 255],
    [255, 0, 0, 0,          0, 0, 0, 255,       168, 120, 16, 255,  248, 248, 168, 255],
]

feather = Sprite('FEATHER_1', 1, 9, 1, 3)
rooster = Sprite('ROOSTER_1', 51, 42, 2, 10)

sprites = [
    Sprite('linkface', 0, 0, 2, 8),
    Sprite('SHIELD_1', 1, 3, 1, 1),
    Sprite('SHIELD_2', 1, 3, 1, 12),
    Sprite('SWORD_1', 1, 2, 1, 1),
    Sprite('SWORD_2', 1, 2, 1, 12),
    Sprite('TOADSTOOL_1', 5, 6, 1, 12),
    Sprite('MAGIC_POWDER_1', 1, 7, 1, 3),
    Sprite('SHOVEL_1', 1, 11, 1, (3, 1)),
    Sprite('BOMB_1', 1, 0, 1, 1),
    Sprite('BOW_1', 1, 4, 1, 3),
    Sprite('POWER_BRACELET_1', 1, 1, 1, 1),
    Sprite('POWER_BRACELET_2', 1, 1, 1, 2),
    Sprite('PEGASUS_BOOTS_1', 1, 12, 1, 3),
    Sprite('FLIPPERS_1', 1, 10, 1, 4),
    Sprite('HOOKSHOT_1', 1, 5, 1, (1, 2)),
    Sprite('MAGIC_ROD_1', 1, 6, 1, (2, 1)),
    Sprite('OCARINA_1', 1, 8, 1, 2),
    Sprite('SONG1_1', 5, 12, 1, 9, mirror=True),
    Sprite('SONG2_1', 5, 13, 1, 10, mirror=True),
    Sprite('SONG3_1', 5, 14, 1, 8, mirror=True),
    Sprite('BOWWOW_1', 20, 36, 2, 10),
    Sprite('BOOMERANG_1', 1, 18, 1, 2),
    Sprite('SEASHELL_1', 1, 15, 1, 3),
    Sprite('TAIL_KEY_1', 1, 32, 1, 6),
    Sprite('ANGLER_KEY_1', 1, 33, 1, 6),
    Sprite('FACE_KEY_1', 1, 34, 1, 6),
    Sprite('BIRD_KEY_1', 1, 35, 1, 6),
    Sprite('SLIME_KEY_1', 5, 7, 1, 6),
    Sprite('TRADING_ITEM_YOSHI_DOLL_1', 1, 13, 2, 5),
    Sprite('TRADING_ITEM_RIBBON_1', 0, 32, 2, 2),
    Sprite('TRADING_ITEM_DOG_FOOD_1', 0, 34, 2, 1),
    Sprite('TRADING_ITEM_BANANAS_1', 0, 36, 2, 6),
    Sprite('TRADING_ITEM_STICK_1', 0, 38, 2, 6),
    Sprite('TRADING_ITEM_HONEYCOMB_1', 0, 40, 2, 6),
    Sprite('TRADING_ITEM_PINEAPPLE_1', 0, 42, 2, 16),
    Sprite('TRADING_ITEM_HIBISCUS_1', 0, 44, 2, 12),
    Sprite('TRADING_ITEM_LETTER_1', 0, 46, 2, 17),
    Sprite('TRADING_ITEM_BROOM_1', 0, 48, 2, 6),
    Sprite('TRADING_ITEM_FISHING_HOOK_1', 0, 50, 2, 1),
    Sprite('TRADING_ITEM_NECKLACE_1', 0, 52, 2, 2),
    Sprite('TRADING_ITEM_SCALE_1', 0, 54, 2, 2),
    Sprite('TRADING_ITEM_MAGNIFYING_GLASS_1', 0, 56, 2, 4),
    Sprite('INSTRUMENT1_1', 42, 0, 2, 18),
    Sprite('INSTRUMENT2_1', 42, 2, 2, 18),
    Sprite('INSTRUMENT3_1', 42, 4, 2, 18),
    Sprite('INSTRUMENT4_1', 42, 6, 2, 18),
    Sprite('INSTRUMENT5_1', 42, 8, 2, 18),
    Sprite('INSTRUMENT6_1', 42, 10, 2, 18),
    Sprite('INSTRUMENT7_1', 42, 12, 2, 18),
    Sprite('INSTRUMENT8_1', 42, 14, 2, 18),
]

def getPalette(rom, bank, addr):
    palette = []

    for _ in range(4):
        p0 = rom.banks[bank][addr]
        p1 = rom.banks[bank][addr + 1]
        pal = p0 | p1 << 8
        addr += 2
        r = (pal & 0x1F) << 3
        g = ((pal >> 5) & 0x1F) << 3
        b = ((pal >> 10) & 0x1F) << 3
        # print(f'{r} {g} {b}')
        palette += [r, g, b, 255]

    return palette

def getIcon(source, sprite):
    with open(source, 'rb') as iFile:
        data = bytearray(iFile.read())

    icon = Image.new("P", (16, 16))
    for idx in range(sprite.row * 64 + sprite.col, sprite.row * 64 + sprite.col + (sprite.width - 1) + 1):
        buffer = bytearray(b'\x00' * 16 * 8)

        for y in range(16):
            a = data[idx * 32 + y * 2]
            b = data[idx * 32 + y * 2 + 1]

            for x in range(8):
                v = 0
                if a & (0x80 >> x):
                    v |= 1
                if b & (0x80 >> x):
                    v |= 2
                buffer[x+y*8] = v

        tile = Image.frombytes('P', (8, 16), bytes(buffer))
        offset = 0 if sprite.width == 2 or sprite.mirror else 4
        x = (idx - (sprite.row * 64 + sprite.col)) * 8 + offset
        y = 0

        icon.paste(tile, (x, y))

        if sprite.mirror:
            icon = ImageOps.mirror(icon)
            icon.paste(tile, (x, y))
    
    if len(sprite.palettes) > 1:
        for x in range(0, icon.width):
            for y in range(8, icon.height):
                icon.putpixel((x, y), icon.getpixel((x, y)) + 4)

    palette = []
    for index in sprite.palettes:
        subPalette = palettes[index]

        subPalette[0] = 255
        subPalette[1] = 0
        subPalette[2] = 0
        subPalette[3] = 0
        palette += subPalette

    icon.putpalette(palette, rawmode='RGBA')

    return icon.resize((48, 48))

def deactivateIcon(icon):
    icon = icon.convert('LA') # greyscale with alpha - ImageOps.greyscale() removes the alpha
    enhancer = ImageEnhance.Brightness(icon)
    return enhancer.enhance(0.70)

def dumpJump(source, dest):
    activeFeather = getIcon(source, feather).convert('RGBA')
    inactiveFeather = deactivateIcon(activeFeather).convert('RGBA')
    activeRooster = ImageOps.mirror(getIcon(source, rooster)).convert('RGBA')
    inactiveRooster = deactivateIcon(activeRooster).convert('RGBA')

    noJump = inactiveRooster.copy()
    noJump.paste(inactiveFeather, (-12, 0), inactiveFeather)
    noJump.save(dest + 'NO_JUMP.png')

    bothJump = activeRooster.copy()
    bothJump.paste(activeFeather, (-12, 0), activeFeather)
    bothJump.save(dest + 'BOTH_JUMP.png')

    featherOnly = inactiveRooster.copy()
    featherOnly.paste(activeFeather, (-12, 0), activeFeather)
    featherOnly.save(dest + 'FEATHER.png')

    roosterOnly = activeRooster.copy()
    roosterOnly.paste(inactiveFeather, (-12, 0), inactiveFeather)
    roosterOnly.save(dest + 'ROOSTER.png')

def dumpIcon(source, dest, sprite):
    icon = getIcon(source, sprite)

    icon.save(dest + sprite.item + '.png')

    if sprite.item.endswith('_1'):
        name = sprite.item.replace('_1', '_0')
        icon = deactivateIcon(icon)
        icon.save(dest + name + '.png')

def dumpSpriteSheet(path, output, palette):
    with open(path, 'rb') as iFile:
        data = bytearray(iFile.read())

    icon = Image.new("P", (512, math.floor(len(data) / 512 * 4)))
    for idx in range(0, math.floor(len(data) / 32)):#4096*4):
        buffer = bytearray(b'\x00' * 16 * 8)

        for y in range(16):
            a = data[idx * 32 + y * 2]
            b = data[idx * 32 + y * 2 + 1]

            for x in range(8):
                v = 0
                if a & (0x80 >> x):
                    v |= 1
                if b & (0x80 >> x):
                    v |= 2
                buffer[x+y*8] = v

        tile = Image.frombytes('P', (8, 16), bytes(buffer))
        x = (idx * 8) % 512
        y = (math.floor(idx / 64)) * 16

        icon.paste(tile, (x, y))
    
    palette[0] = 255
    palette[1] = 0
    palette[2] = 0
    palette[3] = 0
    icon.putpalette(palette, rawmode='RGBA')
    icon.save(output)

def main():
    # # Main palettes
    # updatePal(rom, 0x21, 0x1518, 0x34F0)
    # # Intro palettes
    # updatePal(rom, 0x21, 0x3536, 0x3E6E)
    # # Inventory menu
    # updatePal(rom, 0x20, 0x1D61, 0x1DE1)
    # Those are banknr, start offset, end offset
    # so rom offset would be 0x21 * 0x4000 + 0x1518

    gfxPath = 'LADXR/gfx/'
    # outputPath = 'SpriteSheet-{}.png'
    # bank = 0x20
    # romPath = 'ladx1.0.gbc'
    # rom = ROMWithTables(open(romPath, 'rb'))

    # for addr in range(0x1D61, 0x1DE1, 8):
    #     palettes.append(getPalette(rom, bank, addr))
    
    # palettes.append(
    #     [255, 0, 0, 0] +
    #     [248, 216, 24, 255] +
    #     [0, 120, 16, 255] + 
    #     [0, 0, 0, 255]
    # )
    # palettes.append(
    #     [255, 0, 0, 0] +
    #     [255, 255, 255, 255] +
    #     [232, 8, 16, 255] +
    #     [0, 0, 0, 255]
    # )
    # palettes.append(
    #     [255, 0, 0, 0] +
    #     [0, 0, 0, 255] +
    #     [168, 120, 16, 255] +
    #     [248, 248, 168, 255]
    # )

    # print(palettes)

    hashes = {}
    with os.scandir(gfxPath) as ls:
        for entry in ls:
            if entry.name.endswith('.bin') and entry.is_file():
                destPath = f'./static/images/{entry.name[:-4]}/'

                if not os.path.exists(destPath):
                    os.makedirs(destPath)

                for sprite in sprites:
                    dumpIcon(entry.path, destPath, sprite)
                
                dumpJump(entry.path, destPath)

                with open(entry.path, 'rb') as iFile:
                    data = bytearray(iFile.read(256))
                    hashes[hashlib.sha1(data[:256]).hexdigest()] = entry.name[:-4]
    
    print(hashes)

    # i = 0
    # for palette in palettes:
    #     dumpSpriteSheet('./LADXR/gfx/AgesGirl.bin', f'./graphics/sheet-{i}.png', palette)
    #     i += 1

    # for room_index in list(range(0x100)) + ["Alt06", "Alt0E", "Alt1B", "Alt2B", "Alt79", "Alt8C"]:
    #     if isinstance(room_index, int):
    #         room_nr = room_index
    #     else:
    #         room_nr = int(room_index[3:], 16)
    #     # tileset_index = rom.banks[0x3F][0x2f00 + room_nr]

    #     palette_index = rom.banks[0x21][0x02EF + room_nr]
    #     palette_addr = rom.banks[0x21][0x02B1 + palette_index * 2]
    #     palette_addr |= rom.banks[0x21][0x02B1 + palette_index * 2 + 1] << 8
    #     palette_addr -= 0x4000

    #     palette = []
    #     for n in range(8*4):
    #         p0 = rom.banks[0x21][palette_addr]
    #         p1 = rom.banks[0x21][palette_addr + 1]
    #         pal = p0 | p1 << 8
    #         palette_addr += 2
    #         r = (pal & 0x1F) << 3
    #         g = ((pal >> 5) & 0x1F) << 3
    #         b = ((pal >> 10) & 0x1F) << 3
    #         print(f'{r} {g} {b}')
    #         palette += [r, g, b]

    #     img = PIL.Image.new("P", (16*16, 16*16))
    #     img.putpalette(palette)

    # data = requests.get(url + v).content
    # data = None
    # with open('ladx1.0.gbc', 'rb') as iFile:
    #     data = bytearray(iFile.read())

    # with open('gfx/AgesGirl.bin', 'rb') as iFile:
    #     data = bytearray(iFile.read())

main()