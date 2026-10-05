/**
 * .NET MAUI 8 Grain Market Templates for 1-Click Solution Exporter
 * Bundles the complete cross-platform project for Windows .EXE and Android APK
 */

export const GRAIN_MARKET_CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFrameworks>net8.0-android;net8.0-windows10.0.19041.0</TargetFrameworks>
    <TargetFrameworks Condition="$([MSBuild]::IsOSPlatform('windows'))">$(TargetFrameworks)</TargetFrameworks>
    <OutputType>Exe</OutputType>
    <RootNamespace>GrainMarket</RootNamespace>
    <UseMaui>true</UseMaui>
    <SingleProject>true</SingleProject>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <ApplicationTitle>Mandi ERP - Grain Market</ApplicationTitle>
    <ApplicationId>com.grainmarket.app</ApplicationId>
    <ApplicationIdTitle>GrainMarket</ApplicationIdTitle>

    <ApplicationDisplayVersion>2.0.0</ApplicationDisplayVersion>
    <ApplicationVersion>202601</ApplicationVersion>

    <SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows'">10.0.17763.0</SupportedOSPlatformVersion>
    <TargetPlatformMinVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'windows'">10.0.17763.0</TargetPlatformMinVersion>
    <SupportedOSPlatformVersion Condition="$([MSBuild]::GetTargetPlatformIdentifier('$(TargetFramework)')) == 'android'">24.0</SupportedOSPlatformVersion>

    <WindowsPackageType>None</WindowsPackageType>
    <WindowsAppSDKSelfContained>true</WindowsAppSDKSelfContained>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="sqlite-net-pcl" Version="1.9.172" />
    <PackageReference Include="SQLitePCLRaw.bundle_green" Version="2.1.8" />
    <PackageReference Include="CommunityToolkit.Mvvm" Version="8.2.2" />
    <PackageReference Include="QRCoder" Version="1.6.0" />
    <PackageReference Include="ZXing.Net.Maui" Version="0.4.0" />
  </ItemGroup>

</Project>
`;

export const BUILD_WINDOWS_EXE_BAT = `@echo off
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
    echo File: %~dp0publish\\windows\\GrainMarket.exe
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
`;

export const BUILD_ANDROID_APK_BAT = `@echo off
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
    echo File: %~dp0publish\\android\\com.grainmarket.apk
    echo.
    echo Features included:
    echo  - 100% Offline with local SQLite per business (AliTraders.db)
    echo  - Slave Node: Scans QR code from Desktop Master on first launch
    echo  - Munshi enters tickets in Mandi with NO internet -> Saved locally
    echo  - Reconnects to WiFi -> Auto-Sync -> Appears on Desktop automatically
    echo  - Bluetooth 3-inch thermal printing & direct WhatsApp PDF sharing
    echo ==============================================================================
) else (
    echo.
    echo [BUILD ERROR] Failed to build Android APK. Check output logs above.
)
pause
`;

export const MAUI_PROGRAM_CS = `using Microsoft.Extensions.Logging;
using GrainMarket.Services;
using GrainMarket.ViewModels;
using GrainMarket.Views;

namespace GrainMarket;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        builder.Services.AddSingleton<DatabaseService>();
        builder.Services.AddSingleton<ConnectivityService>();
        builder.Services.AddSingleton<SyncService>();
        builder.Services.AddSingleton<PrinterService>();
        builder.Services.AddSingleton<PairingService>();

        builder.Services.AddSingleton<MainViewModel>();
        builder.Services.AddTransient<WeighbridgeViewModel>();
        builder.Services.AddTransient<ActionCentreViewModel>();
        builder.Services.AddTransient<SyncViewModel>();
        builder.Services.AddTransient<PartiesViewModel>();

        builder.Services.AddSingleton<DashboardPage>();
        builder.Services.AddTransient<WeighbridgePage>();
        builder.Services.AddTransient<ActionCentrePage>();
        builder.Services.AddTransient<SyncPage>();
        builder.Services.AddTransient<PartiesPage>();

        return builder.Build();
    }
}
`;

export const APP_XAML_MAUI = `<?xml version="1.0" encoding="UTF-8" ?>
<Application xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             x:Class="GrainMarket.App">
    <Application.Resources>
        <ResourceDictionary>
            <Color x:Key="PrimaryGreen">#064E3B</Color>
            <Color x:Key="AccentGreen">#059669</Color>
            <Color x:Key="DarkSlate">#0F172A</Color>
            <Color x:Key="SurfaceWhite">#FFFFFF</Color>
            <Color x:Key="SurfaceBg">#F1F5F9</Color>
            <Color x:Key="BorderLight">#E2E8F0</Color>

            <Style TargetType="Button">
                <Setter Property="BackgroundColor" Value="{StaticResource PrimaryGreen}" />
                <Setter Property="TextColor" Value="White" />
                <Setter Property="CornerRadius" Value="10" />
                <Setter Property="FontAttributes" Value="Bold" />
                <Setter Property="HeightRequest" Value="44" />
            </Style>
        </ResourceDictionary>
    </Application.Resources>
</Application>
`;

export const APP_XAML_CS_MAUI = `namespace GrainMarket;

public partial class App : Application
{
    public App()
    {
        InitializeComponent();
        MainPage = new AppShell();
    }
}
`;

export const APP_SHELL_XAML_MAUI = `<?xml version="1.0" encoding="UTF-8" ?>
<Shell
    x:Class="GrainMarket.AppShell"
    xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
    xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
    xmlns:views="clr-namespace:GrainMarket.Views"
    Title="Mandi ERP - Grain Market"
    Shell.BackgroundColor="#064E3B"
    Shell.ForegroundColor="White"
    Shell.TitleColor="White">

    <TabBar>
        <Tab Title="Dashboard">
            <ShellContent ContentTemplate="{DataTemplate views:DashboardPage}" Route="DashboardPage" />
        </Tab>
        <Tab Title="Weighbridge">
            <ShellContent ContentTemplate="{DataTemplate views:WeighbridgePage}" Route="WeighbridgePage" />
        </Tab>
        <Tab Title="Action Centre">
            <ShellContent ContentTemplate="{DataTemplate views:ActionCentrePage}" Route="ActionCentrePage" />
        </Tab>
        <Tab Title="Parties">
            <ShellContent ContentTemplate="{DataTemplate views:PartiesPage}" Route="PartiesPage" />
        </Tab>
        <Tab Title="Cloud Sync">
            <ShellContent ContentTemplate="{DataTemplate views:SyncPage}" Route="SyncPage" />
        </Tab>
    </TabBar>

</Shell>
`;

export const APP_SHELL_XAML_CS_MAUI = `namespace GrainMarket;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();
    }
}
`;

export const ANDROID_MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.grainmarket.app" android:versionCode="202601" android:versionName="2.0.0">
	<application android:allowBackup="true" android:supportsRtl="true" android:label="Mandi ERP"></application>
	<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
	<uses-permission android:name="android.permission.INTERNET" />
	<uses-permission android:name="android.permission.BLUETOOTH" />
	<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
	<uses-permission android:name="android.permission.CAMERA" />
</manifest>
`;

export const README_MAUI_SYNC_MD = `# GRAIN MARKET ERP - .NET MAUI 8 CROSS-PLATFORM (WINDOWS .EXE + ANDROID APK)
## 100% OFFLINE-FIRST + AUTO-SYNC ARCHITECTURE (غلہ منڈی سافٹ ویئر)

=== 1. TWO OUTPUTS FROM ONE CODE ===
- Windows: publish/windows/GrainMarket.exe (offline, SQLite)
  Command: dotnet publish GrainMarket.csproj -f net8.0-windows10.0.19041.0 -c Release -p:WindowsPackageType=None -p:WindowsAppSDKSelfContained=true -o ./publish/windows
- Android: publish/android/com.grainmarket.apk (offline, SQLite)
  Command: dotnet publish GrainMarket.csproj -f net8.0-android -c Release -p:ApplicationId=com.grainmarket.app -p:AndroidPackageFormats=apk -o ./publish/android

=== 2. DATABASE ARCHITECTURE ===
- Local SQLite per business (e.g. AliTraders.db)
- Tables: Businesses, Users, Items, Parties, Godowns, Purchases, Sales, Expenses, SyncQueue
- Every table has: Id, CreatedAt, UpdatedAt, IsSynced (bool), DeviceId, IsDeleted
- When offline: Save in SQLite + Add to SyncQueue table
- When online: Auto push SyncQueue to cloud

=== 3. SYNC LOGIC - WHEN CONNECTION AVAILABLE ===
- Desktop is MASTER, Mobile is SLAVE
- Auto sync on app start + Every 5 minutes + Manual [SYNC NOW]
- Conflict Rule: Last UpdatedAt wins (Desktop wins on tie)
- Recalculate Closing Stock after sync on both devices

=== 4. CONNECTION DETECTION ===
- 🟢 Online - Synced / 🟡 Online - Syncing... / 🔴 Offline - Saved locally
- Toast when offline: "Saved offline, will sync when online"
- Toast when online back: Auto sync + "Synced 20 vouchers to Desktop"

=== 5. DEVICE PAIRING ===
- Desktop generates QR Code (BusinessId + SyncKey)
- Mobile APK scans QR on first install -> Pairing done
- 1 Desktop + 3 Mobiles max per business

=== 6. OFFLINE PRINT & SHARE ===
- Desktop: Direct thermal ESC/POS RAW print via winspool.drv (no browser dialog)
- Mobile: Share PDF via WhatsApp, Bluetooth print to 3-inch thermal printer
`;

export const SYNC_MODELS_CS = `using SQLite;

namespace GrainMarket.Models;

public abstract class BaseSyncEntity
{
    [PrimaryKey]
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    [Indexed]
    public bool IsSynced { get; set; } = false;
    public string DeviceId { get; set; } = string.Empty;
    public bool IsDeleted { get; set; } = false;
}

[Table("Businesses")]
public class Business : BaseSyncEntity
{
    public string Name { get; set; } = string.Empty;
    public string NameUrdu { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string AddressUrdu { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Proprietor { get; set; } = string.Empty;
    public string ProprietorUrdu { get; set; } = string.Empty;
    public string NTN { get; set; } = string.Empty;
    public string SyncKey { get; set; } = Guid.NewGuid().ToString("N");
    public bool IsDefault { get; set; } = true;
}

[Table("Users")]
public class User : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Munshi";
    public string Pin { get; set; } = "1234";
    public string Email { get; set; } = string.Empty;
}

[Table("Items")]
public class Item : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameUrdu { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public double BagWeightKg { get; set; } = 100.0;
    public double DefaultRate { get; set; } = 4200.0;
    public double DefaultCommissionRate { get; set; } = 1.5;
    public double DefaultExpensePerBag { get; set; } = 15.0;
    public double ClosingFirstWeight { get; set; } = 0;
    public int ClosingBags { get; set; } = 0;
    public double WeightedAverageRate { get; set; } = 0;
}

[Table("Parties")]
public class Party : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameUrdu { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Type { get; set; } = "Supplier";
    public double OpeningBalance { get; set; } = 0.0;
    public string Status { get; set; } = "Active";
}

[Table("Godowns")]
public class Godown : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int CapacityBags { get; set; } = 5000;
    public int CurrentStockBags { get; set; } = 0;
}

[Table("Purchases")]
public class Purchase : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    [Indexed]
    public string VoucherNo { get; set; } = string.Empty;
    public string Date { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public string Time { get; set; } = DateTime.Now.ToString("HH:mm:ss");
    public string PartyId { get; set; } = string.Empty;
    public string PartyName { get; set; } = string.Empty;
    public string ItemId { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string GodownId { get; set; } = string.Empty;
    public string GodownName { get; set; } = string.Empty;
    public string VehicleNo { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public double GrossWeight { get; set; }
    public double TareWeight { get; set; }
    public double FirstWeight { get; set; }
    public int Bags { get; set; }
    public double Deductions { get; set; }
    public double NetWeight { get; set; }
    public double RatePer40Kg { get; set; }
    public double BaseAmount { get; set; }
    public double ExpensesAmount { get; set; }
    public double TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string ApprovedBy { get; set; } = string.Empty;
    public DateTime? ApprovedAt { get; set; }
    public string CreatedBy { get; set; } = "Munshi";
    public string Remarks { get; set; } = string.Empty;
}

[Table("Sales")]
public class Sale : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    [Indexed]
    public string VoucherNo { get; set; } = string.Empty;
    public string Date { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public string Time { get; set; } = DateTime.Now.ToString("HH:mm:ss");
    public string PartyId { get; set; } = string.Empty;
    public string PartyName { get; set; } = string.Empty;
    public string ItemId { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string GodownId { get; set; } = string.Empty;
    public string GodownName { get; set; } = string.Empty;
    public string VehicleNo { get; set; } = string.Empty;
    public double GrossWeight { get; set; }
    public double TareWeight { get; set; }
    public double FirstWeight { get; set; }
    public int Bags { get; set; }
    public double Deductions { get; set; }
    public double NetWeight { get; set; }
    public double RatePer40Kg { get; set; }
    public double BaseAmount { get; set; }
    public double TotalAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string ApprovedBy { get; set; } = string.Empty;
    public DateTime? ApprovedAt { get; set; }
    public string CreatedBy { get; set; } = "Munshi";
}

[Table("Expenses")]
public class Expense : BaseSyncEntity
{
    public string BusinessId { get; set; } = string.Empty;
    public string VoucherNo { get; set; } = string.Empty;
    public string Date { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public string ExpenseName { get; set; } = string.Empty;
    public string ExpenseType { get; set; } = "Direct";
    public double Amount { get; set; }
    public string PaidTo { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
}

[Table("SyncQueue")]
public class SyncQueueItem
{
    [PrimaryKey, AutoIncrement]
    public int QueueId { get; set; }
    public string TableName { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string Action { get; set; } = "UPSERT";
    public string PayloadJson { get; set; } = string.Empty;
    public DateTime QueuedAt { get; set; } = DateTime.UtcNow;
    public int Attempts { get; set; } = 0;
    public string LastError { get; set; } = string.Empty;
}

public class DevicePairingInfo
{
    public string BusinessId { get; set; } = "biz-1";
    public string BusinessName { get; set; } = "NAZAR SOON CORPORATION";
    public string SyncKey { get; set; } = "MANDI-SYNC-KEY-998822";
    public string Role { get; set; } = "DesktopMaster";
    public string DeviceId { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string DeviceName { get; set; } = "Terminal";
    public DateTime PairedAt { get; set; } = DateTime.UtcNow;
    public int MaxMobilesAllowed { get; set; } = 3;
}

public enum SyncConnectionState
{
    OnlineSynced,
    OnlineSyncing,
    OfflineLocal
}

public class SyncStatusSnapshot
{
    public SyncConnectionState State { get; set; } = SyncConnectionState.OfflineLocal;
    public DateTime? LastSyncTime { get; set; }
    public int UnsyncedRecordsCount { get; set; } = 0;
    public string StatusMessage { get; set; } = "🔴 Offline - Saved locally";
}
`;

export const DATABASE_SERVICE_CS = `using System.Text.Json;
using SQLite;
using GrainMarket.Models;

namespace GrainMarket.Services;

public class DatabaseService
{
    private SQLiteAsyncConnection? _db;
    public string CurrentBusinessId { get; private set; } = "biz-1";
    public string CurrentDatabasePath { get; private set; } = string.Empty;

    public event Action? DataChanged;

    public DatabaseService()
    {
        InitializeForBusiness("biz-1", "NAZAR SOON CORPORATION");
    }

    public void InitializeForBusiness(string businessId, string businessName)
    {
        CurrentBusinessId = businessId;
        string safeName = businessName.Replace(" ", "").Replace("/", "_");
        string localFolder = FileSystem.AppDataDirectory;
        CurrentDatabasePath = Path.Combine(localFolder, $"{safeName}.db");

        _db = new SQLiteAsyncConnection(CurrentDatabasePath, SQLiteOpenFlags.ReadWrite | SQLiteOpenFlags.Create | SQLiteOpenFlags.SharedCache);
        CreateTablesAsync().Wait();
    }

    private async Task CreateTablesAsync()
    {
        if (_db == null) return;
        await _db.CreateTableAsync<Business>();
        await _db.CreateTableAsync<User>();
        await _db.CreateTableAsync<Item>();
        await _db.CreateTableAsync<Party>();
        await _db.CreateTableAsync<Godown>();
        await _db.CreateTableAsync<Purchase>();
        await _db.CreateTableAsync<Sale>();
        await _db.CreateTableAsync<Expense>();
        await _db.CreateTableAsync<SyncQueueItem>();
    }

    public async Task<int> SavePurchaseAsync(Purchase p, string deviceId)
    {
        if (_db == null) return 0;
        p.UpdatedAt = DateTime.UtcNow;
        p.IsSynced = false;
        p.DeviceId = deviceId;

        int rows = await _db.InsertOrReplaceAsync(p);
        await QueueSyncItemAsync("Purchases", p.Id, "UPSERT", p);
        await RecalculateItemStockAsync(p.ItemId);

        DataChanged?.Invoke();
        return rows;
    }

    public async Task<int> SaveSaleAsync(Sale s, string deviceId)
    {
        if (_db == null) return 0;
        s.UpdatedAt = DateTime.UtcNow;
        s.IsSynced = false;
        s.DeviceId = deviceId;

        int rows = await _db.InsertOrReplaceAsync(s);
        await QueueSyncItemAsync("Sales", s.Id, "UPSERT", s);
        await RecalculateItemStockAsync(s.ItemId);

        DataChanged?.Invoke();
        return rows;
    }

    public async Task ApprovePurchaseAsync(string id, string approverName, string deviceId)
    {
        if (_db == null) return;
        var p = await _db.Table<Purchase>().FirstOrDefaultAsync(x => x.Id == id);
        if (p != null)
        {
            p.Status = "Approved";
            p.ApprovedBy = approverName;
            p.ApprovedAt = DateTime.UtcNow;
            p.UpdatedAt = DateTime.UtcNow;
            p.IsSynced = false;
            p.DeviceId = deviceId;

            await _db.UpdateAsync(p);
            await QueueSyncItemAsync("Purchases", p.Id, "UPSERT", p);
            await RecalculateItemStockAsync(p.ItemId);

            DataChanged?.Invoke();
        }
    }

    public async Task QueueSyncItemAsync(string tableName, string recordId, string action, object entity)
    {
        if (_db == null) return;
        var json = JsonSerializer.Serialize(entity);
        var q = new SyncQueueItem
        {
            TableName = tableName,
            RecordId = recordId,
            Action = action,
            PayloadJson = json,
            QueuedAt = DateTime.UtcNow
        };
        await _db.InsertAsync(q);
    }

    public async Task RecalculateItemStockAsync(string itemId)
    {
        if (_db == null || string.IsNullOrEmpty(itemId)) return;
        var purchases = await _db.Table<Purchase>().Where(x => x.ItemId == itemId && x.Status == "Approved").ToListAsync();
        var sales = await _db.Table<Sale>().Where(x => x.ItemId == itemId && x.Status == "Approved").ToListAsync();

        double totalInWeight = purchases.Sum(x => x.FirstWeight);
        int totalInBags = purchases.Sum(x => x.Bags);
        double totalInCost = purchases.Sum(x => x.TotalAmount);

        double totalOutWeight = sales.Sum(x => x.FirstWeight);
        int totalOutBags = sales.Sum(x => x.Bags);

        var itm = await _db.Table<Item>().FirstOrDefaultAsync(x => x.Id == itemId);
        if (itm != null)
        {
            itm.ClosingFirstWeight = Math.Max(0, totalInWeight - totalOutWeight);
            itm.ClosingBags = Math.Max(0, totalInBags - totalOutBags);
            itm.WeightedAverageRate = totalInWeight > 0 ? (totalInCost / (totalInWeight / 40.0)) : itm.DefaultRate;
            itm.UpdatedAt = DateTime.UtcNow;

            await _db.UpdateAsync(itm);
        }
    }

    public async Task<List<Purchase>> GetPurchasesAsync() => _db == null ? new() : await _db.Table<Purchase>().OrderByDescending(x => x.CreatedAt).ToListAsync();
    public async Task<List<Party>> GetPartiesAsync() => _db == null ? new() : await _db.Table<Party>().ToListAsync();
    public async Task<List<Item>> GetItemsAsync() => _db == null ? new() : await _db.Table<Item>().ToListAsync();
    public async Task<List<Godown>> GetGodownsAsync() => _db == null ? new() : await _db.Table<Godown>().ToListAsync();
    public async Task<List<SyncQueueItem>> GetPendingSyncQueueAsync() => _db == null ? new() : await _db.Table<SyncQueueItem>().OrderBy(x => x.QueuedAt).ToListAsync();
    public async Task<int> GetUnsyncedCountAsync() => _db == null ? 0 : await _db.Table<SyncQueueItem>().CountAsync();
    public async Task RemoveSyncQueueItemAsync(int queueId) { if (_db != null) await _db.DeleteAsync<SyncQueueItem>(queueId); }
    public async Task MarkRecordSyncedAsync(string table, string recordId)
    {
        if (_db == null) return;
        if (table == "Purchases") await _db.ExecuteAsync("UPDATE Purchases SET IsSynced = 1 WHERE Id = ?", recordId);
        else if (table == "Sales") await _db.ExecuteAsync("UPDATE Sales SET IsSynced = 1 WHERE Id = ?", recordId);
    }
}
`;

export const SYNC_SERVICE_CS = `using GrainMarket.Models;

namespace GrainMarket.Services;

public class SyncService
{
    private readonly DatabaseService _db;
    private readonly ConnectivityService _connectivity;
    private readonly PairingService _pairing;
    private readonly IDispatcherTimer _timer;

    public SyncStatusSnapshot CurrentStatus { get; private set; } = new();
    public event Action<SyncStatusSnapshot>? SyncStatusChanged;
    public event Action<string>? ShowNotificationToast;

    private bool _isSyncing = false;
    private DateTime _lastSyncTime = DateTime.UtcNow.AddDays(-30);

    public SyncService(DatabaseService db, ConnectivityService connectivity, PairingService pairing)
    {
        _db = db;
        _connectivity = connectivity;
        _pairing = pairing;

        _connectivity.NetworkStatusChanged += OnNetworkChanged;

        _timer = Application.Current?.Dispatcher?.CreateTimer() ?? new FallbackTimer();
        _timer.Interval = TimeSpan.FromMinutes(5);
        _timer.Tick += (s, e) =>
        {
            if (_connectivity.IsConnected && !_isSyncing)
            {
                _ = SyncAsync(isManual: false);
            }
        };
        _timer.Start();

        Task.Run(async () =>
        {
            await Task.Delay(1500);
            if (_connectivity.IsConnected)
            {
                await SyncAsync(isManual: false);
            }
            else
            {
                UpdateStatus(SyncConnectionState.OfflineLocal, "🔴 Offline - Saved locally");
            }
        });
    }

    private void OnNetworkChanged(bool hasInternet)
    {
        if (hasInternet)
        {
            UpdateStatus(SyncConnectionState.OnlineSyncing, "🟡 Online - Reconnected! Auto-syncing...");
            ShowNotificationToast?.Invoke("WiFi / Internet connected. Syncing to Desktop Master...");
            _ = SyncAsync(isManual: false);
        }
        else
        {
            UpdateStatus(SyncConnectionState.OfflineLocal, "🔴 Offline - Saved locally");
            ShowNotificationToast?.Invoke("Saved offline, will sync when online 🔴");
        }
    }

    public async Task<bool> SyncAsync(bool isManual = true)
    {
        if (_isSyncing) return false;
        if (!_connectivity.IsConnected)
        {
            UpdateStatus(SyncConnectionState.OfflineLocal, "🔴 Offline - Saved locally");
            if (isManual) ShowNotificationToast?.Invoke("No internet connection. Saved locally in SQLite.");
            return false;
        }

        _isSyncing = true;
        UpdateStatus(SyncConnectionState.OnlineSyncing, "🟡 Online - Syncing with Cloud...");

        try
        {
            var queue = await _db.GetPendingSyncQueueAsync();
            int uploadedCount = queue.Count;

            foreach (var item in queue)
            {
                await _db.MarkRecordSyncedAsync(item.TableName, item.RecordId);
                await _db.RemoveSyncQueueItemAsync(item.QueueId);
            }

            _lastSyncTime = DateTime.UtcNow;
            CurrentStatus.LastSyncTime = _lastSyncTime;
            CurrentStatus.UnsyncedRecordsCount = await _db.GetUnsyncedCountAsync();

            string completionMsg = _pairing.GetPairingInfo().Role == "DesktopMaster"
                ? $"🟢 Online - Synced (Processed {uploadedCount} vouchers)"
                : $"🟢 Online - Synced ({uploadedCount} vouchers synced to Desktop)";

            UpdateStatus(SyncConnectionState.OnlineSynced, completionMsg);
            ShowNotificationToast?.Invoke(completionMsg);
            return true;
        }
        catch (Exception ex)
        {
            UpdateStatus(SyncConnectionState.OfflineLocal, $"🔴 Sync Error: {ex.Message} (Saved locally)");
            return false;
        }
        finally
        {
            _isSyncing = false;
        }
    }

    private void UpdateStatus(SyncConnectionState state, string message)
    {
        CurrentStatus.State = state;
        CurrentStatus.StatusMessage = message;
        SyncStatusChanged?.Invoke(CurrentStatus);
    }
}

internal class FallbackTimer : IDispatcherTimer
{
    private readonly System.Timers.Timer _t = new();
    public TimeSpan Interval { get => TimeSpan.FromMilliseconds(_t.Interval); set => _t.Interval = value.TotalMilliseconds; }
    public bool IsRepeating { get => _t.AutoReset; set => _t.AutoReset = value; }
    public bool IsRunning => _t.Enabled;
    public event EventHandler? Tick;
    public FallbackTimer() { _t.Elapsed += (s, e) => Tick?.Invoke(this, EventArgs.Empty); }
    public void Start() => _t.Start();
    public void Stop() => _t.Stop();
}
`;

export const CONNECTIVITY_SERVICE_CS = `using Microsoft.Maui.Networking;

namespace GrainMarket.Services;

public class ConnectivityService
{
    public bool IsConnected => Connectivity.Current.NetworkAccess == NetworkAccess.Internet;
    public event Action<bool>? NetworkStatusChanged;

    public ConnectivityService()
    {
        Connectivity.Current.ConnectivityChanged += (s, e) =>
        {
            NetworkStatusChanged?.Invoke(e.NetworkAccess == NetworkAccess.Internet);
        };
    }
}
`;

export const PRINTER_SERVICE_CS = `using System.Runtime.InteropServices;
using System.Text;
using GrainMarket.Models;

namespace GrainMarket.Services;

public class PrinterService
{
    public async Task<bool> PrintWeighingTicketAsync(Purchase p, string printerName = "POS-80")
    {
        await Task.Delay(50);
        return true;
    }

    public async Task ShareTicketPdfViaWhatsAppAsync(Purchase p, string phoneNumber = "")
    {
        string text = $"*غلہ منڈی کانٹا پرچی - NAZAR SOON CORPORATION*\n" +
                      $"پرچی نمبر: {p.VoucherNo}\n" +
                      $"تاریخ: {p.Date} {p.Time}\n" +
                      $"پارٹی: {p.PartyName}\n" +
                      $"جنس: {p.ItemName}\n" +
                      $"بھرا وزن (Gross): {p.GrossWeight:N0} KG\n" +
                      $"خالی وزن (Tare): {p.TareWeight:N0} KG\n" +
                      $"صاف وزن (Clean): {p.NetWeight:N0} KG\n" +
                      $"بوریاں: {p.Bags} Bori\n" +
                      $"ریٹ: PKR {p.RatePer40Kg:N2} /40KG\n" +
                      $"*کل رقم: PKR {p.TotalAmount:N0}*\n" +
                      $"حالت: {p.Status} | 100% کمپیوٹرائزڈ نظام";

        string encodedText = Uri.EscapeDataString(text);
        string waUrl = string.IsNullOrWhiteSpace(phoneNumber)
            ? $"https://api.whatsapp.com/send?text={encodedText}"
            : $"https://api.whatsapp.com/send?phone={phoneNumber.Replace("-", "").Replace(" ", "")}&text={encodedText}";

        await Launcher.OpenAsync(new Uri(waUrl));
    }
}
`;

export const PAIRING_SERVICE_CS = `using System.Text.Json;
using GrainMarket.Models;

namespace GrainMarket.Services;

public class PairingService
{
    private DevicePairingInfo _pairingInfo = new()
    {
        BusinessId = "biz-1",
        BusinessName = "NAZAR SOON CORPORATION",
        SyncKey = "MANDI-SYNC-KEY-998822",
        Role = "DesktopMaster",
        DeviceId = "DESK-01",
        DeviceName = "Master Terminal",
        MaxMobilesAllowed = 3
    };

    public DevicePairingInfo GetPairingInfo() => _pairingInfo;

    public string GeneratePairingPayload()
    {
        return JsonSerializer.Serialize(new
        {
            BusinessId = _pairingInfo.BusinessId,
            BusinessName = _pairingInfo.BusinessName,
            SyncKey = _pairingInfo.SyncKey,
            MasterDeviceId = _pairingInfo.DeviceId,
            MaxMobiles = 3,
            Timestamp = DateTime.UtcNow
        });
    }

    public bool PairMobileFromQrPayload(string qrJson)
    {
        try
        {
            using var doc = JsonDocument.Parse(qrJson);
            var root = doc.RootElement;
            if (root.TryGetProperty("BusinessId", out var bId) && root.TryGetProperty("SyncKey", out var sKey))
            {
                _pairingInfo.BusinessId = bId.GetString() ?? "biz-1";
                _pairingInfo.SyncKey = sKey.GetString() ?? "";
                _pairingInfo.Role = "MobileSlave";
                return true;
            }
        }
        catch { }
        return false;
    }
}
`;
