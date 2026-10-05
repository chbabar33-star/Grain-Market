using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using GrainMarket.Models;
using GrainMarket.Services;

namespace GrainMarket.ViewModels;

public partial class PartiesViewModel : ObservableObject
{
    private readonly DatabaseService _db;
    private readonly PairingService _pairing;

    public ObservableCollection<Party> PartiesList { get; } = new();

    public PartiesViewModel(DatabaseService db, PairingService pairing)
    {
        _db = db;
        _pairing = pairing;
        _ = LoadPartiesAsync();
    }

    public async Task LoadPartiesAsync()
    {
        var parties = await _db.GetPartiesAsync();
        PartiesList.Clear();
        foreach (var p in parties) PartiesList.Add(p);
    }
}
