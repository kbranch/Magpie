pyinstaller --noconfirm --onedir --windowed -n magpie-data --add-data "LADXR;LADXR/" --add-data "templates;templates/" --add-data "static;static/"  "magpie.py"
copy magpie.bat dist\
cd dist
tar.exe -a -c -f magpie-local.zip magpie-data magpie.bat
cd ..