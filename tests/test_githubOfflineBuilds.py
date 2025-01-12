import os
import os.path
import json
import time
import signal
import pytest
import requests
import platform
import subprocess

url = 'http://localhost:16114/'

@pytest.fixture(autouse=True, scope='session')
def startOffline():
    proc = None
    started = False
    distPath = './dist'

    if platform.system() == 'Linux':
        scriptPath = './magpie.sh'
    elif platform.system() == 'Windows':
        scriptPath = './magpie.bat'
    else:
        scriptPath = './magpie.sh'

    settingsPath = os.path.join(distPath, 'settings.json')

    try:
        proc = subprocess.Popen(scriptPath, start_new_session=True, shell=True, cwd=distPath)

        startTime = time.time()
        while time.time() < startTime + 15:
            try:
                result = requests.get(url + 'health')
                assert result.status_code == 200

                started = True
                break
            except:
                pass

            time.sleep(0.1)

        assert started

        yield
    finally:
        pass
        # if proc:
        #     os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        #     proc.wait()

        # os.remove(settingsPath)
    
    assert started

@pytest.fixture()
def initJson():
    result = requests.get(url + 'api/init')
    return json.loads(result.text)

def testRootSucceeds():
    result = requests.get(url)
    assert result.status_code == 200
    assert '<title>Magpie Tracker</title>' in result.text

def testInitSucceeds(initJson):
    assert 'args' in initJson and 'defaultSettings' in initJson

def testVersionSet(initJson):
    assert initJson['version'] != 'unknown'

def testIsLocal(initJson):
    assert initJson['local']