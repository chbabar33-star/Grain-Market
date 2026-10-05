using System.Text.Json;
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
        SeedDefaultsIfEmptyAsync().Wait();
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

    private async Task SeedDefaultsIfEmptyAsync()
    {
        if (_db == null) return;
        var bizCount = await _db.Table<Business>().CountAsync();
        if (bizCount > 0) return;

        var defaultBiz = new Business
        {
            Id = CurrentBusinessId,
            Name = "NAZAR SOON CORPORATION",
            NameUrdu = "نظر سون کارپوریشن",
            Address = "Grain Market (Galla Mandi), Shop # 14-B",
            AddressUrdu = "غلہ منڈی سرگودھا",
            Phone = "+92 300 1234567",
            Proprietor = "Ch. Babar Ameen",
            ProprietorUrdu = "چوہدری بابر امین",
            NTN = "7392814-5",
            IsDefault = true,
            IsSynced = true
        };
        await _db.InsertAsync(defaultBiz);

        // Seed Users
        await _db.InsertAllAsync(new[]
        {
            new User { Id = "usr-1", BusinessId = CurrentBusinessId, Name = "Ch. Babar Ameen", Role = "Admin", Pin = "1122", Email = "owner@mandi.pk", IsSynced = true },
            new User { Id = "usr-2", BusinessId = CurrentBusinessId, Name = "Munshi Aslam", Role = "Operator", Pin = "1234", Email = "munshi@mandi.pk", IsSynced = true },
            new User { Id = "usr-3", BusinessId = CurrentBusinessId, Name = "Kanta Weighmaster", Role = "Operator", Pin = "5566", Email = "kanta@mandi.pk", IsSynced = true }
        });

        // Seed Items (Mandi commodities)
        await _db.InsertAllAsync(new[]
        {
            new Item { Id = "itm-1", BusinessId = CurrentBusinessId, Name = "Wheat (گندم)", NameUrdu = "گندم دیسی سپریم", Code = "WHT-01", BagWeightKg = 100, DefaultRate = 4250, DefaultCommissionRate = 1.5, DefaultExpensePerBag = 15, IsSynced = true },
            new Item { Id = "itm-2", BusinessId = CurrentBusinessId, Name = "Basmati Rice (باسمتی چاول)", NameUrdu = "سپر باسمتی چاول", Code = "RCE-01", BagWeightKg = 50, DefaultRate = 7800, DefaultCommissionRate = 1.5, DefaultExpensePerBag = 12, IsSynced = true },
            new Item { Id = "itm-3", BusinessId = CurrentBusinessId, Name = "Corn / Maize (مکئی)", NameUrdu = "مکئی پیلی ہائبرڈ", Code = "MAZ-01", BagWeightKg = 80, DefaultRate = 3100, DefaultCommissionRate = 1.5, DefaultExpensePerBag = 14, IsSynced = true },
            new Item { Id = "itm-4", BusinessId = CurrentBusinessId, Name = "Mustard / Sarson (سرسوں)", NameUrdu = "سرسوں رایا", Code = "CAN-01", BagWeightKg = 40, DefaultRate = 8500, DefaultCommissionRate = 2.0, DefaultExpensePerBag = 10, IsSynced = true }
        });

        // Seed Parties (Contact & Directory - no ledgers)
        await _db.InsertAllAsync(new[]
        {
            new Party { Id = "pty-1", BusinessId = CurrentBusinessId, Name = "Ch. Tariq Gujjar", NameUrdu = "چوہدری طارق گجر", Phone = "0300-8765432", Address = "Chak 42-SB, Sargodha", Type = "Supplier", OpeningBalance = 0, Status = "Active", IsSynced = true },
            new Party { Id = "pty-2", BusinessId = CurrentBusinessId, Name = "Mian Zahid Farooq", NameUrdu = "میاں زاہد فاروق", Phone = "0301-2345678", Address = "Mouza Kot Momin", Type = "Supplier", OpeningBalance = 0, Status = "Active", IsSynced = true },
            new Party { Id = "pty-3", BusinessId = CurrentBusinessId, Name = "Al-Rahman Flour Mills Ltd", NameUrdu = "الرحمٰن فلور ملز", Phone = "0321-9876543", Address = "Industrial Area, Faisalabad", Type = "Customer", OpeningBalance = 0, Status = "Active", IsSynced = true },
            new Party { Id = "pty-4", BusinessId = CurrentBusinessId, Name = "Madina Rice Mills", NameUrdu = "مدینہ رائس ملز", Phone = "0302-3456789", Address = "G.T. Road, Gujranwala", Type = "Customer", OpeningBalance = 0, Status = "Active", IsSynced = true }
        });

        // Seed Godowns
        await _db.InsertAllAsync(new[]
        {
            new Godown { Id = "gdn-1", BusinessId = CurrentBusinessId, Name = "Main Market Yard (Galla Mandi Pharr)", Location = "Shop Front", CapacityBags = 10000, IsSynced = true },
            new Godown { Id = "gdn-2", BusinessId = CurrentBusinessId, Name = "Godown # 1 (Station Road)", Location = "Plot 4, Rail Road", CapacityBags = 6000, IsSynced = true }
        });
    }

    #region CRUD with Automatic SyncQueue Ingestion

    public async Task<int> SavePurchaseAsync(Purchase p, string deviceId)
    {
        if (_db == null) return 0;
        p.UpdatedAt = DateTime.UtcNow;
        p.IsSynced = false;
        p.DeviceId = deviceId;

        int rows = await _db.InsertOrReplaceAsync(p);

        // Add to SyncQueue for Auto-Sync
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

    public async Task<int> SavePartyAsync(Party p, string deviceId)
    {
        if (_db == null) return 0;
        p.UpdatedAt = DateTime.UtcNow;
        p.IsSynced = false;
        p.DeviceId = deviceId;

        int rows = await _db.InsertOrReplaceAsync(p);
        await QueueSyncItemAsync("Parties", p.Id, "UPSERT", p);

        DataChanged?.Invoke();
        return rows;
    }

    public async Task<int> SaveItemAsync(Item itm, string deviceId)
    {
        if (_db == null) return 0;
        itm.UpdatedAt = DateTime.UtcNow;
        itm.IsSynced = false;
        itm.DeviceId = deviceId;

        int rows = await _db.InsertOrReplaceAsync(itm);
        await QueueSyncItemAsync("Items", itm.Id, "UPSERT", itm);

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

    #endregion

    #region Query Methods

    public async Task<List<Purchase>> GetPurchasesAsync() =>
        _db == null ? new() : await _db.Table<Purchase>().Where(x => !x.IsDeleted).OrderByDescending(x => x.Date).ThenByDescending(x => x.Time).ToListAsync();

    public async Task<List<Sale>> GetSalesAsync() =>
        _db == null ? new() : await _db.Table<Sale>().Where(x => !x.IsDeleted).OrderByDescending(x => x.Date).ThenByDescending(x => x.Time).ToListAsync();

    public async Task<List<Party>> GetPartiesAsync() =>
        _db == null ? new() : await _db.Table<Party>().Where(x => !x.IsDeleted).OrderBy(x => x.Name).ToListAsync();

    public async Task<List<Item>> GetItemsAsync() =>
        _db == null ? new() : await _db.Table<Item>().Where(x => !x.IsDeleted).OrderBy(x => x.Name).ToListAsync();

    public async Task<List<Godown>> GetGodownsAsync() =>
        _db == null ? new() : await _db.Table<Godown>().Where(x => !x.IsDeleted).OrderBy(x => x.Name).ToListAsync();

    public async Task<List<SyncQueueItem>> GetPendingSyncQueueAsync() =>
        _db == null ? new() : await _db.Table<SyncQueueItem>().OrderBy(x => x.QueueId).ToListAsync();

    public async Task<int> GetUnsyncedCountAsync()
    {
        if (_db == null) return 0;
        int p = await _db.Table<Purchase>().Where(x => !x.IsSynced).CountAsync();
        int s = await _db.Table<Sale>().Where(x => !x.IsSynced).CountAsync();
        int parties = await _db.Table<Party>().Where(x => !x.IsSynced).CountAsync();
        int items = await _db.Table<Item>().Where(x => !x.IsSynced).CountAsync();
        return p + s + parties + items;
    }

    public async Task RemoveSyncQueueItemAsync(int queueId)
    {
        if (_db == null) return;
        await _db.DeleteAsync<SyncQueueItem>(queueId);
    }

    public async Task MarkRecordSyncedAsync(string tableName, string recordId)
    {
        if (_db == null) return;
        switch (tableName)
        {
            case "Purchases":
                await _db.ExecuteAsync("UPDATE Purchases SET IsSynced = 1 WHERE Id = ?", recordId);
                break;
            case "Sales":
                await _db.ExecuteAsync("UPDATE Sales SET IsSynced = 1 WHERE Id = ?", recordId);
                break;
            case "Parties":
                await _db.ExecuteAsync("UPDATE Parties SET IsSynced = 1 WHERE Id = ?", recordId);
                break;
            case "Items":
                await _db.ExecuteAsync("UPDATE Items SET IsSynced = 1 WHERE Id = ?", recordId);
                break;
        }
    }

    #endregion

    #region Stock & Average Recalculations

    public async Task RecalculateItemStockAsync(string itemId)
    {
        if (_db == null || string.IsNullOrEmpty(itemId)) return;

        var purchases = await _db.Table<Purchase>()
            .Where(x => x.ItemId == itemId && x.Status == "Approved" && !x.IsDeleted)
            .ToListAsync();

        var sales = await _db.Table<Sale>()
            .Where(x => x.ItemId == itemId && x.Status == "Approved" && !x.IsDeleted)
            .ToListAsync();

        double totalPurchasedWeight = purchases.Sum(x => x.FirstWeight);
        int totalPurchasedBags = purchases.Sum(x => x.Bags);
        double totalPurchaseAmount = purchases.Sum(x => x.TotalAmount);

        double totalSoldWeight = sales.Sum(x => x.FirstWeight);
        int totalSoldBags = sales.Sum(x => x.Bags);

        double closingWeight = Math.Max(0, totalPurchasedWeight - totalSoldWeight);
        int closingBags = Math.Max(0, totalPurchasedBags - totalSoldBags);

        // Weighted Average per 40KG (Maund)
        double weightedAvgRate = totalPurchasedWeight > 0
            ? (totalPurchaseAmount / totalPurchasedWeight) * 40.0
            : 0;

        var itm = await _db.Table<Item>().FirstOrDefaultAsync(x => x.Id == itemId);
        if (itm != null)
        {
            itm.ClosingFirstWeight = closingWeight;
            itm.ClosingBags = closingBags;
            itm.WeightedAverageRate = weightedAvgRate;
            await _db.UpdateAsync(itm);
        }
    }

    #endregion
}
