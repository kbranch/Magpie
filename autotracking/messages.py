from romContents import *

protocolVersion = "1.32"

async def sendMessage(message, socket, refresh=True):
    message['refresh'] = refresh
    await socket.send(json.dumps(message))

async def sendRomRequest(socket):
    await sendMessage({
        'type': 'romRequest'
    }, socket)

    print(f'Sending request for ROM')

async def sendRomAck(socket, romType='LADXR'):
    await sendMessage({
        'type': 'romAck',
        'romType': romType,
    }, socket)

    print(f'Sending ROM ack')

async def sendSettings(socket, settingsString):
    print(f'Sending settings string: {settingsString}')

    await sendMessage({
        'type': 'settings',
        'settings': settingsString,
    }, socket)

async def sendSpoilerLog(socket, romData):
    logJson = getSpoilerLog(romData)

    print('Sending spoiler log')

    await sendMessage({
        'type': 'spoiler',
        'log': logJson,
    }, socket)

async def sendGfx(socket, state):
    await sendMessage({
        'type': 'gfx',
        'gfx': state.gfx,
    }, socket)

    state.gfxChanged = False

async def sendItems(items, socket, diff=True, refresh=True):
    if not items: return

    message = {
        'type': 'item',
        'diff': diff,
        'items': [],
    }

    for item in items:
        value = item.diff if diff else item.value

        message['items'].append(
            {
                'id': item.id,
                'qty': value,
            }
        )

        print(f'Sending {item.id}: {"+" if value > 0 and diff else ""}{item.diff}')
        item.diff = 0
    
    await sendMessage(message, socket, refresh)

async def sendChecks(checks, socket, diff=True, refresh=True):
    if not checks: return

    message = {
        'type': 'check',
        'diff': diff,
        'checks': [],
    }

    for check in checks:
        value = check.diff if diff else check.value
        
        message['checks'].append(
            {
                'id': check.id,
                'checked': value > 0,
            }
        )

        print(f'Sending {check.id}: {"+" if value > 0 and diff else ""}{value}')
        check.diff = 0
    
    await sendMessage(message, socket, refresh)

async def sendEntrances(entrances, socket, diff=True, refresh=True):
    if not entrances: return

    message = {
        'type': 'entrance',
        'diff': diff,
        'entranceMap': {},
    }

    for entrance in entrances:
        message['entranceMap'][entrance.name] = entrance.mappedIndoor
        entrance.changed = False

        print(f'Sending entrance {entrance.name}: {entrance.mappedIndoor}')
    
    await sendMessage(message, socket, refresh)

async def sendLocation(state, socket):
    if state.room is None:
        return

    await sendMessage({
        'type': 'location',
        'room': f'0x{state.room:02X}',
        'x': state.screenX,
        'y': state.screenY,
        'drawFine': True
    }, socket)
