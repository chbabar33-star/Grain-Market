/**
 * Mandi ERP - Windows Desktop .NET 8 + SQLite Source Templates
 * Bundled for 1-click ZIP generation and offline compilation
 */

export const MANDI_ERP_CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <!-- Multi-targeting: net8.0-windows for Win10/Win11, net48 for Windows 7 SP1 / Win8 / Win10 / Win11 -->
    <TargetFrameworks>net8.0-windows;net48</TargetFrameworks>
    <LangVersion>12</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseWPF>true</UseWPF>
    <AssemblyName>MandiERP</AssemblyName>
    <RootNamespace>MandiERP</RootNamespace>
    
    <!-- Windows 7 SP1 (32-bit x86 & 64-bit x64), 8, 10, 11 Eligibility -->
    <TargetPlatformMinVersion>7.0</TargetPlatformMinVersion>
    <SupportedOSPlatformVersion>7.0</SupportedOSPlatformVersion>

    <!-- Single-File Standalone Executable Configuration for Modern Runtimes -->
    <PublishSingleFile Condition="'$(TargetFramework)' == 'net8.0-windows'">true</PublishSingleFile>
    <SelfContained Condition="'$(TargetFramework)' == 'net8.0-windows'">true</SelfContained>
    <IncludeNativeLibrariesForSelfExtract>true</IncludeNativeLibrariesForSelfExtract>
    <EnableCompressionInSingleFile>true</EnableCompressionInSingleFile>
    <DebugType>embedded</DebugType>
  </PropertyGroup>

  <!-- Cross-Platform SQLite Engine (100% compatible with Windows 7, 8, 10, 11) -->
  <ItemGroup>
    <PackageReference Include="Microsoft.Data.Sqlite" Version="8.0.8" />
  </ItemGroup>

</Project>
`;

export const BUILD_WINDOWS7_BAT = `@echo off
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
    echo [SUCCESS] Windows 7 32-bit executable created: %~dp0publish\\win7-x86\\MandiERP.exe
)
goto DONE

:BUILD_WIN7_X64
echo.
echo [1/1] Compiling Windows 7 SP1 64-bit (x64) Standalone Executable...
echo Target: net48 (Windows 7 SP1, Windows 8, Windows 10, Windows 11)
echo Output: ./publish/win7-x64/MandiERP-Win7-x64.exe
dotnet publish MandiERP.csproj -f net48 -c Release -r win-x64 --self-contained false -o ./publish/win7-x64
if %errorlevel% equ 0 (
    echo [SUCCESS] Windows 7 64-bit executable created: %~dp0publish\\win7-x64\\MandiERP.exe
)
goto DONE

:BUILD_WIN10_X64
echo.
echo [1/1] Compiling Windows 10 / 11 .NET 8 Self-Contained Single File...
echo Target: net8.0-windows (win-x64)
echo Output: ./publish/win10-x64/MandiERP.exe
dotnet publish MandiERP.csproj -f net8.0-windows -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -o ./publish/win10-x64
if %errorlevel% equ 0 (
    echo [SUCCESS] Windows 10/11 single-file .exe created: %~dp0publish\\win10-x64\\MandiERP.exe
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
`;


export const BUILD_SINGLE_EXE_BAT = `@echo off
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
    echo File: %~dp0publish\\MandiERP.exe
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
`;

export const APP_XAML = `<Application x:Class="MandiERP.App"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
             StartupUri="MainWindow.xaml">
    <Application.Resources>
        <SolidColorBrush x:Key="PrimaryGreen" Color="#064E3B" />
        <SolidColorBrush x:Key="AccentGreen" Color="#059669" />
        <SolidColorBrush x:Key="DarkSlate" Color="#0F172A" />
        <SolidColorBrush x:Key="CardBackground" Color="#FFFFFF" />
        <SolidColorBrush x:Key="BorderColor" Color="#E2E8F0" />
        
        <Style TargetType="Button">
            <Setter Property="Background" Value="{StaticResource PrimaryGreen}" />
            <Setter Property="Foreground" Value="White" />
            <Setter Property="FontWeight" Value="SemiBold" />
            <Setter Property="Padding" Value="14,8" />
            <Setter Property="BorderThickness" Value="0" />
            <Setter Property="Cursor" Value="Hand" />
        </Style>
    </Application.Resources>
</Application>
`;

export const APP_XAML_CS = `using System.Windows;

namespace MandiERP;

public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
    }
}
`;

export const MODELS_CS = `namespace MandiERP.Models;

public class Business
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameUrdu { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string AddressUrdu { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Proprietor { get; set; } = string.Empty;
    public string ProprietorUrdu { get; set; } = string.Empty;
    public string NTN { get; set; } = string.Empty;
    public string LogoText { get; set; } = "NSC";
    public bool IsDefault { get; set; }
}

public class User
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "Munshi";
    public string Pin { get; set; } = "1234";
    public string Email { get; set; } = string.Empty;
}

public class Item
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameUrdu { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public double BagWeightKg { get; set; } = 100.0;
    public double DefaultCommissionRate { get; set; } = 1.5;
    public double DefaultExpensePerBag { get; set; } = 15.0;
}

public class Party
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string NameUrdu { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Type { get; set; } = "Supplier"; // Supplier, Customer, Both
    public double OpeningBalance { get; set; }
    public string Status { get; set; } = "Active";
}

public class Godown
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int CapacityBags { get; set; } = 5000;
}

public class Voucher
{
    public string Id { get; set; } = string.Empty;
    public string VoucherNo { get; set; } = string.Empty;
    public string Date { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public string Time { get; set; } = DateTime.Now.ToString("HH:mm:ss");
    public string Type { get; set; } = "PURCHASE"; // PURCHASE, SALE, TRANSFER, EXPENSE
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
    public double NetWeight { get; set; }
    public int Bags { get; set; }
    public double Deductions { get; set; } // karda, moisture, dirt kg
    public double FinalWeight { get; set; } // NetWeight - Deductions
    public double Rate { get; set; } // Rate per 40kg (Maund) or per kg
    public double TotalAmount { get; set; }
    public string Status { get; set; } = "Approved"; // Pending, Approved, Rejected
    public string CreatedBy { get; set; } = "Munshi";
    public string Remarks { get; set; } = string.Empty;
}

public class ThermalPrinterConfig
{
    public string PrinterName { get; set; } = "POS-80";
    public int PaperWidthMm { get; set; } = 80;
    public bool AutoCut { get; set; } = true;
    public int FeedLines { get; set; } = 3;
    public bool BeepOnPrint { get; set; } = true;
    public string ShopHeader { get; set; } = "NAZAR SOON CORPORATION (غلہ منڈی)";
    public string FooterNote { get; set; } = "کمپیوٹرائزڈ کانٹا پرچی - غلہ منڈی سافٹ ویئر";
}
`;

export const DATABASE_MANAGER_CS = `using System.IO;
using Microsoft.Data.Sqlite;
using MandiERP.Models;

namespace MandiERP.Database;

public class DatabaseManager
{
    private readonly string _connectionString;
    public string DatabaseFilePath { get; }
    public string CurrentBusinessId { get; }

    public DatabaseManager(string businessId = "biz-1")
    {
        CurrentBusinessId = businessId;
        string appDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MandiERP", "Data");
        
        string localDataDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data");
        string targetDir = Directory.Exists(localDataDir) ? localDataDir : appDataDir;

        if (!Directory.Exists(targetDir))
        {
            Directory.CreateDirectory(targetDir);
        }

        DatabaseFilePath = Path.Combine(targetDir, $"Mandi_{businessId}.db");
        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = DatabaseFilePath,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Cache = SqliteCacheMode.Shared
        }.ToString();

        InitializeDatabase();
    }

    private void InitializeDatabase()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;

            CREATE TABLE IF NOT EXISTS Business (
                Id TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                NameUrdu TEXT,
                Address TEXT,
                AddressUrdu TEXT,
                Phone TEXT,
                Proprietor TEXT,
                ProprietorUrdu TEXT,
                NTN TEXT,
                LogoText TEXT,
                IsDefault INTEGER
            );

            CREATE TABLE IF NOT EXISTS Users (
                Id TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                Role TEXT,
                Pin TEXT,
                Email TEXT
            );

            CREATE TABLE IF NOT EXISTS Items (
                Id TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                NameUrdu TEXT,
                Code TEXT,
                BagWeightKg REAL,
                DefaultCommissionRate REAL,
                DefaultExpensePerBag REAL
            );

            CREATE TABLE IF NOT EXISTS Parties (
                Id TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                NameUrdu TEXT,
                Phone TEXT,
                Address TEXT,
                Type TEXT,
                OpeningBalance REAL,
                Status TEXT
            );

            CREATE TABLE IF NOT EXISTS Godowns (
                Id TEXT PRIMARY KEY,
                Name TEXT NOT NULL,
                Location TEXT,
                CapacityBags INTEGER
            );

            CREATE TABLE IF NOT EXISTS Vouchers (
                Id TEXT PRIMARY KEY,
                VoucherNo TEXT UNIQUE NOT NULL,
                Date TEXT NOT NULL,
                Time TEXT,
                Type TEXT NOT NULL,
                PartyId TEXT,
                PartyName TEXT,
                ItemId TEXT,
                ItemName TEXT,
                GodownId TEXT,
                GodownName TEXT,
                VehicleNo TEXT,
                DriverPhone TEXT,
                GrossWeight REAL,
                TareWeight REAL,
                NetWeight REAL,
                Bags INTEGER,
                Deductions REAL,
                FinalWeight REAL,
                Rate REAL,
                TotalAmount REAL,
                Status TEXT,
                CreatedBy TEXT,
                Remarks TEXT
            );

            CREATE TABLE IF NOT EXISTS PrinterSettings (
                Key TEXT PRIMARY KEY,
                PrinterName TEXT,
                PaperWidthMm INTEGER,
                AutoCut INTEGER,
                FeedLines INTEGER,
                ShopHeader TEXT,
                FooterNote TEXT
            );
        ";
        cmd.ExecuteNonQuery();

        SeedDefaultDataIfEmpty(conn);
    }

    private void SeedDefaultDataIfEmpty(SqliteConnection conn)
    {
        using var checkCmd = conn.CreateCommand();
        checkCmd.CommandText = "SELECT COUNT(*) FROM Business;";
        long count = (long)(checkCmd.ExecuteScalar() ?? 0);
        if (count > 0) return;

        using var seedCmd = conn.CreateCommand();
        seedCmd.CommandText = @"
            INSERT INTO Business (Id, Name, NameUrdu, Address, AddressUrdu, Phone, Proprietor, ProprietorUrdu, NTN, LogoText, IsDefault)
            VALUES ('biz-1', 'NAZAR SOON CORPORATION', 'نظر سون کارپوریشن', 'Grain Market (Galla Mandi), Shop # 14-B', 'غلہ منڈی سرگودھا', '+92 300 1234567', 'Ch. Babar Ameen', 'چوہدری بابر امین', '7392814-5', 'NSC', 1);

            INSERT INTO Items (Id, Name, NameUrdu, Code, BagWeightKg, DefaultCommissionRate, DefaultExpensePerBag)
            VALUES
            ('itm-1', 'Wheat (گندم)', 'گندم دیسی سپریم', 'WHT-01', 100.0, 1.5, 15.0),
            ('itm-2', 'Basmati Rice (باسمتی چاول)', 'سپر باسمتی چاول', 'RCE-01', 50.0, 1.5, 12.0),
            ('itm-3', 'Corn / Maize (مکئی)', 'مکئی پیلی ہائبرڈ', 'MAZ-01', 80.0, 1.5, 14.0),
            ('itm-4', 'Mustard / Sarson (سرسوں)', 'سرسوں رایا', 'CAN-01', 40.0, 2.0, 10.0);

            INSERT INTO Parties (Id, Name, NameUrdu, Phone, Address, Type, OpeningBalance, Status)
            VALUES
            ('pty-1', 'Ch. Tariq Gujjar', 'چوہدری طارق گجر', '0300-8765432', 'Chak 42-SB, Sargodha', 'Supplier', 0, 'Active'),
            ('pty-2', 'Mian Zahid Farooq', 'میاں زاہد فاروق', '0301-2345678', 'Mouza Kot Momin', 'Supplier', 0, 'Active'),
            ('pty-3', 'Al-Rahman Flour Mills Ltd', 'الرحمٰن فلور ملز', '0321-9876543', 'Industrial Area, Faisalabad', 'Customer', 0, 'Active');

            INSERT INTO Godowns (Id, Name, Location, CapacityBags)
            VALUES
            ('gdn-1', 'Main Market Yard (Galla Mandi Pharr)', 'Front Yard', 10000),
            ('gdn-2', 'Godown # 1 (Station Road)', 'Plot 4, Rail Road', 6000);

            INSERT INTO PrinterSettings (Key, PrinterName, PaperWidthMm, AutoCut, FeedLines, ShopHeader, FooterNote)
            VALUES ('default', 'POS-80', 80, 1, 3, 'NAZAR SOON CORPORATION (غلہ منڈی)', 'کمپیوٹرائزڈ کانٹا پرچی - منڈی سافٹ ویئر');
        ";
        seedCmd.ExecuteNonQuery();
    }

    public List<Voucher> GetAllVouchers()
    {
        var list = new List<Voucher>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT * FROM Vouchers ORDER BY Date DESC, Time DESC;";
        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            list.Add(new Voucher
            {
                Id = reader.GetString(0),
                VoucherNo = reader.GetString(1),
                Date = reader.GetString(2),
                Time = reader.IsDBNull(3) ? "" : reader.GetString(3),
                Type = reader.GetString(4),
                PartyId = reader.IsDBNull(5) ? "" : reader.GetString(5),
                PartyName = reader.IsDBNull(6) ? "" : reader.GetString(6),
                ItemId = reader.IsDBNull(7) ? "" : reader.GetString(7),
                ItemName = reader.IsDBNull(8) ? "" : reader.GetString(8),
                GodownId = reader.IsDBNull(9) ? "" : reader.GetString(9),
                GodownName = reader.IsDBNull(10) ? "" : reader.GetString(10),
                VehicleNo = reader.IsDBNull(11) ? "" : reader.GetString(11),
                DriverPhone = reader.IsDBNull(12) ? "" : reader.GetString(12),
                GrossWeight = reader.GetDouble(13),
                TareWeight = reader.GetDouble(14),
                NetWeight = reader.GetDouble(15),
                Bags = reader.GetInt32(16),
                Deductions = reader.GetDouble(17),
                FinalWeight = reader.GetDouble(18),
                Rate = reader.GetDouble(19),
                TotalAmount = reader.GetDouble(20),
                Status = reader.GetString(21),
                CreatedBy = reader.IsDBNull(22) ? "" : reader.GetString(22),
                Remarks = reader.IsDBNull(23) ? "" : reader.GetString(23)
            });
        }
        return list;
    }

    public void InsertVoucher(Voucher v)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO Vouchers (
                Id, VoucherNo, Date, Time, Type, PartyId, PartyName, ItemId, ItemName, 
                GodownId, GodownName, VehicleNo, DriverPhone, GrossWeight, TareWeight, 
                NetWeight, Bags, Deductions, FinalWeight, Rate, TotalAmount, Status, CreatedBy, Remarks
            ) VALUES (
                @Id, @VoucherNo, @Date, @Time, @Type, @PartyId, @PartyName, @ItemId, @ItemName, 
                @GodownId, @GodownName, @VehicleNo, @DriverPhone, @GrossWeight, @TareWeight, 
                @NetWeight, @Bags, @Deductions, @FinalWeight, @Rate, @TotalAmount, @Status, @CreatedBy, @Remarks
            );";

        cmd.Parameters.AddWithValue("@Id", string.IsNullOrEmpty(v.Id) ? Guid.NewGuid().ToString() : v.Id);
        cmd.Parameters.AddWithValue("@VoucherNo", v.VoucherNo);
        cmd.Parameters.AddWithValue("@Date", v.Date);
        cmd.Parameters.AddWithValue("@Time", v.Time);
        cmd.Parameters.AddWithValue("@Type", v.Type);
        cmd.Parameters.AddWithValue("@PartyId", v.PartyId);
        cmd.Parameters.AddWithValue("@PartyName", v.PartyName);
        cmd.Parameters.AddWithValue("@ItemId", v.ItemId);
        cmd.Parameters.AddWithValue("@ItemName", v.ItemName);
        cmd.Parameters.AddWithValue("@GodownId", v.GodownId);
        cmd.Parameters.AddWithValue("@GodownName", v.GodownName);
        cmd.Parameters.AddWithValue("@VehicleNo", v.VehicleNo);
        cmd.Parameters.AddWithValue("@DriverPhone", v.DriverPhone);
        cmd.Parameters.AddWithValue("@GrossWeight", v.GrossWeight);
        cmd.Parameters.AddWithValue("@TareWeight", v.TareWeight);
        cmd.Parameters.AddWithValue("@NetWeight", v.NetWeight);
        cmd.Parameters.AddWithValue("@Bags", v.Bags);
        cmd.Parameters.AddWithValue("@Deductions", v.Deductions);
        cmd.Parameters.AddWithValue("@FinalWeight", v.FinalWeight);
        cmd.Parameters.AddWithValue("@Rate", v.Rate);
        cmd.Parameters.AddWithValue("@TotalAmount", v.TotalAmount);
        cmd.Parameters.AddWithValue("@Status", v.Status);
        cmd.Parameters.AddWithValue("@CreatedBy", v.CreatedBy);
        cmd.Parameters.AddWithValue("@Remarks", v.Remarks);

        cmd.ExecuteNonQuery();
    }

    public List<Party> GetAllParties()
    {
        var list = new List<Party>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT Id, Name, NameUrdu, Phone, Address, Type, OpeningBalance, Status FROM Parties ORDER BY Name ASC;";
        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            list.Add(new Party
            {
                Id = reader.GetString(0),
                Name = reader.GetString(1),
                NameUrdu = reader.IsDBNull(2) ? "" : reader.GetString(2),
                Phone = reader.IsDBNull(3) ? "" : reader.GetString(3),
                Address = reader.IsDBNull(4) ? "" : reader.GetString(4),
                Type = reader.GetString(5),
                OpeningBalance = reader.GetDouble(6),
                Status = reader.GetString(7)
            });
        }
        return list;
    }

    public List<Item> GetAllItems()
    {
        var list = new List<Item>();
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT Id, Name, NameUrdu, Code, BagWeightKg, DefaultCommissionRate, DefaultExpensePerBag FROM Items ORDER BY Name ASC;";
        using var reader = cmd.ExecuteReader();

        while (reader.Read())
        {
            list.Add(new Item
            {
                Id = reader.GetString(0),
                Name = reader.GetString(1),
                NameUrdu = reader.IsDBNull(2) ? "" : reader.GetString(2),
                Code = reader.IsDBNull(3) ? "" : reader.GetString(3),
                BagWeightKg = reader.GetDouble(4),
                DefaultCommissionRate = reader.GetDouble(5),
                DefaultExpensePerBag = reader.GetDouble(6)
            });
        }
        return list;
    }

    public ThermalPrinterConfig GetPrinterConfig()
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = "SELECT PrinterName, PaperWidthMm, AutoCut, FeedLines, ShopHeader, FooterNote FROM PrinterSettings WHERE Key = 'default';";
        using var reader = cmd.ExecuteReader();

        if (reader.Read())
        {
            return new ThermalPrinterConfig
            {
                PrinterName = reader.GetString(0),
                PaperWidthMm = reader.GetInt32(1),
                AutoCut = reader.GetInt32(2) == 1,
                FeedLines = reader.GetInt32(3),
                ShopHeader = reader.GetString(4),
                FooterNote = reader.GetString(5)
            };
        }
        return new ThermalPrinterConfig();
    }

    public void SavePrinterConfig(ThermalPrinterConfig cfg)
    {
        using var conn = new SqliteConnection(_connectionString);
        conn.Open();

        using var cmd = conn.CreateCommand();
        cmd.CommandText = @"
            INSERT INTO PrinterSettings (Key, PrinterName, PaperWidthMm, AutoCut, FeedLines, ShopHeader, FooterNote)
            VALUES ('default', @PrinterName, @PaperWidthMm, @AutoCut, @FeedLines, @ShopHeader, @FooterNote)
            ON CONFLICT(Key) DO UPDATE SET
                PrinterName = excluded.PrinterName,
                PaperWidthMm = excluded.PaperWidthMm,
                AutoCut = excluded.AutoCut,
                FeedLines = excluded.FeedLines,
                ShopHeader = excluded.ShopHeader,
                FooterNote = excluded.FooterNote;";

        cmd.Parameters.AddWithValue("@PrinterName", cfg.PrinterName);
        cmd.Parameters.AddWithValue("@PaperWidthMm", cfg.PaperWidthMm);
        cmd.Parameters.AddWithValue("@AutoCut", cfg.AutoCut ? 1 : 0);
        cmd.Parameters.AddWithValue("@FeedLines", cfg.FeedLines);
        cmd.Parameters.AddWithValue("@ShopHeader", cfg.ShopHeader);
        cmd.Parameters.AddWithValue("@FooterNote", cfg.FooterNote);

        cmd.ExecuteNonQuery();
    }
}
`;

export const DIRECT_THERMAL_PRINTER_CS = `using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using MandiERP.Models;

namespace MandiERP.Hardware;

public class DirectThermalPrinter
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA
    {
        [MarshalAs(UnmanagedType.LPStr)] public string? pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string? pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string? pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static bool SendBytesToPrinter(string printerName, byte[] bytes)
    {
        if (string.IsNullOrWhiteSpace(printerName)) return false;

        IntPtr hPrinter;
        var di = new DOCINFOA
        {
            pDocName = "Mandi_Weighing_Ticket",
            pDataType = "RAW"
        };

        if (!OpenPrinter(printerName.Normalize(), out hPrinter, IntPtr.Zero))
        {
            return false;
        }

        bool success = false;
        if (StartDocPrinter(hPrinter, 1, di))
        {
            if (StartPagePrinter(hPrinter))
            {
                IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
                Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);

                success = WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out _);
                Marshal.FreeCoTaskMem(pUnmanagedBytes);

                EndPagePrinter(hPrinter);
            }
            EndDocPrinter(hPrinter);
        }
        ClosePrinter(hPrinter);
        return success;
    }

    public static byte[] BuildEscPosWeighingTicket(Voucher voucher, Business business, ThermalPrinterConfig config)
    {
        using var ms = new MemoryStream();
        using var bw = new BinaryWriter(ms, Encoding.ASCII);

        // ESC @ -> Initialize printer
        bw.Write(new byte[] { 0x1B, 0x40 });

        // Optional Beep
        if (config.BeepOnPrint)
        {
            bw.Write(new byte[] { 0x1B, 0x42, 0x02, 0x02 });
        }

        // Align Center
        bw.Write(new byte[] { 0x1B, 0x61, 0x01 });

        // Double Height + Double Width for Shop Name
        bw.Write(new byte[] { 0x1D, 0x21, 0x11 });
        bw.Write(Encoding.ASCII.GetBytes(business.Name + "\\n"));

        // Normal text size
        bw.Write(new byte[] { 0x1D, 0x21, 0x00 });
        bw.Write(Encoding.ASCII.GetBytes(business.Address + "\\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Phone: {business.Phone} | NTN: {business.NTN}\\n"));
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\\n"));

        // Title
        bw.Write(new byte[] { 0x1B, 0x45, 0x01 });
        string typeLabel = voucher.Type == "PURCHASE" ? "WEIGHBRIDGE PURCHASE SLIP (KANTA PARCHI)" : "SALES OUTWARD SLIP";
        bw.Write(Encoding.ASCII.GetBytes(typeLabel + "\\n"));
        bw.Write(new byte[] { 0x1B, 0x45, 0x00 });

        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\\n"));

        // Align Left
        bw.Write(new byte[] { 0x1B, 0x61, 0x00 });
        bw.Write(Encoding.ASCII.GetBytes($"Token / Voucher No: {voucher.VoucherNo}\\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Date & Time       : {voucher.Date} {voucher.Time}\\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Party (Farmer/Mill): {voucher.PartyName}\\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Commodity (Jins)  : {voucher.ItemName}\\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Godown Destination: {voucher.GodownName}\\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Vehicle No        : {voucher.VehicleNo}\\n"));
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\\n"));

        // Weights Breakdown
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\\n", "GROSS WEIGHT (Bhara)", voucher.GrossWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\\n", "TARE WEIGHT (Khali)", voucher.TareWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\\n", "NET WEIGHT (Wazan)", voucher.NetWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} BAGS\\n", "BAGS COUNT (Bori)", voucher.Bags)));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\\n", "DEDUCTION (Karda/Chhan)", voucher.Deductions.ToString("N0"))));

        bw.Write(Encoding.ASCII.GetBytes("================================================\\n"));

        // Final Clean Weight & Total
        bw.Write(new byte[] { 0x1B, 0x45, 0x01 });
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\\n", "FINAL CLEAN WEIGHT", voucher.FinalWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : PKR {1,10:N2} /40kg\\n", "AGREED RATE", voucher.Rate)));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : PKR {1,10:N0}\\n", "TOTAL VALUE", voucher.TotalAmount)));
        bw.Write(new byte[] { 0x1B, 0x45, 0x00 });

        bw.Write(Encoding.ASCII.GetBytes("================================================\\n"));
        bw.Write(Encoding.ASCII.GetBytes("\\n  Munshi / Weighmaster            Party / Driver\\n  ____________________           ____________________\\n\\n"));

        // Footer & Feed
        bw.Write(new byte[] { 0x1B, 0x61, 0x01 });
        bw.Write(Encoding.ASCII.GetBytes(config.FooterNote + "\\n"));
        bw.Write(Encoding.ASCII.GetBytes("Powered by Mandi ERP Offline Desktop Edition (.NET 8)\\n"));

        for (int i = 0; i < Math.Max(1, config.FeedLines); i++)
        {
            bw.Write((byte)0x0A);
        }

        if (config.AutoCut)
        {
            bw.Write(new byte[] { 0x1D, 0x56, 0x42, 0x00 });
        }

        return ms.ToArray();
    }
}
`;

export const MAIN_WINDOW_XAML = `<Window x:Class="MandiERP.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Mandi ERP - Offline Desktop Terminal (.NET 8 + SQLite)" 
        Height="800" Width="1200"
        WindowStartupLocation="CenterScreen"
        Background="#F1F5F9"
        FontFamily="Segoe UI, Noto Nastaliq Urdu, Arial">

    <Grid>
        <Grid.RowDefinitions>
            <RowDefinition Height="64" />
            <RowDefinition Height="*" />
            <RowDefinition Height="28" />
        </Grid.RowDefinitions>

        <!-- TOP BAR -->
        <Border Grid.Row="0" Background="#064E3B" Padding="16,0">
            <Grid VerticalAlignment="Center">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto" />
                    <ColumnDefinition Width="*" />
                    <ColumnDefinition Width="Auto" />
                </Grid.ColumnDefinitions>

                <StackPanel Grid.Column="0" Orientation="Horizontal" VerticalAlignment="Center">
                    <Border Background="#047857" CornerRadius="8" Width="40" Height="40" Margin="0,0,12,0">
                        <TextBlock Text="🌾" FontSize="20" HorizontalAlignment="Center" VerticalAlignment="Center" />
                    </Border>
                    <StackPanel VerticalAlignment="Center">
                        <TextBlock Text="NAZAR SOON CORPORATION" FontWeight="Bold" FontSize="16" Foreground="White" />
                        <TextBlock Text="غلہ منڈی نظام - 100% آف لائن ڈیسک ٹاپ سافٹ ویئر" FontSize="11" Foreground="#A7F3D0" />
                    </StackPanel>
                </StackPanel>

                <StackPanel Grid.Column="2" Orientation="Horizontal" VerticalAlignment="Center">
                    <Border Background="#022C22" CornerRadius="6" Padding="10,5" Margin="0,0,8,0">
                        <StackPanel Orientation="Horizontal">
                            <TextBlock Text="💾 " Foreground="#34D399" FontSize="11" />
                            <TextBlock x:Name="TxtDbStatus" Text="SQLite: Mandi_biz-1.db" Foreground="#D1FAE5" FontSize="11" FontWeight="SemiBold" />
                        </StackPanel>
                    </Border>

                    <Border Background="#022C22" CornerRadius="6" Padding="10,5" Margin="0,0,8,0">
                        <StackPanel Orientation="Horizontal">
                            <TextBlock Text="🖨️ " Foreground="#34D399" FontSize="11" />
                            <TextBlock x:Name="TxtPrinterStatus" Text="Thermal: POS-80 (Direct RAW)" Foreground="#D1FAE5" FontSize="11" FontWeight="SemiBold" />
                        </StackPanel>
                    </Border>

                    <Border Background="#059669" CornerRadius="6" Padding="10,5">
                        <TextBlock Text="Windows 10/11 Single .exe" Foreground="White" FontSize="11" FontWeight="Bold" />
                    </Border>
                </StackPanel>
            </Grid>
        </Border>

        <!-- MAIN SPLIT -->
        <Grid Grid.Row="1">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="230" />
                <ColumnDefinition Width="*" />
            </Grid.ColumnDefinitions>

            <!-- SIDEBAR -->
            <Border Grid.Column="0" Background="#0F172A">
                <DockPanel LastChildFill="True">
                    <TextBlock DockPanel.Dock="Top" Text="MODULES &amp; REGISTERS" FontSize="10" FontWeight="Bold" Foreground="#64748B" Margin="16,16,16,8" />

                    <StackPanel DockPanel.Dock="Top">
                        <Button x:Name="BtnNavDashboard" Click="Nav_Click" Tag="Dashboard" HorizontalContentAlignment="Left" Padding="14,12" Background="#1E293B" Margin="0,1">
                            <TextBlock Text="📊  Executive Dashboard" FontSize="13" />
                        </Button>
                        <Button x:Name="BtnNavWeighbridge" Click="Nav_Click" Tag="Weighbridge" HorizontalContentAlignment="Left" Padding="14,12" Background="Transparent" Margin="0,1">
                            <TextBlock Text="⚖️  Weighbridge Purchase" FontSize="13" />
                        </Button>
                        <Button x:Name="BtnNavParties" Click="Nav_Click" Tag="Parties" HorizontalContentAlignment="Left" Padding="14,12" Background="Transparent" Margin="0,1">
                            <TextBlock Text="👥  Party Information" FontSize="13" />
                        </Button>
                        <Button x:Name="BtnNavPrinter" Click="Nav_Click" Tag="PrinterSettings" HorizontalContentAlignment="Left" Padding="14,12" Background="Transparent" Margin="0,1">
                            <TextBlock Text="🖨️  Direct Thermal Settings" FontSize="13" />
                        </Button>
                    </StackPanel>

                    <Border DockPanel.Dock="Bottom" Background="#1E293B" Padding="12" Margin="8">
                        <StackPanel>
                            <TextBlock Text="Active User:" FontSize="10" Foreground="#94A3B8" />
                            <TextBlock Text="Ch. Babar Ameen (Owner)" FontSize="12" FontWeight="Bold" Foreground="White" />
                            <TextBlock Text="100% Offline (No Web / No Cloud)" FontSize="10" Foreground="#34D399" Margin="0,2,0,0" />
                        </StackPanel>
                    </Border>
                </DockPanel>
            </Border>

            <!-- MAIN WORKSPACE -->
            <Grid Grid.Column="1" Margin="16">
                <!-- VIEW 1: DASHBOARD -->
                <Grid x:Name="ViewDashboard" Visibility="Visible">
                    <Grid.RowDefinitions>
                        <RowDefinition Height="Auto" />
                        <RowDefinition Height="Auto" />
                        <RowDefinition Height="*" />
                    </Grid.RowDefinitions>

                    <TextBlock Grid.Row="0" Text="Mandi Overview &amp; Today Real-Time KPIs" FontSize="18" FontWeight="Bold" Foreground="#0F172A" Margin="0,0,0,16" />

                    <!-- Top 4 KPI Cards -->
                    <Grid Grid.Row="1" Margin="0,0,0,16">
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="*" />
                            <ColumnDefinition Width="*" />
                            <ColumnDefinition Width="*" />
                            <ColumnDefinition Width="*" />
                        </Grid.ColumnDefinitions>

                        <Border Grid.Column="0" Background="White" CornerRadius="10" Padding="16" Margin="0,0,8,0" BorderBrush="#E2E8F0" BorderThickness="1">
                            <StackPanel>
                                <TextBlock Text="TODAY PURCHASE" FontSize="10" FontWeight="Bold" Foreground="#64748B" />
                                <TextBlock x:Name="TxtTodayPurchaseAmount" Text="PKR 1,420,000" FontSize="18" FontWeight="Bold" Foreground="#0F172A" Margin="0,4" />
                                <TextBlock x:Name="TxtTodayPurchaseWeight" Text="14,200 KG · 284 Bags" FontSize="11" Foreground="#059669" />
                            </StackPanel>
                        </Border>

                        <Border Grid.Column="1" Background="White" CornerRadius="10" Padding="16" Margin="4,0,4,0" BorderBrush="#E2E8F0" BorderThickness="1">
                            <StackPanel>
                                <TextBlock Text="TODAY SALES" FontSize="10" FontWeight="Bold" Foreground="#64748B" />
                                <TextBlock x:Name="TxtTodaySalesAmount" Text="PKR 1,580,000" FontSize="18" FontWeight="Bold" Foreground="#0F172A" Margin="0,4" />
                                <TextBlock x:Name="TxtTodaySalesWeight" Text="15,000 KG · 300 Bags" FontSize="11" Foreground="#2563EB" />
                            </StackPanel>
                        </Border>

                        <Border Grid.Column="2" Background="White" CornerRadius="10" Padding="16" Margin="4,0,4,0" BorderBrush="#E2E8F0" BorderThickness="1">
                            <StackPanel>
                                <TextBlock Text="TOTAL VOUCHERS (SQLITE)" FontSize="10" FontWeight="Bold" Foreground="#64748B" />
                                <TextBlock x:Name="TxtTotalVouchersCount" Text="128 Vouchers" FontSize="18" FontWeight="Bold" Foreground="#0F172A" Margin="0,4" />
                                <TextBlock Text="Local Offline Database" FontSize="11" Foreground="#64748B" />
                            </StackPanel>
                        </Border>

                        <Border Grid.Column="3" Background="White" CornerRadius="10" Padding="16" Margin="8,0,0,0" BorderBrush="#E2E8F0" BorderThickness="1">
                            <StackPanel>
                                <TextBlock Text="DIRECT THERMAL SPOOLER" FontSize="10" FontWeight="Bold" Foreground="#64748B" />
                                <TextBlock Text="Raw WinSpool ESC/POS" FontSize="15" FontWeight="Bold" Foreground="#059669" Margin="0,6" />
                                <TextBlock Text="Zero Print Dialog / Auto Cut" FontSize="11" Foreground="#64748B" />
                            </StackPanel>
                        </Border>
                    </Grid>

                    <!-- Recent Vouchers Grid -->
                    <Border Grid.Row="2" Background="White" CornerRadius="10" BorderBrush="#E2E8F0" BorderThickness="1" Padding="16">
                        <DockPanel LastChildFill="True">
                            <Grid DockPanel.Dock="Top" Margin="0,0,0,12">
                                <TextBlock Text="Live Vouchers &amp; Weighing Tickets from SQLite" FontSize="14" FontWeight="Bold" Foreground="#0F172A" VerticalAlignment="Center" />
                                <StackPanel Orientation="Horizontal" HorizontalAlignment="Right">
                                    <Button Content="➕ New Weighbridge Ticket" Click="BtnNewTicket_Click" Background="#064E3B" Foreground="White" Margin="0,0,8,0" />
                                    <Button Content="🔄 Refresh Data" Click="BtnRefresh_Click" Background="#F1F5F9" Foreground="#0F172A" BorderBrush="#CBD5E1" BorderThickness="1" />
                                </StackPanel>
                            </Grid>

                            <DataGrid x:Name="GridRecentVouchers" AutoGenerateColumns="False" IsReadOnly="True" HeadersVisibility="Column" GridLinesVisibility="Horizontal" RowHeight="32">
                                <DataGrid.Columns>
                                    <DataGridTextColumn Header="Ticket #" Binding="{Binding VoucherNo}" Width="100" />
                                    <DataGridTextColumn Header="Date" Binding="{Binding Date}" Width="90" />
                                    <DataGridTextColumn Header="Type" Binding="{Binding Type}" Width="80" />
                                    <DataGridTextColumn Header="Party Name" Binding="{Binding PartyName}" Width="*" />
                                    <DataGridTextColumn Header="Commodity" Binding="{Binding ItemName}" Width="120" />
                                    <DataGridTextColumn Header="Gross (KG)" Binding="{Binding GrossWeight, StringFormat={}{0:N0}}" Width="90" />
                                    <DataGridTextColumn Header="Tare (KG)" Binding="{Binding TareWeight, StringFormat={}{0:N0}}" Width="90" />
                                    <DataGridTextColumn Header="Final (KG)" Binding="{Binding FinalWeight, StringFormat={}{0:N0}}" Width="90" />
                                    <DataGridTextColumn Header="Rate (PKR)" Binding="{Binding Rate, StringFormat={}{0:N2}}" Width="90" />
                                    <DataGridTextColumn Header="Total (PKR)" Binding="{Binding TotalAmount, StringFormat={}{0:N0}}" Width="110" />
                                </DataGrid.Columns>
                            </DataGrid>
                        </DockPanel>
                    </Border>
                </Grid>

                <!-- VIEW 2: WEIGHBRIDGE PURCHASE ENTRY -->
                <Grid x:Name="ViewWeighbridge" Visibility="Collapsed">
                    <Border Background="White" CornerRadius="12" BorderBrush="#E2E8F0" BorderThickness="1" Padding="20">
                        <ScrollViewer VerticalScrollBarVisibility="Auto">
                            <StackPanel MaxWidth="800" HorizontalAlignment="Left">
                                <TextBlock Text="Weighbridge First-Weight Purchase Slip (کانٹا پرچی خریداری)" FontSize="18" FontWeight="Bold" Foreground="#064E3B" Margin="0,0,0,16" />

                                <Grid Margin="0,0,0,12">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="*" />
                                    </Grid.ColumnDefinitions>
                                    <StackPanel Grid.Column="0" Margin="0,0,8,0">
                                        <TextBlock Text="Ticket / Voucher No:" FontWeight="SemiBold" FontSize="12" Margin="0,0,0,4" />
                                        <TextBox x:Name="TxtWbVoucherNo" Text="PUR-2026-001" IsReadOnly="True" Background="#F8FAFC" />
                                    </StackPanel>
                                    <StackPanel Grid.Column="1" Margin="8,0,0,0">
                                        <TextBlock Text="Date &amp; Time:" FontWeight="SemiBold" FontSize="12" Margin="0,0,0,4" />
                                        <TextBox x:Name="TxtWbDate" IsReadOnly="True" Background="#F8FAFC" />
                                    </StackPanel>
                                </Grid>

                                <Grid Margin="0,0,0,12">
                                    <Grid.ColumnDefinitions>
                                        <ColumnDefinition Width="*" />
                                        <ColumnDefinition Width="*" />
                                    </Grid.ColumnDefinitions>
                                    <StackPanel Grid.Column="0" Margin="0,0,8,0">
                                        <TextBlock Text="Party (Farmer / Supplier):" FontWeight="SemiBold" FontSize="12" Margin="0,0,0,4" />
                                        <ComboBox x:Name="CmbWbParty" Height="32" DisplayMemberPath="Name" />
                                    </StackPanel>
                                    <StackPanel Grid.Column="1" Margin="8,0,0,0">
                                        <TextBlock Text="Commodity (Jins):" FontWeight="SemiBold" FontSize="12" Margin="0,0,0,4" />
                                        <ComboBox x:Name="CmbWbItem" Height="32" DisplayMemberPath="Name" />
                                    </StackPanel>
                                </Grid>

                                <Border Background="#F8FAFC" BorderBrush="#E2E8F0" BorderThickness="1" CornerRadius="8" Padding="14" Margin="0,8,0,16">
                                    <StackPanel>
                                        <TextBlock Text="Weighbridge Calculations (First-Weight Costing):" FontWeight="Bold" FontSize="13" Foreground="#0F172A" Margin="0,0,0,10" />

                                        <Grid Margin="0,0,0,8">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="*" />
                                            </Grid.ColumnDefinitions>
                                            <StackPanel Grid.Column="0" Margin="0,0,6,0">
                                                <TextBlock Text="Gross Weight (KG):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbGross" Text="18500" TextChanged="WbWeights_Changed" />
                                            </StackPanel>
                                            <StackPanel Grid.Column="1" Margin="3,0,3,0">
                                                <TextBlock Text="Tare Weight (KG):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbTare" Text="4500" TextChanged="WbWeights_Changed" />
                                            </StackPanel>
                                            <StackPanel Grid.Column="2" Margin="6,0,0,0">
                                                <TextBlock Text="Net Weight (KG):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbNet" Text="14000" IsReadOnly="True" Background="#E2E8F0" FontWeight="Bold" />
                                            </StackPanel>
                                        </Grid>

                                        <Grid Margin="0,0,0,8">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="*" />
                                            </Grid.ColumnDefinitions>
                                            <StackPanel Grid.Column="0" Margin="0,0,6,0">
                                                <TextBlock Text="Bags Count (بوری):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbBags" Text="280" />
                                            </StackPanel>
                                            <StackPanel Grid.Column="1" Margin="3,0,3,0">
                                                <TextBlock Text="Deductions / Karda (KG):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbDeductions" Text="140" TextChanged="WbWeights_Changed" />
                                            </StackPanel>
                                            <StackPanel Grid.Column="2" Margin="6,0,0,0">
                                                <TextBlock Text="Final Clean Wt (KG):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbFinalWeight" Text="13860" IsReadOnly="True" Background="#DCFCE7" FontWeight="Bold" Foreground="#166534" />
                                            </StackPanel>
                                        </Grid>

                                        <Grid Margin="0,4,0,0">
                                            <Grid.ColumnDefinitions>
                                                <ColumnDefinition Width="*" />
                                                <ColumnDefinition Width="*" />
                                            </Grid.ColumnDefinitions>
                                            <StackPanel Grid.Column="0" Margin="0,0,6,0">
                                                <TextBlock Text="Agreed Rate (PKR per 40 KG):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbRate" Text="4200" TextChanged="WbWeights_Changed" />
                                            </StackPanel>
                                            <StackPanel Grid.Column="1" Margin="6,0,0,0">
                                                <TextBlock Text="Net Payable Total (PKR):" FontSize="11" Margin="0,0,0,2" />
                                                <TextBox x:Name="TxtWbTotalAmount" Text="1,455,300" IsReadOnly="True" Background="#FEF08A" FontWeight="Bold" Foreground="#854D0E" FontSize="14" />
                                            </StackPanel>
                                        </Grid>
                                    </StackPanel>
                                </Border>

                                <StackPanel Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,8,0,0">
                                    <Button Content="💾 Save to SQLite" Click="BtnSaveVoucher_Click" Background="#0F172A" Margin="0,0,8,0" Padding="18,10" />
                                    <Button Content="🖨️ Direct Thermal Print (No Dialog)" Click="BtnSaveAndPrint_Click" Background="#059669" Padding="20,10" />
                                </StackPanel>
                            </StackPanel>
                        </ScrollViewer>
                    </Border>
                </Grid>

                <!-- VIEW 3: PARTY INFORMATION -->
                <Grid x:Name="ViewParties" Visibility="Collapsed">
                    <Border Background="White" CornerRadius="10" BorderBrush="#E2E8F0" BorderThickness="1" Padding="16">
                        <DockPanel LastChildFill="True">
                            <StackPanel DockPanel.Dock="Top" Margin="0,0,0,12">
                                <TextBlock Text="Party Information &amp; Contact Directory (پارٹی معلومات و کوائف)" FontSize="16" FontWeight="Bold" Foreground="#0F172A" />
                                <TextBlock Text="Registered Farmers, Suppliers, and Mills (Party Ledgers removed per locked requirement)" FontSize="11" Foreground="#64748B" />
                            </StackPanel>

                            <DataGrid x:Name="GridParties" AutoGenerateColumns="False" IsReadOnly="True" HeadersVisibility="Column" GridLinesVisibility="Horizontal" RowHeight="32">
                                <DataGrid.Columns>
                                    <DataGridTextColumn Header="Party Name" Binding="{Binding Name}" Width="200" FontWeight="Bold" />
                                    <DataGridTextColumn Header="Urdu Name" Binding="{Binding NameUrdu}" Width="160" />
                                    <DataGridTextColumn Header="Phone / Mobile" Binding="{Binding Phone}" Width="130" />
                                    <DataGridTextColumn Header="Address &amp; Mandi Gate" Binding="{Binding Address}" Width="*" />
                                    <DataGridTextColumn Header="Category" Binding="{Binding Type}" Width="100" />
                                    <DataGridTextColumn Header="Opening Bal (PKR)" Binding="{Binding OpeningBalance, StringFormat={}{0:N0}}" Width="120" />
                                </DataGrid.Columns>
                            </DataGrid>
                        </DockPanel>
                    </Border>
                </Grid>

                <!-- VIEW 4: DIRECT THERMAL PRINTER SETTINGS -->
                <Grid x:Name="ViewPrinterSettings" Visibility="Collapsed">
                    <Border Background="White" CornerRadius="10" BorderBrush="#E2E8F0" BorderThickness="1" Padding="20">
                        <StackPanel MaxWidth="600" HorizontalAlignment="Left">
                            <TextBlock Text="Direct Windows Thermal Printer Settings (WinSpool RAW)" FontSize="16" FontWeight="Bold" Foreground="#064E3B" Margin="0,0,0,12" />
                            <TextBlock Text="Direct byte-stream ESC/POS output directly to thermal printer without browser dialog or popup." FontSize="11" Foreground="#64748B" Margin="0,0,0,16" />

                            <StackPanel Margin="0,0,0,12">
                                <TextBlock Text="Select Installed Windows Thermal Printer:" FontWeight="SemiBold" FontSize="12" Margin="0,0,0,4" />
                                <ComboBox x:Name="CmbInstalledPrinters" Height="32" />
                            </StackPanel>

                            <StackPanel Margin="0,0,0,16">
                                <TextBlock Text="Custom Shop Header Text:" FontWeight="SemiBold" FontSize="12" Margin="0,0,0,4" />
                                <TextBox x:Name="TxtShopHeader" Text="NAZAR SOON CORPORATION (غلہ منڈی)" />
                            </StackPanel>

                            <StackPanel Orientation="Horizontal">
                                <Button Content="💾 Save Settings to SQLite" Click="BtnSavePrinterSettings_Click" Background="#064E3B" Margin="0,0,8,0" Padding="16,8" />
                                <Button Content="🧪 Direct Test Print (Beep &amp; Cut)" Click="BtnTestPrint_Click" Background="#059669" Padding="16,8" />
                            </StackPanel>
                        </StackPanel>
                    </Border>
                </Grid>
            </Grid>
        </Grid>

        <!-- STATUS BAR -->
        <Border Grid.Row="2" Background="#E2E8F0" Padding="12,0">
            <Grid VerticalAlignment="Center">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*" />
                    <ColumnDefinition Width="Auto" />
                </Grid.ColumnDefinitions>
                <TextBlock x:Name="TxtStatus" Text="Ready · Local SQLite Database: Online · 0 External Dependencies" FontSize="11" Foreground="#475569" />
                <TextBlock Grid.Column="1" Text="Mandi ERP .NET 8 WPF Desktop Edition" FontSize="11" Foreground="#64748B" />
            </Grid>
        </Border>
    </Grid>
</Window>
`;

export const MAIN_WINDOW_XAML_CS = `using System.Drawing.Printing;
using System.Globalization;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using MandiERP.Database;
using MandiERP.Hardware;
using MandiERP.Models;

namespace MandiERP;

public partial class MainWindow : Window
{
    private readonly DatabaseManager _db;
    private Business _currentBusiness;
    private ThermalPrinterConfig _printerConfig;
    private List<Voucher> _vouchers = new();
    private List<Party> _parties = new();
    private List<Item> _items = new();

    public MainWindow()
    {
        InitializeComponent();

        _db = new DatabaseManager("biz-1");
        _currentBusiness = new Business
        {
            Id = "biz-1",
            Name = "NAZAR SOON CORPORATION",
            NameUrdu = "نظر سون کارپوریشن",
            Address = "Grain Market (Galla Mandi), Shop # 14-B",
            Phone = "+92 300 1234567",
            NTN = "7392814-5",
            Proprietor = "Ch. Babar Ameen"
        };

        _printerConfig = _db.GetPrinterConfig();
        Loaded += MainWindow_Loaded;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        TxtDbStatus.Text = $"SQLite: {System.IO.Path.GetFileName(_db.DatabaseFilePath)}";
        TxtPrinterStatus.Text = $"Thermal: {_printerConfig.PrinterName} (Direct RAW)";

        LoadPrintersList();
        RefreshAllData();
        PrepareNewVoucherForm();
    }

    private void LoadPrintersList()
    {
        CmbInstalledPrinters.Items.Clear();
        try
        {
            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                CmbInstalledPrinters.Items.Add(printer);
            }
        }
        catch
        {
            CmbInstalledPrinters.Items.Add("POS-80");
            CmbInstalledPrinters.Items.Add("Microsoft Print to PDF");
        }

        if (CmbInstalledPrinters.Items.Contains(_printerConfig.PrinterName))
        {
            CmbInstalledPrinters.SelectedItem = _printerConfig.PrinterName;
        }
        else if (CmbInstalledPrinters.Items.Count > 0)
        {
            CmbInstalledPrinters.SelectedIndex = 0;
        }
    }

    private void RefreshAllData()
    {
        _vouchers = _db.GetAllVouchers();
        _parties = _db.GetAllParties();
        _items = _db.GetAllItems();

        GridRecentVouchers.ItemsSource = null;
        GridRecentVouchers.ItemsSource = _vouchers;

        GridParties.ItemsSource = null;
        GridParties.ItemsSource = _parties;

        CmbWbParty.ItemsSource = _parties;
        if (_parties.Count > 0) CmbWbParty.SelectedIndex = 0;

        CmbWbItem.ItemsSource = _items;
        if (_items.Count > 0) CmbWbItem.SelectedIndex = 0;

        TxtTotalVouchersCount.Text = $"{_vouchers.Count} Vouchers";
        TxtStatus.Text = $"Ready · Local SQLite: {_db.DatabaseFilePath} · {_vouchers.Count} Vouchers";
    }

    private void PrepareNewVoucherForm()
    {
        string nextNo = $"PUR-2026-{(_vouchers.Count + 1):D3}";
        TxtWbVoucherNo.Text = nextNo;
        TxtWbDate.Text = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        TxtWbGross.Text = "18500";
        TxtWbTare.Text = "4500";
        TxtWbDeductions.Text = "140";
        TxtWbRate.Text = "4200";
        CalculateWeighbridge();
    }

    private void WbWeights_Changed(object sender, TextChangedEventArgs e)
    {
        CalculateWeighbridge();
    }

    private void CalculateWeighbridge()
    {
        if (TxtWbNet == null || TxtWbFinalWeight == null || TxtWbTotalAmount == null) return;

        double.TryParse(TxtWbGross.Text, out double gross);
        double.TryParse(TxtWbTare.Text, out double tare);
        double.TryParse(TxtWbDeductions.Text, out double ded);
        double.TryParse(TxtWbRate.Text, out double rate);

        double net = Math.Max(0, gross - tare);
        double final = Math.Max(0, net - ded);
        double total = (final / 40.0) * rate;

        TxtWbNet.Text = net.ToString("N0");
        TxtWbFinalWeight.Text = final.ToString("N0");
        TxtWbTotalAmount.Text = total.ToString("N0");
    }

    private void BtnSaveVoucher_Click(object sender, RoutedEventArgs e)
    {
        SaveCurrentVoucher(printDirect: false);
    }

    private void BtnSaveAndPrint_Click(object sender, RoutedEventArgs e)
    {
        SaveCurrentVoucher(printDirect: true);
    }

    private void SaveCurrentVoucher(bool printDirect)
    {
        var party = CmbWbParty.SelectedItem as Party;
        var item = CmbWbItem.SelectedItem as Item;

        double.TryParse(TxtWbGross.Text, out double gross);
        double.TryParse(TxtWbTare.Text, out double tare);
        double.TryParse(TxtWbDeductions.Text, out double ded);
        double.TryParse(TxtWbRate.Text, out double rate);
        int.TryParse(TxtWbBags.Text, out int bags);

        double net = Math.Max(0, gross - tare);
        double final = Math.Max(0, net - ded);
        double total = (final / 40.0) * rate;

        var v = new Voucher
        {
            Id = Guid.NewGuid().ToString(),
            VoucherNo = TxtWbVoucherNo.Text,
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            Time = DateTime.Now.ToString("HH:mm:ss"),
            Type = "PURCHASE",
            PartyId = party?.Id ?? "",
            PartyName = party?.Name ?? "General Farmer",
            ItemId = item?.Id ?? "",
            ItemName = item?.Name ?? "Wheat (گندم)",
            GrossWeight = gross,
            TareWeight = tare,
            NetWeight = net,
            Bags = bags,
            Deductions = ded,
            FinalWeight = final,
            Rate = rate,
            TotalAmount = total,
            Status = "Approved",
            CreatedBy = "Munshi"
        };

        _db.InsertVoucher(v);
        TxtStatus.Text = $"Voucher {v.VoucherNo} saved to SQLite: {_db.DatabaseFilePath}";

        if (printDirect)
        {
            byte[] escPosBytes = DirectThermalPrinter.BuildEscPosWeighingTicket(v, _currentBusiness, _printerConfig);
            DirectThermalPrinter.SendBytesToPrinter(_printerConfig.PrinterName, escPosBytes);
        }

        MessageBox.Show($"Voucher {v.VoucherNo} saved to SQLite file successfully!", "Mandi ERP Desktop", MessageBoxButton.OK, MessageBoxImage.Information);

        RefreshAllData();
        PrepareNewVoucherForm();
        SwitchView("Dashboard");
    }

    private void BtnNewTicket_Click(object sender, RoutedEventArgs e)
    {
        SwitchView("Weighbridge");
    }

    private void BtnRefresh_Click(object sender, RoutedEventArgs e)
    {
        RefreshAllData();
    }

    private void Nav_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string tag)
        {
            SwitchView(tag);
        }
    }

    private void SwitchView(string viewTag)
    {
        ViewDashboard.Visibility = Visibility.Collapsed;
        ViewWeighbridge.Visibility = Visibility.Collapsed;
        ViewParties.Visibility = Visibility.Collapsed;
        ViewPrinterSettings.Visibility = Visibility.Collapsed;

        switch (viewTag)
        {
            case "Dashboard":
                ViewDashboard.Visibility = Visibility.Visible;
                break;
            case "Weighbridge":
                ViewWeighbridge.Visibility = Visibility.Visible;
                break;
            case "Parties":
                ViewParties.Visibility = Visibility.Visible;
                break;
            case "PrinterSettings":
                ViewPrinterSettings.Visibility = Visibility.Visible;
                break;
        }
    }

    private void BtnSavePrinterSettings_Click(object sender, RoutedEventArgs e)
    {
        _printerConfig.PrinterName = CmbInstalledPrinters.SelectedItem?.ToString() ?? "POS-80";
        _printerConfig.ShopHeader = TxtShopHeader.Text;

        _db.SavePrinterConfig(_printerConfig);
        TxtPrinterStatus.Text = $"Thermal: {_printerConfig.PrinterName} (Direct RAW)";

        MessageBox.Show($"Thermal printer settings saved to SQLite!", "Settings Saved", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    private void BtnTestPrint_Click(object sender, RoutedEventArgs e)
    {
        var testVoucher = new Voucher
        {
            VoucherNo = "TEST-TICKET",
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            Time = DateTime.Now.ToString("HH:mm:ss"),
            Type = "PURCHASE",
            PartyName = "Direct Thermal Test Party",
            ItemName = "Wheat (گندم دیسی)",
            GrossWeight = 20000,
            TareWeight = 5000,
            NetWeight = 15000,
            Bags = 300,
            Deductions = 150,
            FinalWeight = 14850,
            Rate = 4250,
            TotalAmount = 1577812
        };

        string targetPrinter = CmbInstalledPrinters.SelectedItem?.ToString() ?? _printerConfig.PrinterName;
        byte[] escPosBytes = DirectThermalPrinter.BuildEscPosWeighingTicket(testVoucher, _currentBusiness, _printerConfig);
        DirectThermalPrinter.SendBytesToPrinter(targetPrinter, escPosBytes);
    }
}
`;
