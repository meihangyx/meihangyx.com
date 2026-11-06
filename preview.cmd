@echo off
rem =====================================================================
rem  Meihang Co., Limited - one-click local preview
rem  Double-click this file to start a local server and open the site.
rem  Requires Node.js (falls back to Python if available).
rem =====================================================================
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  echo Starting preview server with Node.js...
  node server.js 8080
  goto :done
)

where py >nul 2>nul
if %errorlevel%==0 (
  echo Starting preview server with Python...
  py -m http.server 8080
  goto :done
)

where python >nul 2>nul
if %errorlevel%==0 (
  echo Starting preview server with Python...
  python -m http.server 8080
  goto :done
)

echo.
echo Neither Node.js nor Python was found on this machine.
echo.
echo You can still open index.html directly - page navigation works, but the
echo SVG icon sprite cannot load under the file:// protocol, so icons and
echo mascots will be missing.
echo.
pause
exit /b 1

:done
echo.
echo Preview server stopped.
pause
