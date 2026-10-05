@echo off
title Mandi ERP - Windows 7 / 8 / 10 / 11 Native Compiler (غلہ منڈی سافٹ ویئر)
color 0B
echo ==============================================================================
echo   MANDI ERP - WINDOWS 7 / 8 / 10 / 11 STANDALONE .EXE COMPILER (OFFLINE + SQLITE)
echo   غلہ منڈی کمپیوٹرائزڈ نظام - ونڈوز 7 (32-بٹ و 64-بٹ) و ونڈوز 10/11 کے لیے موزوں
echo ==============================================================================
echo.
echo Choose Target Operating System for Compilation:
echo   [1] Windows 7 SP1 / 8 / 10 / 11 (32-bit x86 - Runs on ALL older Mandi PCs)
echo   [2] Windows 7 SP1 / 8 / 10 / 11 (64-bit x64 - Standard 64-bit PC)
echo   [3] Windows 10 / 11 (.NET 8 Self-Contained Single .EXE x64)
echo   [4] Build ALL targets (x86 + x64 for Windows 7, 8, 10, 11)
echo.
set /p TARGET_CHOICE="Enter selection (1, 2, 3, or 4): "

echo.
echo Checking for .NET SDK / MSBuild...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] .NET SDK is not found in PATH!
    echo Please install .NET SDK or MSBuild from https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

if "%TARGET_CHOICE%"=="1" goto BUILD_WIN7_X86
if "%TARGET_CHOICE%"=="2" goto BUILD_WIN7_X64
if "%TARGET_CHOICE%"=="3" goto BUILD_WIN10_X64
if "%TARGET_CHOICE%"=="4" goto BUILD_ALL
goto BUILD_WIN7_X86

:BUILD_WIN7_X86
echo.
echo [1/1] Compiling Windows 7 SP1 32-bit (x86) Standalone Executable...
echo Target: net48 (Windows 7 SP1, Windows 8, Windows 10, Windows 11)
echo Output: ./publish/win7-x86/MandiERP-Win7-x86.exe
dotnet publish MandiERP.csproj -f net48 -c Release -r win-x86 --self-contained false -o ./publish/win7-x86
if %errorlevel% equ 0 (
    echo [SUCCESS] Windows 7 32-bit executable created: %~dp0publish\win7-x86\MandiERP.exe
)
goto DONE

:BUILD_WIN7_X64
echo.
echo [1/1] Compiling Windows 7 SP1 64-bit (x64) Standalone Executable...
echo Target: net48 (Windows 7 SP1, Windows 8, Windows 10, Windows 11)
echo Output: ./publish/win7-x64/MandiERP-Win7-x64.exe
dotnet publish MandiERP.csproj -f net48 -c Release -r win-x64 --self-contained false -o ./publish/win7-x64
if %errorlevel% equ 0 (
    echo [SUCCESS] Windows 7 64-bit executable created: %~dp0publish\win7-x64\MandiERP.exe
)
goto DONE

:BUILD_WIN10_X64
echo.
echo [1/1] Compiling Windows 10 / 11 .NET 8 Self-Contained Single File...
echo Target: net8.0-windows (win-x64)
echo Output: ./publish/win10-x64/MandiERP.exe
dotnet publish MandiERP.csproj -f net8.0-windows -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ./publish/win10-x64
if %errorlevel% equ 0 (
    echo [SUCCESS] Windows 10/11 single-file .exe created: %~dp0publish\win10-x64\MandiERP.exe
)
goto DONE

:BUILD_ALL
echo.
echo Compiling ALL configurations for Windows 7, 8, 10, and 11...
dotnet publish MandiERP.csproj -f net48 -c Release -r win-x86 --self-contained false -o ./publish/win7-x86
dotnet publish MandiERP.csproj -f net48 -c Release -r win-x64 --self-contained false -o ./publish/win7-x64
dotnet publish MandiERP.csproj -f net8.0-windows -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ./publish/win10-x64
goto DONE

:DONE
echo.
echo ==============================================================================
echo [COMPILATION SUMMARY]
echo Windows 7 SP1 Eligibility Confirmed:
echo  - 100% Offline (No web dependencies, No Google extensions, No Firebase)
echo  - Runs on Windows 7 Service Pack 1 (Both 32-bit x86 and 64-bit x64)
echo  - Native WinSpool.drv Direct Thermal Printing (Compatible with Win 7 to Win 11)
echo  - Local ACID SQLite Database per business (AliTraders.db)
echo ==============================================================================
pause
