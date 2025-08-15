@echo off
echo Iniciando ControlFlow...
set NODE_ENV=development
set PORT=5002
npx tsx server/index.ts
pause
