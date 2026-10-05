@echo off
title Grain Market ERP - Windows .EXE Compiler (.NET MAUI 8 + SQLite)
color 0A
echo ==============================================================================
echo   GRAIN MARKET ERP - WINDOWS 10 / 11 NATIVE COMPILER (.NET MAUI 8)
echo ==============================================================================
echo.
echo Checking for .NET 8 SDK with MAUI Workload...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] .NET 8 SDK not found in PATH!
    echo Please install .NET 8 SDK and run: dotnet workload install maui
    pause
    exit /b 1
)

echo.
echo Compiling Offline Standalone Windows Executable: GrainMarket.exe...
echo Command: dotnet publish -f net8.0-windows10.0.19041.0 -c Release -p:WindowsPackageType=None -p:WindowsAppSDKSelfContained=true -o ./publish/windows
echo.

dotnet publish GrainMarket.csproj -f net8.0-windows10.0.19041.0 -c Release -p:WindowsPackageType=None -p:WindowsAppSDKSelfContained=true -o ./publish/windows

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo [SUCCESS] Windows Standalone Executable built successfully!
    echo File: %~dp0publish\windows\GrainMarket.exe
    echo.
    echo Features included:
    echo  - 100% Offline with local SQLite per business (AliTraders.db)
    echo  - Master Node: Generates Device Pairing QR (1 Desktop + 3 Mobiles)
    echo  - Direct Thermal ESC/POS RAW Printing via winspool.drv (No browser print)
    echo  - Auto-Sync listener and 5-minute background timer
    echo ==============================================================================
) else (
    echo.
    echo [BUILD ERROR] Failed to build Windows .exe. Check output logs above.
)
pause
