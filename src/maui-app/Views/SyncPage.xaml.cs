using GrainMarket.ViewModels;

namespace GrainMarket.Views;

public partial class SyncPage : ContentPage
{
    public SyncPage(SyncViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
