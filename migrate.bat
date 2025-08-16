@echo off
set DATABASE_URL=postgresql://controlflow_db:123@localhost:5432/controlflow_db

echo create column > responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt
echo create column >> responses.txt

npm run db:push < responses.txt

del responses.txt
