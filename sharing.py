import time
import datetime
import psycopg2
import threading

server = None
port = None
db = None
username = None
password = None

writeLock = threading.Lock()

def setDbInfo(newServer, newPort, newDb, newUsername, newPassword):
    global server, port, db, username, password

    server = newServer
    port = newPort
    db = newDb
    username = newUsername
    password = newPassword

def dbConfigured():
    return bool(server)
    
def writeState(player, playerId, event, state):
    if not dbConfigured():
        return

    timestamp = round(time.time(), 3)

    playerNoQuery = """
        select sharing.player_no
        from sharing
        where sharing.player_name = %(player)s
    """
    deleteQuery = """
        delete from sharing
        where sharing.player_name = %(player)s
    """
    insertQuery = """
        insert into sharing (player_name, player_id, event_name, state, timestamp, player_no)
        values (%(player)s, %(id)s, %(event)s, %(state)s, %(timestamp)s, %(playerNo)s)
    """

    with writeLock:
        conn = getDbConnection()
        cursor = conn.cursor()

        playerNo = None
        cursor.execute(playerNoQuery, { 'player': player })
        result = cursor.fetchone()

        if result:
            playerNo = result[0]

        cursor.execute(deleteQuery, { 'player': player })

        cursor.execute(insertQuery, {
            'player': player,
            'id': playerId,
            'event': event,
            'state': state,
            'timestamp': timestamp,
            'playerNo': playerNo,
        })

        conn.commit()

        cursor.close()
        conn.close()

    return timestamp

def getState(player, timestamp):
    if not dbConfigured():
        return None

    query = """
        select sharing.state
              ,sharing.timestamp
        from sharing
        where sharing.player_name = %(player)s
              and sharing.timestamp > %(timestamp)s
    """

    conn = getDbConnection()
    cursor = conn.cursor()

    cursor.execute(query, {
        'player': player,
        'timestamp': timestamp,
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
    """

    conn = getDbConnection()
    cursor = conn.cursor()

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
              ,sharing.player_no
        from sharing
        where sharing.event_name = %(event)s
              and sharing.timestamp > %(threshold)s
        order by sharing.player_no
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

    conn = getDbConnection()
    cursor = conn.cursor()

    cursor.execute(query, {
        'event': event,
        'threshold': threshold,
    })

    result = cursor.fetchall()

    cursor.execute(purgeQuery, {
        'threshold': threshold
    })

    conn.commit()

    players = [{ 'player': x[0], 'number': x[1] } for x in result]
    maxNumber = max([x['number'] for x in players if x['number'] != None] or [0])
    unNumberedPlayers = sorted([x for x in players if x['number'] == None], key=lambda x: x['player'].lower())

    for player in unNumberedPlayers:
        player['number'] = maxNumber + 1

        cursor.execute(updateQuery, {
            'playerName': player['player'],
            'playerNo': player['number'],
        })

        maxNumber += 1

    conn.commit()

    cursor.close()
    conn.close()

    return [x['player'] for x in sorted(players, key=lambda x: x['number'])]

def getDbConnection():
    return psycopg2.connect(database=db,
                            host=server,
                            user=username,
                            password=password,
                            port=port)
