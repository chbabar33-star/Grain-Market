using Microsoft.Maui.Networking;

namespace GrainMarket.Services;

public class ConnectivityService
{
    public bool IsConnected => Connectivity.Current.NetworkAccess == NetworkAccess.Internet;

    public event Action<bool>? NetworkStatusChanged;

    public ConnectivityService()
    {
        Connectivity.Current.ConnectivityChanged += OnConnectivityChanged;
    }

    private void OnConnectivityChanged(object? sender, ConnectivityChangedEventArgs e)
    {
        bool hasInternet = e.NetworkAccess == NetworkAccess.Internet;
        NetworkStatusChanged?.Invoke(hasInternet);
    }
}
