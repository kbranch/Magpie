from message import Message
from romContents import *

async def sendRomRequest(socket):
    newMessage = Message('romRequest', 'romRequest', False)
    print(f'Sending request for ROM')
    
    await newMessage.send(socket)

async def sendRomAck(socket):
    newMessage = Message('romAck', 'romAck', False)
    print(f'Sending ROM ack')
    
    await newMessage.send(socket)

async def sendSettings(socket, romData):
    settings = getSettings(romData)

    if len(settings) == 0:
        print(f'Settings not found in ROM')
        return

    print(f'Sending settings string: {settings}')

    newMessage = Message('settings', 'settings', False)
    newMessage.settings = settings
    
    await newMessage.send(socket)

async def sendSpoilerLog(socket, romData):
    logJson = getSpoilerLog(romData)

    print('Sending spoiler log')

    newMessage = Message('spoiler', 'spoiler', False)
    newMessage.log = logJson

    await newMessage.send(socket)

async def sendGfx(socket, romData):
    gfx = getGfx(romData)

    newMessage = Message('gfx', 'gfx', False)
    newMessage.gfx = gfx

    await newMessage.send(socket)

async def sendItems(items, socket, diff=True, refresh=True):
    if not items: return

    newMessage = Message('add' if diff else 'set', 'item', refresh)
    for item in items:
        value = item.diff if diff else item.value

        newMessage.items.append(
            {
                'id': item.id,
                'qty': value,
            }
        )

        print(f'Sending {item.id}: {"+" if value > 0 and diff else ""}{item.diff}')
        item.diff = 0
    
    await newMessage.send(socket)

async def sendChecks(checks, socket, diff=True, refresh=True):
    if not checks: return

    newMessage = Message('add' if diff else 'set', 'check', refresh)
    for check in checks:
        value = check.diff if diff else check.value
        
        newMessage.items.append(
            {
                'id': check.id,
                'qty': value,
            }
        )

        print(f'Sending {check.id}: {"+" if value > 0 and diff else ""}{value}')
        check.diff = 0
    
    await newMessage.send(socket)

async def sendEntrances(entrances, socket, diff=True, refresh=True):
    if not entrances: return

    newMessage = Message('add' if diff else 'set', 'entrance', refresh)
    newMessage.entranceMap = {}
    for entrance in entrances:
        newMessage.entranceMap[entrance.name] = entrance.mappedIndoor
        entrance.changed = False

        print(f'Sending entrance {entrance.name}: {entrance.mappedIndoor}')
    
    await newMessage.send(socket)

async def sendLocation(state, socket):
    if state.room is None:
        return

    newMessage = Message('set', 'location', refresh=True)
    newMessage.room = f'0x{state.room:02X}'
    newMessage.x = state.screenX
    newMessage.y = state.screenY
    
    await newMessage.send(socket)
