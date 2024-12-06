cd ..
py -3.10 -m venv .winvenv
call .winvenv\Scripts\activate.bat

.winvenv\Scripts\pip install -r requirements-ndi.txt

call npm install
call npm run build

cd scripts
