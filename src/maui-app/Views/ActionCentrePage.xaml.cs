using GrainMarket.ViewModels;

namespace GrainMarket.Views;

public partial class ActionCentrePage : ContentPage
{
    public ActionCentrePage(ActionCentreViewModel vm)
    {
        InitializeComponent();
        BindingContext = vm;
    }
}
