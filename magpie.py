import os
import sys
import time
import queue
import threading
import argparse
from tkinter import TclError
from flaskwebgui import FlaskUI

import endpoints
import localSettings

if sys.platform.lower().startswith('win'):
    import ctypes

    def hideConsole():
        """
        Hides the console window in GUI mode. Necessary for frozen application, because
        this application support both, command line processing AND GUI mode and therefor
        cannot be run via pythonw.exe.
        """

        whnd = ctypes.windll.kernel32.GetConsoleWindow()
        if whnd != 0:
            ctypes.windll.user32.ShowWindow(whnd, 0)
            # if you wanted to close the handles...
            #ctypes.windll.kernel32.CloseHandle(whnd)

    def showConsole():
        """Unhides console window"""
        whnd = ctypes.windll.kernel32.GetConsoleWindow()
        if whnd != 0:
            ctypes.windll.user32.ShowWindow(whnd, 1)

def startLocal(width, height, settings, debug):
    if width == None:
        width = settings['width']
    else:
        settings['width'] = width

    if height == None:
        height = settings['height']
    else:
        settings['height'] = height
    
    if height != None or width != None:
        localSettings.writeSettings(settings)

    endpoints.diskSettings = settings

    if sys.platform.lower().startswith('win') and not debug:
        if getattr(sys, 'frozen', False):
            hideConsole()

    chromePaths = [r'%ProgramFiles%\Google\Chrome\Application\chrome.exe',
                    r'%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe',
                    r'%LocalAppData%\Google\Chrome\Application\chrome.exe']
    
    browserPath = None
    
    for path in chromePaths:
        expanded = os.path.expandvars(path)
        if os.path.exists(expanded):
            browserPath = expanded
            print(f'Found Chrome at {browserPath}')
            break
    
    ui = FlaskUI(app=endpoints.app, server="flask", port=16114, width=width, height=height)
    ui.run()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--local', dest='local', action='store_true', help='Start as a local application')
    parser.add_argument('--nested', dest='nested', action='store_true', help='Magpie is being run from a directory one level higher up the tree')
    parser.add_argument('--debug', dest='debug', action='store_true', help='Prevent the command prompt from being hidden')
    parser.add_argument('--width', dest='width', action='store', type=int, help='Local application starting window width')
    parser.add_argument('--height', dest='height', action='store', type=int, help='Local application starting window height')
    args = parser.parse_args()

    endpoints.app.config['local'] = args.local
    localSettings.nested = args.nested

    if endpoints.app.config['local']:
        settings = localSettings.readSettings()

        thread = threading.Thread(target=startLocal, args=(args.width, args.height, settings, args.debug))
        thread.start()

        while thread.is_alive():
            try:
                (callback, args) = endpoints.mainThreadQueue.get(False)
                callback(*args)
            except queue.Empty:
                endpoints.mapBroadcastView.updateWindow()
                endpoints.itemsBroadcastView.updateWindow()
            
            time.sleep(0.1)

        thread.join()

        if sys.platform.lower().startswith('win') and not args.debug:
            if getattr(sys, 'frozen', False):
                showConsole()
    else:
        endpoints.app.run()

if __name__ == "__main__":
    main()