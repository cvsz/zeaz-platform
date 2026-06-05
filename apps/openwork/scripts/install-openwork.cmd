@echo off
REM ============================================================================
REM OpenWork installer launcher (Windows native)
REM ----------------------------------------------------------------------------
REM Forwards to install-openwork.ps1 with execution policy bypass.
REM
REM Usage:
REM   install-openwork.cmd
REM   install-openwork.cmd --verify
REM   install-openwork.cmd --minimal
REM   install-openwork.cmd --dry-run
REM ============================================================================
setlocal
set "SCRIPT_DIR=%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%install-openwork.ps1" %*
endlocal
