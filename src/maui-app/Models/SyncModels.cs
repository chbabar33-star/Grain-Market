using SQLite;

namespace GrainMarket.Models;

/// <summary>
/// Base class for all syncable entities.
/// Strictly enforces: Id, CreatedAt, UpdatedAt, IsSynced, DeviceId, IsDeleted
/// </summary>
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
    public string Role { get; set; } = "Munshi"; // Admin, Manager, Operator / Munshi
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
    public double DefaultRate { get; set; } = 4200.0; // PKR per 40KG (Maund)
    public double DefaultCommissionRate { get; set; } = 1.5; // %
    public double DefaultExpensePerBag { get; set; } = 15.0; // PKR
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
    public string Type { get; set; } = "Supplier"; // Supplier, Customer, Both
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

    // Weight System (Gross - Tare = First Weight)
    public double GrossWeight { get; set; }
    public double TareWeight { get; set; }
    public double FirstWeight { get; set; } // Costing basis

    public int Bags { get; set; }
    public double Deductions { get; set; } // Karda, moisture, dirt KG
    public double NetWeight { get; set; } // FirstWeight - Deductions

    // Pricing (Rate per 40KG / Maund)
    public double RatePer40Kg { get; set; }
    public double BaseAmount { get; set; } // (FirstWeight / 40.0) * RatePer40Kg
    public double ExpensesAmount { get; set; }
    public double TotalAmount { get; set; } // BaseAmount + ExpensesAmount

    // Approval Workflow: Pending -> Approved / Cancelled
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
    public string ExpenseType { get; set; } = "Direct"; // Direct vs Indirect
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
    public string Action { get; set; } = "UPSERT"; // UPSERT or DELETE
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
    public string Role { get; set; } = "DesktopMaster"; // "DesktopMaster" or "MobileSlave"
    public string DeviceId { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public string DeviceName { get; set; } = DeviceInfo.Current.Name ?? "Terminal";
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
