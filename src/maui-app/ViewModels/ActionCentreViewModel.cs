using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GrainMarket.Models;
using GrainMarket.Services;

namespace GrainMarket.ViewModels;

public partial class ActionCentreViewModel : ObservableObject
{
    private readonly DatabaseService _db;
    private readonly PrinterService _printer;
    private readonly PairingService _pairing;

    public ObservableCollection<Purchase> PendingPurchases { get; } = new();
    public ObservableCollection<Purchase> ApprovedPurchases { get; } = new();

    public ActionCentreViewModel(DatabaseService db, PrinterService printer, PairingService pairing)
    {
        _db = db;
        _printer = printer;
        _pairing = pairing;

        _ = LoadVouchersAsync();
        _db.DataChanged += async () => await LoadVouchersAsync();
    }

    public async Task LoadVouchersAsync()
    {
        var all = await _db.GetPurchasesAsync();
        PendingPurchases.Clear();
        ApprovedPurchases.Clear();

        foreach (var p in all)
        {
            if (p.Status == "Pending") PendingPurchases.Add(p);
            else ApprovedPurchases.Add(p);
        }
    }

    [RelayCommand]
    public async Task ApproveAsync(Purchase p)
    {
        if (p == null) return;
        var deviceId = _pairing.GetPairingInfo().DeviceId;
        await _db.ApprovePurchaseAsync(p.Id, "Ch. Babar Ameen (Owner)", deviceId);
        await LoadVouchersAsync();
    }

    [RelayCommand]
    public async Task DirectPrintAsync(Purchase p)
    {
        if (p == null) return;
        await _printer.PrintWeighingTicketAsync(p);
    }

    [RelayCommand]
    public async Task ShareWhatsAppAsync(Purchase p)
    {
        if (p == null) return;
        await _printer.ShareTicketPdfViaWhatsAppAsync(p, p.DriverPhone);
    }
}
