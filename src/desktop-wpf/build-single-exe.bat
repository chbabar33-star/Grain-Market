@echo off
title Mandi ERP - .NET 8 WPF Single .EXE Compiler (غلہ منڈی سافٹ ویئر)
color 0A
echo ==============================================================================
echo   MANDI ERP - WINDOWS 10 / 11 STANDALONE SINGLE .EXE COMPILER (.NET 8 + SQLite)
echo ==============================================================================
echo.
echo Checking for .NET 8 SDK...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] .NET 8 SDK is not found in PATH!
    echo Please install .NET 8 SDK from https://dotnet.microsoft.com/download/dotnet/8.0
    echo (Download ".NET Desktop Runtime 8.0" or ".NET 8.0 SDK")
    pause
    exit /b 1
)

echo.
echo Compiling Self-Contained Single Executable with Embedded SQLite...
echo Target: Windows x64 (Windows 10, Windows 11)
echo Output: ./publish/MandiERP.exe
echo.

dotnet publish MandiERP.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -o ./publish

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo [SUCCESS] Standalone Single .EXE built successfully!
    echo File: %~dp0publish\MandiERP.exe
    echo.
    echo Features included:
    echo  - 100% Offline (No web dependencies, No Google extensions, No Firebase)
    echo  - Local SQLite database file per business (Data/Mandi_biz-1.db)
    echo  - Direct WinSpool Raw Thermal Receipt Printer (No browser print)
    echo  - Single .exe executable runs on any Windows 10/11 64-bit PC
    echo ==============================================================================
) else (
    echo.
    echo [BUILD ERROR] Failed to build single-file .exe. Check output logs above.
)
pause
