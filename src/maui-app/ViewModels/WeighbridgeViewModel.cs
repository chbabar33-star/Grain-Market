using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GrainMarket.Models;
using GrainMarket.Services;

namespace GrainMarket.ViewModels;

public partial class WeighbridgeViewModel : ObservableObject
{
    private readonly DatabaseService _db;
    private readonly PrinterService _printer;
    private readonly PairingService _pairing;

    [ObservableProperty]
    private string voucherNo = "PUR-2026-001";

    [ObservableProperty]
    private string vehicleNo = "FDZ-8291";

    [ObservableProperty]
    private double grossWeight = 18500;

    [ObservableProperty]
    private double tareWeight = 4500;

    [ObservableProperty]
    private double firstWeight = 14000;

    [ObservableProperty]
    private int bags = 280;

    [ObservableProperty]
    private double deductions = 140;

    [ObservableProperty]
    private double netWeight = 13860;

    [ObservableProperty]
    private double ratePer40Kg = 4250;

    [ObservableProperty]
    private double totalAmount = 1487500;

    [ObservableProperty]
    private Party? selectedParty;

    [ObservableProperty]
    private Item? selectedItem;

    [ObservableProperty]
    private Godown? selectedGodown;

    public ObservableCollection<Party> Parties { get; } = new();
    public ObservableCollection<Item> Items { get; } = new();
    public ObservableCollection<Godown> Godowns { get; } = new();

    public WeighbridgeViewModel(DatabaseService db, PrinterService printer, PairingService pairing)
    {
        _db = db;
        _printer = printer;
        _pairing = pairing;

        _ = LoadLookupsAsync();
    }

    private async Task LoadLookupsAsync()
    {
        var parties = await _db.GetPartiesAsync();
        var items = await _db.GetItemsAsync();
        var godowns = await _db.GetGodownsAsync();
        var purchases = await _db.GetPurchasesAsync();

        VoucherNo = $"PUR-2026-{(purchases.Count + 1):D3}";

        Parties.Clear();
        foreach (var p in parties) Parties.Add(p);
        SelectedParty = Parties.FirstOrDefault();

        Items.Clear();
        foreach (var itm in items) Items.Add(itm);
        SelectedItem = Items.FirstOrDefault();

        Godowns.Clear();
        foreach (var g in godowns) Godowns.Add(g);
        SelectedGodown = Godowns.FirstOrDefault();

        CalculateWeights();
    }

    partial void OnGrossWeightChanged(double value) => CalculateWeights();
    partial void OnTareWeightChanged(double value) => CalculateWeights();
    partial void OnDeductionsChanged(double value) => CalculateWeights();
    partial void OnRatePer40KgChanged(double value) => CalculateWeights();

    private void CalculateWeights()
    {
        FirstWeight = Math.Max(0, GrossWeight - TareWeight);
        NetWeight = Math.Max(0, FirstWeight - Deductions);
        TotalAmount = Math.Round((FirstWeight / 40.0) * RatePer40Kg);
    }

    [RelayCommand]
    public async Task SaveAsync()
    {
        var p = new Purchase
        {
            BusinessId = _db.CurrentBusinessId,
            VoucherNo = VoucherNo,
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            Time = DateTime.Now.ToString("HH:mm:ss"),
            PartyId = SelectedParty?.Id ?? "",
            PartyName = SelectedParty?.Name ?? "General Farmer",
            ItemId = SelectedItem?.Id ?? "",
            ItemName = SelectedItem?.Name ?? "Wheat (گندم)",
            GodownId = SelectedGodown?.Id ?? "",
            GodownName = SelectedGodown?.Name ?? "Yard 1",
            VehicleNo = VehicleNo,
            GrossWeight = GrossWeight,
            TareWeight = TareWeight,
            FirstWeight = FirstWeight,
            Bags = Bags,
            Deductions = Deductions,
            NetWeight = NetWeight,
            RatePer40Kg = RatePer40Kg,
            BaseAmount = TotalAmount,
            TotalAmount = TotalAmount,
            Status = "Pending",
            CreatedBy = "Munshi"
        };

        var deviceId = _pairing.GetPairingInfo().DeviceId;
        await _db.SavePurchaseAsync(p, deviceId);

        // Toast feedback
        if (Application.Current?.MainPage != null)
        {
            await Application.Current.MainPage.DisplayAlert("Weighbridge Saved", $"Voucher {p.VoucherNo} saved to SQLite.\nAdded to sync queue for auto-sync.", "OK");
        }

        // Reset for next ticket
        await LoadLookupsAsync();
    }

    [RelayCommand]
    public async Task SaveAndPrintAsync()
    {
        await SaveAsync();
    }
}
