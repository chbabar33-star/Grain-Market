using System.IO;
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
        
        // Also support portable local directory next to the .exe
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

            CREATE TABLE IF NOT EXISTS MonthClosings (
                Id TEXT PRIMARY KEY,
                MonthKey TEXT UNIQUE NOT NULL,
                MonthName TEXT,
                ClosedAt TEXT,
                ClosedBy TEXT,
                Notes TEXT,
                TotalPurchaseAmount REAL,
                TotalSalesAmount REAL,
                NetProfitLoss REAL,
                TotalVouchersCount INTEGER,
                IsUnlocked INTEGER
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
            VALUES ('biz-1', 'NAZAR SOON CORPORATION', 'نظر سون کارپوریشن', 'Grain Market (Galla Mandi), Shop # 14-B, Sargodha Road', 'غلہ منڈی، دکان نمبر ۱۴-بی، سرگودھا روڈ', '+92 300 1234567', 'Ch. Babar Ameen', 'چوہدری بابر امین', '7392814-5', 'NSC', 1);

            INSERT INTO Users (Id, Name, Role, Pin, Email)
            VALUES 
            ('usr-1', 'Ch. Babar Ameen', 'Owner', '1122', 'owner@mandi.pk'),
            ('usr-2', 'Munshi Aslam', 'Munshi', '1234', 'aslam@mandi.pk'),
            ('usr-3', 'Muhammad Bilal', 'Weighbridge Operator', '5566', 'kanta@mandi.pk');

            INSERT INTO Items (Id, Name, NameUrdu, Code, BagWeightKg, DefaultCommissionRate, DefaultExpensePerBag)
            VALUES
            ('itm-1', 'Wheat (گندم)', 'گندم دیسی سپریم', 'WHT-01', 100.0, 1.5, 15.0),
            ('itm-2', 'Basmati Rice (باسمتی چاول)', 'سپر باسمتی چاول', 'RCE-01', 50.0, 1.5, 12.0),
            ('itm-3', 'Corn / Maize (مکئی)', 'مکئی پیلی ہائبرڈ', 'MAZ-01', 80.0, 1.5, 14.0),
            ('itm-4', 'Mustard / Sarson (سرسوں)', 'سرسوں رایا', 'CAN-01', 40.0, 2.0, 10.0),
            ('itm-5', 'Paddy / Dhaan (دھان)', 'دھان ۱۵۰۹ کائنات', 'PAD-01', 50.0, 1.5, 12.0);

            INSERT INTO Parties (Id, Name, NameUrdu, Phone, Address, Type, OpeningBalance, Status)
            VALUES
            ('pty-1', 'Ch. Tariq Gujjar', 'چوہدری طارق گجر', '0300-8765432', 'Chak 42-SB, Sargodha', 'Supplier', 0, 'Active'),
            ('pty-2', 'Mian Zahid Farooq', 'میاں زاہد فاروق', '0301-2345678', 'Mouza Kot Momin', 'Supplier', 0, 'Active'),
            ('pty-3', 'Al-Rahman Flour Mills Ltd', 'الرحمٰن فلور ملز', '0321-9876543', 'Industrial Area, Faisalabad', 'Customer', 0, 'Active'),
            ('pty-4', 'Madina Rice & Processing Mills', 'مدینہ رائس ملز', '0302-3456789', 'G.T. Road, Gujranwala', 'Customer', 0, 'Active'),
            ('pty-5', 'Haji Bashir Beopari', 'حاجی بشیر بیوپاری', '0303-4567890', 'Galla Mandi Bhalwal', 'Both', 0, 'Active');

            INSERT INTO Godowns (Id, Name, Location, CapacityBags)
            VALUES
            ('gdn-1', 'Main Market Yard (Galla Mandi Pharr)', 'Front Yard', 10000),
            ('gdn-2', 'Godown # 1 (Station Road)', 'Plot 4, Rail Road', 6000),
            ('gdn-3', 'Godown # 2 (Bypass Shed)', 'Sargodha Bypass', 8000);

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
