import os
import json
import requests

def getVersion():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'version')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return 'unknown'

def getRemoteVersion():
    try:
        request = requests.get('https://magpietracker.us/version')
        return json.loads(request.text)
    except:
        return None

def getAutotrackerVersion():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'autotracker-version')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return 'unknown'

def getUpdateMessage():
    try:
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'updateMessage')
        with open(path, 'r') as reader:
            return reader.read().strip()
    except:
        return None