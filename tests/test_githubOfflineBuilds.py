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

    if os.getenv('CI'):
        distPath = './dist'

        if platform.system() == 'Linux':
            scriptPath = './magpie.sh'
        elif platform.system() == 'Windows':
            scriptPath = r'.\magpie.bat'
        else:
            scriptPath = './magpie.command'

        settingsPath = os.path.join(distPath, 'settings.json')
    else:
        distPath = './scripts'

        if platform.system() == 'Linux':
            scriptPath = './startLocal.sh'
        elif platform.system() == 'Windows':
            scriptPath = r'.\startLocal.bat'
        else:
            scriptPath = './startLocal.sh'

        settingsPath = 'settings.json'

    try:
        proc = subprocess.Popen(f'{scriptPath} --no-gui', start_new_session=True, shell=True, cwd=distPath)

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
        if proc:
            try:
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            except:
                proc.kill()

            proc.wait()

        if os.path.isfile(settingsPath):
            os.remove(settingsPath)
    
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
    assert initJson['version'].lower() != 'unknown'

def testIsLocal(initJson):
    assert initJson['local']