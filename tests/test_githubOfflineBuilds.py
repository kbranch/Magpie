import os
import os.path
import json
import time
import signal
import pytest
import requests
import platform
import traceback
import subprocess

from subprocess import PIPE

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
        proc = subprocess.Popen(f'{scriptPath} --no-gui', start_new_session=True, shell=True, stderr=PIPE, stdout=PIPE, cwd=distPath)

        startTime = time.time()
        while time.time() < startTime + 45:
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
    except:
        print(f'Error starting magpie: {traceback.format_exc()}')
    finally:
        out = ''
        err = ''

        if platform.system() != 'Windows':
            if proc:
                try:
                    os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                except:
                    pass

                proc.wait(timeout=10)

                if proc.poll() is not None:
                    out, err = proc.communicate()
                    print(f'Closed process, output: {out}\n\nerr: {err}')

            if os.path.isfile(settingsPath):
                os.remove(settingsPath)
    
    assert started, f'out: {out}, err: {err}'

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