@echo off
title Grain Market ERP - Android APK Compiler (.NET MAUI 8 + SQLite)
color 0B
echo ==============================================================================
echo   GRAIN MARKET ERP - ANDROID APK COMPILER (.NET MAUI 8)
echo ==============================================================================
echo.
echo Checking for .NET 8 SDK with Android Workload...
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] .NET 8 SDK not found in PATH!
    echo Please install .NET 8 SDK and run: dotnet workload install maui-android
    pause
    exit /b 1
)

echo.
echo Compiling Android APK: com.grainmarket.apk...
echo Command: dotnet publish -f net8.0-android -c Release -p:ApplicationId=com.grainmarket.app -p:AndroidPackageFormats=apk -o ./publish/android
echo.

dotnet publish GrainMarket.csproj -f net8.0-android -c Release -p:ApplicationId=com.grainmarket.app -p:AndroidPackageFormats=apk -o ./publish/android

if %errorlevel% equ 0 (
    echo.
    echo ==============================================================================
    echo [SUCCESS] Android APK built successfully!
    echo File: %~dp0publish\android\com.grainmarket.apk
    echo.
    echo Features included:
    echo  - 100% Offline with local SQLite per business (AliTraders.db)
    echo  - Slave Node: Scans QR code from Desktop Master on first launch
    echo  - Munshi enters tickets in Mandi with NO internet -> Saved locally 🔴
    echo  - Reconnects to WiFi -> Auto-Sync 🟢 -> Appears on Desktop automatically
    echo  - Bluetooth 3-inch thermal printing & direct WhatsApp PDF sharing
    echo ==============================================================================
) else (
    echo.
    echo [BUILD ERROR] Failed to build Android APK. Check output logs above.
)
pause
