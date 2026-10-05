# GRAIN MARKET ERP - .NET MAUI 8 CROSS-PLATFORM (WINDOWS .EXE + ANDROID APK)
## 100% OFFLINE-FIRST + AUTO-SYNC ARCHITECTURE (غلہ منڈی سافٹ ویئر)

---

### 1. TWO OUTPUTS FROM ONE UNIFIED CODEBASE
- **Windows Desktop Standalone**: `publish/windows/GrainMarket.exe`
  - Targets: `net8.0-windows10.0.19041.0`
  - Command: `dotnet publish GrainMarket.csproj -f net8.0-windows10.0.19041.0 -c Release -p:WindowsPackageType=None -p:WindowsAppSDKSelfContained=true -o ./publish/windows`
- **Android Mobile App**: `publish/android/com.grainmarket.apk`
  - Targets: `net8.0-android`
  - Command: `dotnet publish GrainMarket.csproj -f net8.0-android -c Release -p:ApplicationId=com.grainmarket.app -p:AndroidPackageFormats=apk -o ./publish/android`

---

### 2. DATABASE ARCHITECTURE (LOCAL SQLITE PER BUSINESS)
- **Database Engine**: `sqlite-net-pcl` with `SQLitePCLRaw.bundle_green`
- **File Path**: Dedicated `.db` file per business (e.g. `AliTraders.db`, `NazarSoonCorporation.db`) in local application storage.
- **Core Tables**:
  - `Businesses`
  - `Users`
  - `Items`
  - `Parties` (Contact & Directory strictly preserved; Party Ledgers permanently removed per specification)
  - `Godowns`
  - `Purchases`
  - `Sales`
  - `Expenses`
  - `SyncQueue`
- **Universal Entity Columns**:
  - `Id` (GUID string primary key)
  - `CreatedAt` (UTC timestamp)
  - `UpdatedAt` (UTC timestamp)
  - `IsSynced` (boolean flag, false when saved offline)
  - `DeviceId` (unique hardware identifier of the creating terminal)
  - `IsDeleted` (soft delete flag)

---

### 3. OFFLINE-FIRST + AUTO-SYNC WORKFLOW
#### Morning in Mandi (No Internet Connection):
1. Munshi / Kanta operator records 20 purchase tickets on Android Mobile APK.
2. Status indicator shows **🔴 Offline - Saved locally**.
3. Each transaction is written immediately to local SQLite (`Purchases` table) with `IsSynced = false`.
4. A payload record is appended to the `SyncQueue` table.
5. Toast confirms: *"Saved offline, will sync when online 🔴"*.

#### Afternoon at Shop (WiFi / Internet Reconnected):
1. Device connects to shop Wi-Fi or mobile 4G.
2. `ConnectivityService` detects network transition -> fires `NetworkStatusChanged(true)`.
3. Status changes to **🟡 Online - Syncing...**.
4. `SyncService.SyncAsync()` automatically kicks in:
   - Reads pending records from `SyncQueue`.
   - Dispatches batch payload to Cloud relay.
   - Sets `IsSynced = true` and deletes completed queue items.
   - Pulls updates created on other terminals where `UpdatedAt > LastSyncTime`.
5. Status changes to **🟢 Online - Synced**.
6. Toast alerts Munshi: *"Synced 20 vouchers to Desktop Master"*.
7. On the Desktop terminal (`GrainMarket.exe`), the 20 purchases appear on the screen automatically!

#### Evening Approval (Seth on Desktop Master):
1. Commission agent / Seth inspects the vouchers in **Action Centre**.
2. Clicks `Approve` on Desktop.
3. Voucher status transitions to `Approved`, `UpdatedAt` updates, and item closing stock is recalculated.
4. On next 5-minute background sync (or manual `[SYNC NOW]`), approval status syncs back to Munshi's mobile APK.
5. Munshi's mobile now displays the vouchers as `Approved`!

---

### 4. CONFLICT RESOLUTION RULES
- **Master Node**: Desktop PC is the MASTER terminal.
- **Slave Nodes**: Up to 3 Android Mobiles are SLAVE terminals per business.
- **Conflict Rule**: Last `UpdatedAt` wins. If exact timestamp collision occurs, Desktop Master wins.

---

### 5. DEVICE PAIRING (QR CODE)
- Desktop generates QR code containing: `{ "BusinessId": "...", "BusinessName": "...", "SyncKey": "...", "MasterDeviceId": "..." }`.
- Mobile APK scans QR on first install.
- Instantly links Mobile to the Desktop Master SQLite database and initiates initial state sync.
- Max limit: 1 Desktop + 3 Mobile phones per business profile.

---

### 6. DIRECT HARDWARE PRINTING
- **Desktop (Windows)**: Uses native `winspool.drv` P/Invoke `WritePrinter` to send raw ESC/POS binary byte commands directly to USB/COM 80mm/58mm thermal printers (auto guillotine cut `GS V`, buzzer beep `ESC B`, zero browser print dialog).
- **Mobile (Android)**: Direct Bluetooth 3-inch ESC/POS thermal printing or 1-tap WhatsApp PDF voucher slip sharing.
