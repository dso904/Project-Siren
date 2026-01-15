@echo off
title PROJECT SIREN - Exhibition Mode
color 0A
cls

echo.
echo  ======================================================
echo  ^|                                                    ^|
echo  ^|    ███████╗██╗██████╗ ███████╗███╗   ██╗          ^|
echo  ^|    ██╔════╝██║██╔══██╗██╔════╝████╗  ██║          ^|
echo  ^|    ███████╗██║██████╔╝█████╗  ██╔██╗ ██║          ^|
echo  ^|    ╚════██║██║██╔══██╗██╔══╝  ██║╚██╗██║          ^|
echo  ^|    ███████║██║██║  ██║███████╗██║ ╚████║          ^|
echo  ^|    ╚══════╝╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝          ^|
echo  ^|                                                    ^|
echo  ^|           PROJECT SIREN - EXHIBITION MODE          ^|
echo  ^|                    Safe Honeypot                   ^|
echo  ^|                                                    ^|
echo  ======================================================
echo.

echo [1/3] Starting DNS Redirect Server...
echo       (This window must stay open)
echo.
start "SIREN - DNS Server" cmd /k "cd /d "%~dp0" && node dns-server.js"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Next.js Web Server (Production Mode)...
echo       (This window must stay open)
echo.
REM NOTE: Run 'npm run build' manually once before the exhibition starts!
start "SIREN - Web Server" cmd /k "cd /d "%~dp0" && npm start"
timeout /t 5 /nobreak > nul

echo [3/3] Opening Admin Dashboard...
echo.
timeout /t 3 /nobreak > nul
start http://localhost:3000/admin

echo.
echo  ======================================================
echo  ^|                                                    ^|
echo  ^|   SIREN IS NOW ACTIVE!                             ^|
echo  ^|                                                    ^|
echo  ^|   Admin Dashboard: http://localhost:3000/admin     ^|
echo  ^|   Victim Page:     http://localhost:3000           ^|
echo  ^|                                                    ^|
echo  ^|   IMPORTANT: Make sure router DNS points to        ^|
echo  ^|   this laptop's IP address!                        ^|
echo  ^|                                                    ^|
echo  ^|   To stop: Close the DNS and Web server windows    ^|
echo  ^|                                                    ^|
echo  ======================================================
echo.
echo Press any key to close this launcher (servers will keep running)...
pause > nul
