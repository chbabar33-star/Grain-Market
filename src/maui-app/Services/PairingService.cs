using System.Text.Json;
using GrainMarket.Models;

namespace GrainMarket.Services;

public class PairingService
{
    private DevicePairingInfo _pairingInfo;

    public PairingService()
    {
        _pairingInfo = LoadPairing() ?? new DevicePairingInfo
        {
            BusinessId = "biz-1",
            BusinessName = "NAZAR SOON CORPORATION",
            SyncKey = "MANDI-SYNC-" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            Role = DeviceInfo.Current.Platform == DevicePlatform.WinUI ? "DesktopMaster" : "MobileSlave",
            DeviceId = Guid.NewGuid().ToString("N")[..8],
            DeviceName = DeviceInfo.Current.Name ?? (DeviceInfo.Current.Platform == DevicePlatform.WinUI ? "Shop-Desktop" : "Munshi-Phone"),
            MaxMobilesAllowed = 3
        };
        SavePairing(_pairingInfo);
    }

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
                _pairingInfo.BusinessName = root.TryGetProperty("BusinessName", out var bName) ? bName.GetString() ?? "Mandi Business" : "Mandi Business";
                _pairingInfo.Role = "MobileSlave";
                _pairingInfo.PairedAt = DateTime.UtcNow;

                SavePairing(_pairingInfo);
                return true;
            }
        }
        catch { }
        return false;
    }

    private DevicePairingInfo? LoadPairing()
    {
        string path = Path.Combine(FileSystem.AppDataDirectory, "pairing_info.json");
        if (File.Exists(path))
        {
            try
            {
                string json = File.ReadAllText(path);
                return JsonSerializer.Deserialize<DevicePairingInfo>(json);
            }
            catch { }
        }
        return null;
    }

    private void SavePairing(DevicePairingInfo info)
    {
        string path = Path.Combine(FileSystem.AppDataDirectory, "pairing_info.json");
        try
        {
            string json = JsonSerializer.Serialize(info);
            File.WriteAllText(path, json);
        }
        catch { }
    }
}
