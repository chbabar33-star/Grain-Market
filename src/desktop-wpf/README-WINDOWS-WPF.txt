========================================================================================
MANDI ERP - WINDOWS 7 / 8 / 10 / 11 DESKTOP APPLICATION (.NET + SQLITE)
غلہ منڈی نظام - ونڈوز 7 (32-بٹ و 64-بٹ) اور ونڈوز 10/11 کے لیے 100% موزوں
========================================================================================

WINDOWS 7 SP1 ELIGIBILITY & SPECIFICATIONS:
1. OPERATING SYSTEM COMPATIBILITY:
   - Windows 7 SP1 (32-bit x86 & 64-bit x64) - 100% Eligible!
   - Windows 8 / 8.1 (32-bit & 64-bit)
   - Windows 10 & Windows 11 (64-bit)
   - Specifically optimized for older Mandi office computers (Pentium, Core 2 Duo, Core i3)

2. FRAMEWORK MULTI-TARGETING:
   - Target A: `net48` (.NET Framework 4.8) -> Runs natively on Windows 7 SP1 with zero extra downloads.
   - Target B: `net8.0-windows` (.NET 8 Windows Desktop) -> For Windows 10 and Windows 11.

3. ZERO WEB DEPENDENCIES & NO FIREBASE:
   - NO web dependencies, NO browser popups, NO Google extensions, NO Firebase.
   - 100% offline local operation in Mandi yards without internet connection or Wi-Fi.

4. LOCAL SQLITE DATABASE FILE PER BUSINESS:
   - Uses `Microsoft.Data.Sqlite` (ACID-compliant, zero server, zero configuration).
   - Dedicated SQLite file per business:
     Path: `Data/Mandi_{BusinessId}.db` (e.g. `Data/Mandi_biz-1.db`).
   - Write-Ahead Logging (WAL mode) enabled with standard rollback journal fallback for legacy Windows 7 storage.

5. DIRECT THERMAL PRINTER (WIN7 WIN32 RAW SPOOLER):
   - Uses Windows native `winspool.drv` P/Invoke Raw Spooler API (`WritePrinter`).
   - Compatible from Windows 7 all the way to Windows 11.
   - Sends raw ESC/POS binary byte commands directly to USB/COM/LPT thermal printers:
     * ESC @ : Initialize printer
     * GS V : Automatic paper cut / guillotine cut
     * ESC B : Buzzer / beep on completion
     * ZERO browser print dialog! ZERO print preview popup! Prints in under 0.1 seconds!

6. HOW TO COMPILE FOR WINDOWS 7:
   Option A (Interactive 1-Click Batch):
     Double-click `build-windows7-x86-x64.bat` and select:
       [1] Windows 7 32-bit (x86)
       [2] Windows 7 64-bit (x64)
       [3] Windows 10/11 x64
       [4] Build ALL targets

   Option B (Command Line for Windows 7 32-bit):
     dotnet publish MandiERP.csproj -f net48 -c Release -r win-x86 --self-contained false -o ./publish/win7-x86

   Option B (Command Line for Windows 7 64-bit):
     dotnet publish MandiERP.csproj -f net48 -c Release -r win-x64 --self-contained false -o ./publish/win7-x64

   Output Files:
     `./publish/win7-x86/MandiERP.exe` -> Copy to any Windows 7 32-bit PC
     `./publish/win7-x64/MandiERP.exe` -> Copy to any Windows 7 64-bit PC

========================================================================================
Firm: NAZAR SOON CORPORATION (نظر سون کارپوریشن)
Proprietor: Ch. Babar Ameen (چوہدری بابر امین)
Platform: Windows 7 SP1 / 8 / 10 / 11 (.NET + SQLite + Raw Thermal Spooler)
========================================================================================
