using GrainMarket.ViewModels;

namespace GrainMarket.Views;

public partial class DashboardPage : ContentPage
{
    public DashboardPage(MainViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
