rd /S /Q build
del magpie-autotracker.spec
del dist\magpie-autotracker.exe

pyinstaller --noconfirm --onefile -n magpie-autotracker --console "autotracker.py"