import logging
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

def addTip(tip: dict):
    insertQuery = """
insert into tips (connection_id, body, attribution, language, approved, show, title)
values (%(connectionId)s, %(body)s, %(attribution)s, %(language)s, false, true, %(title)s)
"""

    conn = getDbConnection()
    cursor = getCursor(conn)
    
    with writeLock:
        cursor.execute(insertQuery, {
            'connectionId': tip['connectionId'],
            'body':tip['body'],
            'attribution': tip['attribution'],
            'language': tip['language'],
            'title': tip['title'],
        })
        
        conn.commit()

    conn.close()
    
def getTips(connectionIds: list[str]):
    if not dbConfigured():
        return

    tipQuery = """
select tips.tip_id
      ,tips.connection_id
      ,tips.body
      ,tips.attribution
      ,tips.language
from tips
where tips.connection_id in %(ids)s
      and approved = true
      and show = true
    """

    attachmentQuery = """
select filename
from tip_attachments
where tip_attachments.tip_id = %(tipId)s
      and show = true
    """

    connectionIds = tuple(connectionIds)
    tips = []

    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(tipQuery, { 'ids': connectionIds })
    result = cursor.fetchall()

    cursor.close()

    for row in result:
        tips.append({
            'tipId': row[0],
            'connectionId': row[1],
            'body': row[2],
            'attribution': row[3],
            'language': row[4],
        })

    for tip in tips:
        cursor = conn.cursor()

        cursor.execute(attachmentQuery, {
            'tipId': tip['tipId'],
        })

        result = cursor.fetchall()

        cursor.close()

        tip['attachments'] = []
        for row in result:
            tip['attachments'].append({
                'filename': row[0],
            })

    conn.close()

    return tips
