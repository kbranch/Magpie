rd /S /Q build
del magpie-autotracker.spec
del dist\magpie-autotracker.exe

pyinstaller --noconfirm --onefile -n magpie-autotracker --add-data "LADXR;/LADXR/" --console "autotracking/autotracker.py"