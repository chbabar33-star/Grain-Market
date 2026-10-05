namespace MandiERP.Models;

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

public class MonthClosingRecord
{
    public string Id { get; set; } = string.Empty;
    public string MonthKey { get; set; } = string.Empty; // "2026-09"
    public string MonthName { get; set; } = string.Empty; // "September 2026"
    public string ClosedAt { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
    public string ClosedBy { get; set; } = "Ch. Babar Ameen";
    public string Notes { get; set; } = string.Empty;
    public double TotalPurchaseAmount { get; set; }
    public double TotalSalesAmount { get; set; }
    public double NetProfitLoss { get; set; }
    public int TotalVouchersCount { get; set; }
    public bool IsUnlocked { get; set; }
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
