import logging
import traceback
import threading

mysqlInstalled = False

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

writeLock = threading.Lock()

def setDbInfo(newServer, newPort, newDb, newUsername, newPassword):
    global server, port, db, username, password

    if not mysqlInstalled:
        return

    server = newServer
    port = newPort
    db = newDb
    username = newUsername
    password = newPassword

def dbConfigured():
    return bool(server)

def getDbConnection():
    return mysql.connector.connect(database=db,
                            host=server,
                            user=username,
                            password=password,
                            port=port)

def getCursor(conn):
    return conn.cursor(buffered=True)

def addTip(tip: dict):
    insertQuery = """
insert into tips (body, attribution, language, approved, deleted, title, parent_id, difficulty, node1, node2, requirement)
values (%(body)s, %(attribution)s, %(language)s, 0, 0, %(title)s, %(parentId)s, %(difficulty)s, %(node1)s, %(node2)s, %(requirement)s)
"""

    conn = getDbConnection()
    cursor = getCursor(conn)
    
    with writeLock:
        cursor.execute(insertQuery, {
            'body':tip['body'],
            'attribution': tip['attribution'],
            'language': tip['language'],
            'title': tip['title'],
            'parentId': tip['parentId'] if 'parentId' in tip else None,
            'difficulty': tip['difficulty'],
            'node1': tip['node1'],
            'node2': tip['node2'],
            'requirement': tip['requirement']
        })
        
        conn.commit()

    conn.close()

def approveTip(tipId: int, newApproval: bool):
    query = """
update tips
set approved = %(approved)s
where tips.tip_id = %(tipId)s
"""

    deleteQuery = """
update tips join tips parent on (tips.parent_id = parent.tip_id)
set parent.deleted = 1
where tips.tip_id = %(tipId)s
"""

    conn = getDbConnection()
    cursor = getCursor(conn)
    
    with writeLock:
        cursor.execute(query, {
            'tipId': tipId,
            'approved': 1 if newApproval else 0,
        })

        if newApproval:
            cursor.execute(deleteQuery, {
                'tipId': tipId,
            })
        
        conn.commit()

    conn.close()

def deleteTip(tipId: int):
    deleteQuery = """
update tips
set deleted = 1
where tips.tip_id = %(tipId)s
"""

    conn = getDbConnection()
    cursor = getCursor(conn)
    
    with writeLock:
        cursor.execute(deleteQuery, {
            'tipId': tipId,
        })
        
        conn.commit()

    conn.close()

def revertEdit(tipId: int):
    parentQuery = """
select tips.parent_id
from tips
where tips.tip_id = %(tipId)s
"""

    deleteQuery = """
update tips
set deleted = %(deleted)s
where tips.tip_id = %(tipId)s
"""

    conn = getDbConnection()
    cursor = getCursor(conn)
    
    with writeLock:
        cursor.execute(parentQuery, {
            'tipId': tipId,
        })

        result = cursor.fetchone()
        if result:
            parentId = result[0]

            cursor.execute(deleteQuery, {
                'tipId': tipId,
                'deleted': 1,
            })

            cursor.execute(deleteQuery, {
                'tipId': parentId,
                'deleted': 0,
            })
        
            conn.commit()

    conn.close()
    
def getTips(node: str, includeUnapproved: bool):
    if not dbConfigured():
        return

    tipQuery = """
select tips.tip_id
      ,tips.connection_id
      ,tips.title
      ,tips.body
      ,tips.attribution
      ,tips.language
      ,tips.approved
      ,tips.parent_id
      ,tips.node1
      ,tips.node2
      ,tips.difficulty
      ,tips.requirement
from tips
where (tips.node1 = %s
       or tips.node2 = %s)
      and (approved = 1 or %s)
      and deleted = 0
    """

    parameters = [node, node, 1 if includeUnapproved else 0]
    tips = []

    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(tipQuery, parameters)
    result = cursor.fetchall()

    cursor.close()

    for row in result:
        tips.append({
            'tipId': row[0],
            'connectionId': row[1],
            'node1': row[8],
            'node2': row[9],
            'title': row[2],
            'body': row[3],
            'attribution': row[4],
            'language': row[5],
            'approved': row[6],
            'parentId': row[7],
            'difficulty': row[10],
            'requirement': row[11],
        })

    conn.close()

    return tips

def getUnapprovedTips():
    if not dbConfigured():
        return

    tipQuery = """
select tips.tip_id
      ,tips.connection_id
      ,tips.title
      ,tips.body
      ,tips.attribution
      ,tips.language
      ,tips.approved
      ,tips.parent_id
      ,tips.node1
      ,tips.node2
      ,tips.difficulty
      ,tips.requirement
from tips
where approved = 0
      and deleted = 0
order by tips.creation_time desc
    """

    tips = []

    conn = getDbConnection()
    cursor = getCursor(conn)

    cursor.execute(tipQuery)
    result = cursor.fetchall()

    cursor.close()

    for row in result:
        tips.append({
            'tipId': row[0],
            'connectionId': row[1],
            'title': row[2],
            'body': row[3],
            'attribution': row[4],
            'language': row[5],
            'approved': row[6],
            'parentId': row[7],
            'node1': row[8],
            'node2': row[9],
            'difficulty': row[10],
            'requirement': row[11],
        })

    conn.close()

    return tips