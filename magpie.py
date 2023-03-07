import os
import argparse
from flaskwebgui import FlaskUI

import endpoints
from ladxrInterface import *

width = 500
height = 500

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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--local', dest='local', action='store_true', help='Start as a local application')
    parser.add_argument('--width', dest='width', action='store', default=500, type=int, help='Local application starting window width')
    parser.add_argument('--height', dest='height', action='store', default=500, type=int, help='Local application starting window height')
    args = parser.parse_args()

    local = args.local

    if args.local:
        # hide console window, but only under Windows and only if app is frozen
        if sys.platform.lower().startswith('win'):
            if getattr(sys, 'frozen', False):
                hideConsole()

        chromePaths = ['%ProgramFiles%\Google\Chrome\Application\chrome.exe',
                       '%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe',
                       '%LocalAppData%\Google\Chrome\Application\chrome.exe']
        
        browserPath = None
        
        for path in chromePaths:
            expanded = os.path.expandvars(path)
            if os.path.exists(expanded):
                browserPath = expanded
                break
        
        ui = FlaskUI(endpoints.app, port=16114, width=args.width, height=args.height, browser_path=browserPath)
        ui.run()

        if sys.platform.lower().startswith('win'):
            if getattr(sys, 'frozen', False):
                showConsole()
    else:
        endpoints.app.run()