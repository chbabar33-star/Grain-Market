using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GrainMarket.Models;
using GrainMarket.Services;

namespace GrainMarket.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly DatabaseService _db;
    private readonly SyncService _sync;
    private readonly PairingService _pairing;

    [ObservableProperty]
    private string connectionBadgeText = "🔴 Offline - Saved locally";

    [ObservableProperty]
    private Color connectionBadgeColor = Colors.DarkRed;

    [ObservableProperty]
    private string businessName = "NAZAR SOON CORPORATION";

    [ObservableProperty]
    private string activeDeviceRole = "Desktop Master";

    [ObservableProperty]
    private string todayPurchaseTotal = "PKR 0";

    [ObservableProperty]
    private string todayPurchaseWeight = "0 KG · 0 Bags";

    [ObservableProperty]
    private string totalVouchersCount = "0 Vouchers";

    [ObservableProperty]
    private int unsyncedCount = 0;

    [ObservableProperty]
    private bool isSyncing = false;

    public ObservableCollection<Purchase> RecentPurchases { get; } = new();

    public MainViewModel(DatabaseService db, SyncService sync, PairingService pairing)
    {
        _db = db;
        _sync = sync;
        _pairing = pairing;

        var info = _pairing.GetPairingInfo();
        BusinessName = info.BusinessName;
        ActiveDeviceRole = info.Role == "DesktopMaster" ? "Desktop Master (Shop)" : "Mobile Slave (Munshi)";

        _sync.SyncStatusChanged += OnSyncStatusChanged;
        _db.DataChanged += async () => await LoadDashboardDataAsync();

        _ = LoadDashboardDataAsync();
    }

    private void OnSyncStatusChanged(SyncStatusSnapshot status)
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            ConnectionBadgeText = status.StatusMessage;
            UnsyncedCount = status.UnsyncedRecordsCount;

            switch (status.State)
            {
                case SyncConnectionState.OnlineSynced:
                    ConnectionBadgeColor = Colors.ForestGreen;
                    IsSyncing = false;
                    break;
                case SyncConnectionState.OnlineSyncing:
                    ConnectionBadgeColor = Colors.Goldenrod;
                    IsSyncing = true;
                    break;
                case SyncConnectionState.OfflineLocal:
                default:
                    ConnectionBadgeColor = Colors.Crimson;
                    IsSyncing = false;
                    break;
            }
        });
    }

    [RelayCommand]
    public async Task ManualSyncAsync()
    {
        IsSyncing = true;
        await _sync.SyncAsync(isManual: true);
        await LoadDashboardDataAsync();
        IsSyncing = false;
    }

    public async Task LoadDashboardDataAsync()
    {
        var purchases = await _db.GetPurchasesAsync();
        UnsyncedCount = await _db.GetUnsyncedCountAsync();

        string today = DateTime.Now.ToString("yyyy-MM-dd");
        double todayAmount = purchases.Where(x => x.Date == today).Sum(x => x.TotalAmount);
        double todayWeight = purchases.Where(x => x.Date == today).Sum(x => x.FirstWeight);
        int todayBags = purchases.Where(x => x.Date == today).Sum(x => x.Bags);

        MainThread.BeginInvokeOnMainThread(() =>
        {
            TodayPurchaseTotal = $"PKR {todayAmount:N0}";
            TodayPurchaseWeight = $"{todayWeight:N0} KG · {todayBags} Bags";
            TotalVouchersCount = $"{purchases.Count} Vouchers";

            RecentPurchases.Clear();
            foreach (var p in purchases.Take(15))
            {
                RecentPurchases.Add(p);
            }
        });
    }
}
