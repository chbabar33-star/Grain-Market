using GrainMarket.ViewModels;

namespace GrainMarket.Views;

public partial class PartiesPage : ContentPage
{
    public PartiesPage(PartiesViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
