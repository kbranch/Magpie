import time
import logging
import datetime
import traceback
import threading

postgresInstalled = False
mysqlInstalled = False

try:
    import psycopg2
    postgresInstalled = True
    logging.info('Postgres support enabled')
except:
    logging.info(f'Postgres support disabled: {traceback.format_exc()}')

try:
    import mysql.connector
    mysqlInstalled = True
    logging.info('Mysql support enabled')
except:
    logging.info(f'Mysql support disabled: {traceback.format_exc()}')

server = None
port = None
db = None
username = None
password = None
dbType = None

writeLock = threading.Lock()

def setDbInfo(newServer, newPort, newDb, newUsername, newPassword, newDbType):
    global server, port, db, username, password, dbType

    if ((newDbType == 'mysql' and not mysqlInstalled)
        or (newDbType == 'postgres' and not postgresInstalled)
        or newDbType not in ('mysql', 'postgres')):
        return

    server = newServer
    port = newPort
    db = newDb
    username = newUsername
    password = newPassword
    dbType = newDbType

def dbConfigured():
    return bool(server)

def getDbConnection():
    if dbType == 'mysql':
        return mysql.connector.connect(database=db,
                                host=server,
                                user=username,
                                password=password,
                                port=port)
    elif dbType == 'postgres':
        return psycopg2.connect(database=db,
                            host=server,
                            user=username,
                            password=password,
                            port=port)

def getCursor(conn):
    if dbType == 'mysql':
        return conn.cursor(buffered=True)
    else:
        return conn.cursor()
    
def writeState(player, playerId, event, state):
    if not dbConfigured():
        return

    timestamp = round(time.time(), 3)

    playerNoQuery = """
        select sharing.player_no
        from sharing
        where sharing.player_name = %(player)s
	    order by sharing.timestamp desc
		limit 1
    """
    # deleteQuery = """
    #     delete from sharing
    #     where sharing.player_name = %(player)s
    # """
    insertQuery = """
        insert into sharing (player_name, player_id, event_name, state, timestamp, player_no)
        values (%(player)s, %(id)s, %(event)s, %(state)s, %(timestamp)s, %(playerNo)s);
    """
    updateQuery = """
        update events
        set last_activity = current_timestamp()
        where events.name = %(event)s;
    """ if dbType == 'mysql' else """
        update events
        set last_activity = current_timestamp
        where events.name = %(event)s;
    """

    with writeLock:
        conn = getDbConnection()
        cursor = getCursor(conn)

        playerNo = None
        cursor.execute(playerNoQuery, { 'player': player })
        result = cursor.fetchone()

        if result:
            playerNo = result[0]
        
        cursor.close()
        cursor = conn.cursor()

        # cursor.execute(deleteQuery, { 'player': player })

        cursor.execute(insertQuery, {
            'player': player,
            'id': playerId,
            'event': event,
            'state': state,
            'timestamp': timestamp,
            'playerNo': playerNo,
        })

        cursor.close()
        cursor = conn.cursor()

        cursor.execute(updateQuery, {
            'event': event,
        })

        cursor.close()

        conn.commit()
        conn.close()

    return timestamp

def writeLocationHistory(playerName, sessionId, history):
    if not dbConfigured():
        return

    query = """
        insert into location_sharing (player_name, session_id, room, x, y, timestamp)
        values (%(player)s, %(session)s, %(room)s, %(x)s, %(y)s, %(timestamp)s)
    """

    with writeLock:
        conn = getDbConnection()
        cursor = getCursor(conn)
        for point in history:
            cursor.execute(query, { 
                'player': playerName,
                'session': sessionId,
                'room': point['room'],
                'x': point['x'],
                'y': point['y'],
                'timestamp': point['timestamp'],
            })
        
        cursor.close()
        conn.commit()
        conn.close()

def getLocationHistory(playerName, sessionId, timestamp, delaySeconds=0):
    if not dbConfigured():
        return

    query = """
        select location_sharing.room
              ,location_sharing.x
              ,location_sharing.y
              ,location_sharing.timestamp
        from location_sharing
        where location_sharing.timestamp > %(timestamp)s
              and location_sharing.player_name = %(player)s
              and location_sharing.session_id = %(session)s
              and (%(delaySeconds)s = 0 or location_sharing.creation_time <= date_add(current_timestamp(), interval (-1 * %(delaySeconds)s) second))
	    order by location_sharing.timestamp
    """ if dbType == 'mysql' else """
        select location_sharing.room
              ,location_sharing.x
              ,location_sharing.y
              ,location_sharing.timestamp
        from location_sharing
        where location_sharing.timestamp > %(timestamp)s
              and location_sharing.player_name = %(player)s
              and location_sharing.session_id = %(session)s
              and (%(delaySeconds)s = 0 or location_sharing.creation_time <= (current_timestamp - interval '1 second' * %(delaySeconds)s))
	    order by location_sharing.timestamp
    """

    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(query, { 
        'player': playerName,
        'session': sessionId,
        'timestamp': timestamp,
        'delaySeconds': delaySeconds,
    })

    result = cursor.fetchall()
    
    points = []
    for row in result:
        points.append({
            'room': row[0],
            'x': row[1],
            'y': row[2],
            'timestamp': float(row[3]),
        })
    
    cursor.close()
    conn.close()

    return { 'timestamp': points[-1]['timestamp'], 'points': points } if points else None

def getState(player, timestamp, delaySeconds=0):
    if not dbConfigured():
        return None

    query = """
        select sharing.state
              ,sharing.timestamp
        from sharing
        where sharing.player_name = %(player)s
              and sharing.timestamp > %(timestamp)s
              and (%(delaySeconds)s = 0 or sharing.creation_time <= date_add(current_timestamp(), interval (-1 * %(delaySeconds)s) second))
	    order by sharing.timestamp desc
		limit 1
    """ if dbType == 'mysql' else """
        select sharing.state
              ,sharing.timestamp
        from sharing
        where sharing.player_name = %(player)s
              and sharing.timestamp > %(timestamp)s
              and (%(delaySeconds)s = 0 or sharing.creation_time <= (current_timestamp - interval '1 second' * %(delaySeconds)s))
	    order by sharing.timestamp desc
		limit 1
    """

    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(query, {
        'player': player,
        'timestamp': timestamp or 0,
        'delaySeconds': delaySeconds,
    })

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return { 'state': result[0], 'timestamp': str(result[1]) } if result else None

def getPlayerId(player):
    if not dbConfigured():
        return None

    query = """
        select sharing.player_id
        from sharing
        where sharing.player_name = %(player)s
	    order by sharing.timestamp desc
		limit 1
    """

    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(query, {
        'player': player,
    })

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result[0] if result else None

def getEventPlayers(event):
    if not dbConfigured():
        return None

    threshold = datetime.datetime.now() - datetime.timedelta(hours=2)
    threshold = time.mktime(threshold.timetuple())

    query = """
        select sharing.player_name
              ,max(sharing.player_no)
        from sharing
        where sharing.event_name = %(event)s
              and sharing.timestamp > %(threshold)s
		group by sharing.player_name
        order by max(sharing.player_no)
    """

    purgeQuery = """
        update sharing
        set player_no = null
        where timestamp <= %(threshold)s
    """

    updateQuery = """
        update sharing
        set player_no = %(playerNo)s
        where player_name = %(playerName)s
    """

    with writeLock:
        conn = getDbConnection()
        cursor = conn.cursor()

        cursor.execute(query, {
            'event': event,
            'threshold': threshold,
        })

        result = cursor.fetchall()
        
        cursor.close()
        cursor = conn.cursor()

        cursor.execute(purgeQuery, {
            'threshold': threshold
        })

        conn.commit()

        players = [{ 'player': x[0], 'number': x[1] } for x in result]
        maxNumber = max([x['number'] for x in players if x['number'] != None] or [0])
        unNumberedPlayers = sorted([x for x in players if x['number'] == None], key=lambda x: x['player'].lower())

        for player in unNumberedPlayers:
            player['number'] = maxNumber + 1
        
            cursor.close()
            cursor = conn.cursor()

            cursor.execute(updateQuery, {
                'playerName': player['player'],
                'playerNo': player['number'],
            })

            maxNumber += 1

        conn.commit()

        cursor.close()
        conn.close()

    return [x['player'] for x in sorted(players, key=lambda x: x['number'])]

def eventExists(eventName):
    if not dbConfigured():
        return

    eventQuery = """
        select 1
        from events
        where events.name = %(eventName)s

        union

        select 1
        from sharing
        where sharing.event_name = %(eventName)s
    """
    
    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(eventQuery, { 'eventName': eventName })
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return bool(result)

def eventInfo(eventName):
    if not dbConfigured():
        return

    eventQuery = """
        select events.name
              ,not events.view_code is null as private_view
              ,not events.join_code is null as private_join
        from events
        where events.name = %(eventName)s

        union

        select sharing.event_name
              ,false as private_view
              ,false as private_join
        from sharing
        where sharing.event_name = %(eventName)s
		
		order by private_view desc, private_join desc
    """
    
    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(eventQuery, { 'eventName': eventName })
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return {
        'eventName': result[0],
        'privateView': result[1],
        'privateJoin': result[2],
    } if result else None

def authenticateEvent(eventName, code):
    if not dbConfigured():
        return

    eventQuery = """
        select events.join_code
              ,events.view_code
        from events
        where events.name = %(eventName)s
    """
    
    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(eventQuery, { 'eventName': eventName })
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result:
        return (code == result[0] or result[0] == None,
                code == result[1] or result[1] == None)
    
    return None

def createEvent(eventName, joinCode, viewCode):
    if not dbConfigured():
        return

    query = """
        insert into events (name, join_code, view_code)
        values (%(eventName)s, %(joinCode)s, %(viewCode)s)
    """

    success = True

    if eventExists(eventName):
        success = False

    if success:
        if joinCode == '':
            joinCode = None
        if viewCode == '':
            viewCode = None

        conn = getDbConnection()
        cursor = conn.cursor()

        cursor.execute(query, {
            'eventName': eventName,
            'joinCode': joinCode,
            'viewCode': viewCode,
        })

        conn.commit()

        cursor.close()
        conn.close()

    return success