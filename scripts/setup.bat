cd ..
py -3 -m venv .winvenv
call .winvenv\Scripts\activate.bat
.winvenv\Scripts\pip install -r requirements.txt
cd Scripts
