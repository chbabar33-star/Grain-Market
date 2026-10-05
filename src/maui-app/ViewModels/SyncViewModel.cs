using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GrainMarket.Models;
using GrainMarket.Services;

namespace GrainMarket.ViewModels;

public partial class SyncViewModel : ObservableObject
{
    private readonly DatabaseService _db;
    private readonly SyncService _sync;
    private readonly PairingService _pairing;

    [ObservableProperty]
    private string deviceRole = "Desktop Master";

    [ObservableProperty]
    private string deviceId = "";

    [ObservableProperty]
    private string syncKey = "";

    [ObservableProperty]
    private string pairingQrPayload = "";

    [ObservableProperty]
    private string syncStatusText = "🟢 Online - Synced";

    [ObservableProperty]
    private bool isSyncing = false;

    public ObservableCollection<SyncQueueItem> PendingQueue { get; } = new();

    public SyncViewModel(DatabaseService db, SyncService sync, PairingService pairing)
    {
        _db = db;
        _sync = sync;
        _pairing = pairing;

        var info = _pairing.GetPairingInfo();
        DeviceRole = info.Role;
        DeviceId = info.DeviceId;
        SyncKey = info.SyncKey;
        PairingQrPayload = _pairing.GeneratePairingPayload();

        _sync.SyncStatusChanged += s =>
        {
            SyncStatusText = s.StatusMessage;
            IsSyncing = s.State == SyncConnectionState.OnlineSyncing;
            _ = RefreshQueueAsync();
        };

        _ = RefreshQueueAsync();
    }

    [RelayCommand]
    public async Task TriggerSyncAsync()
    {
        IsSyncing = true;
        await _sync.SyncAsync(isManual: true);
        await RefreshQueueAsync();
        IsSyncing = false;
    }

    public async Task RefreshQueueAsync()
    {
        var list = await _db.GetPendingSyncQueueAsync();
        MainThread.BeginInvokeOnMainThread(() =>
        {
            PendingQueue.Clear();
            foreach (var q in list) PendingQueue.Add(q);
        });
    }

    [RelayCommand]
    public async Task PairMobileWithQrAsync(string scannedPayload)
    {
        bool success = _pairing.PairMobileFromQrPayload(scannedPayload);
        if (success)
        {
            var info = _pairing.GetPairingInfo();
            DeviceRole = info.Role;
            SyncKey = info.SyncKey;
            _db.InitializeForBusiness(info.BusinessId, info.BusinessName);
            await _sync.SyncAsync(isManual: true);
        }
    }
}
