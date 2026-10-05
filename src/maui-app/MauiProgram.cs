using Microsoft.Extensions.Logging;
using GrainMarket.Services;
using GrainMarket.ViewModels;
using GrainMarket.Views;

namespace GrainMarket;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                fonts.AddFont("JameelNooriNastaleeq.ttf", "UrduNastaleeq");
            });

        // 1. Core Services (Offline-First SQLite + Auto-Sync)
        builder.Services.AddSingleton<DatabaseService>();
        builder.Services.AddSingleton<ConnectivityService>();
        builder.Services.AddSingleton<SyncService>();
        builder.Services.AddSingleton<PrinterService>();
        builder.Services.AddSingleton<PairingService>();

        // 2. ViewModels
        builder.Services.AddSingleton<MainViewModel>();
        builder.Services.AddTransient<WeighbridgeViewModel>();
        builder.Services.AddTransient<ActionCentreViewModel>();
        builder.Services.AddTransient<SyncViewModel>();
        builder.Services.AddTransient<PartiesViewModel>();

        // 3. Views
        builder.Services.AddSingleton<DashboardPage>();
        builder.Services.AddTransient<WeighbridgePage>();
        builder.Services.AddTransient<ActionCentrePage>();
        builder.Services.AddTransient<SyncPage>();
        builder.Services.AddTransient<PartiesPage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
