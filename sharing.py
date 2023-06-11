import time
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

    deleteQuery = """
        delete from sharing
        where sharing.player_name = %(player)s
    """
    insertQuery = """
        insert into sharing (player_name, player_id, event_name, state, timestamp)
        values (%(player)s, %(id)s, %(event)s, %(state)s, %(timestamp)s)
    """

    with writeLock:
        conn = getDbConnection()
        cursor = conn.cursor()

        cursor.execute(deleteQuery, { 'player': player })

        cursor.execute(insertQuery, {
            'player': player,
            'id': playerId,
            'event': event,
            'state': state,
            'timestamp': timestamp,
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

    query = """
        select sharing.player_name
        from sharing
        where sharing.event_name = %(event)s
    """

    conn = getDbConnection()
    cursor = conn.cursor()

    cursor.execute(query, {
        'event': event,
    })

    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return [x[0] for x in result]

def getDbConnection():
    return psycopg2.connect(database=db,
                            host=server,
                            user=username,
                            password=password,
                            port=port)
