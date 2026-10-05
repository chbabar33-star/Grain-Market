using GrainMarket.ViewModels;

namespace GrainMarket.Views;

public partial class WeighbridgePage : ContentPage
{
    public WeighbridgePage(WeighbridgeViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
