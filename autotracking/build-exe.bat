rd /S /Q build
del magpie-autotracker.spec
del dist\magpie-local.zip

pyinstaller --noconfirm --onefile -n magpie-autotracker --console "autotracker.py"