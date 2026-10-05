using System.Drawing.Printing;
using System.Globalization;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using MandiERP.Database;
using MandiERP.Hardware;
using MandiERP.Models;

namespace MandiERP;

public partial class MainWindow : Window
{
    private readonly DatabaseManager _db;
    private Business _currentBusiness;
    private ThermalPrinterConfig _printerConfig;
    private List<Voucher> _vouchers = new();
    private List<Party> _parties = new();
    private List<Item> _items = new();
    private List<Godown> _godowns = new();

    public MainWindow()
    {
        InitializeComponent();

        // 1. Initialize local SQLite database file for this business
        _db = new DatabaseManager("biz-1");
        _currentBusiness = new Business
        {
            Id = "biz-1",
            Name = "NAZAR SOON CORPORATION",
            NameUrdu = "نظر سون کارپوریشن",
            Address = "Grain Market (Galla Mandi), Shop # 14-B, Sargodha Road",
            Phone = "+92 300 1234567",
            NTN = "7392814-5",
            Proprietor = "Ch. Babar Ameen"
        };

        _printerConfig = _db.GetPrinterConfig();

        Loaded += MainWindow_Loaded;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        TxtDbStatus.Text = $"SQLite: {System.IO.Path.GetFileName(_db.DatabaseFilePath)}";
        TxtPrinterStatus.Text = $"Thermal: {_printerConfig.PrinterName} (Direct RAW)";

        LoadPrintersList();
        RefreshAllData();
        PrepareNewVoucherForm();
    }

    private void LoadPrintersList()
    {
        CmbInstalledPrinters.Items.Clear();
        try
        {
            foreach (string printer in PrinterSettings.InstalledPrinters)
            {
                CmbInstalledPrinters.Items.Add(printer);
            }
        }
        catch
        {
            CmbInstalledPrinters.Items.Add("POS-80");
            CmbInstalledPrinters.Items.Add("EPSON TM-T88");
            CmbInstalledPrinters.Items.Add("Xprinter XP-80C");
            CmbInstalledPrinters.Items.Add("Microsoft Print to PDF");
        }

        if (CmbInstalledPrinters.Items.Contains(_printerConfig.PrinterName))
        {
            CmbInstalledPrinters.SelectedItem = _printerConfig.PrinterName;
        }
        else if (CmbInstalledPrinters.Items.Count > 0)
        {
            CmbInstalledPrinters.SelectedIndex = 0;
        }
    }

    private void RefreshAllData()
    {
        _vouchers = _db.GetAllVouchers();
        _parties = _db.GetAllParties();
        _items = _db.GetAllItems();

        GridRecentVouchers.ItemsSource = null;
        GridRecentVouchers.ItemsSource = _vouchers;

        GridParties.ItemsSource = null;
        GridParties.ItemsSource = _parties;

        CmbWbParty.ItemsSource = _parties;
        if (_parties.Count > 0) CmbWbParty.SelectedIndex = 0;

        CmbWbItem.ItemsSource = _items;
        if (_items.Count > 0) CmbWbItem.SelectedIndex = 0;

        _godowns = new List<Godown>
        {
            new Godown { Id = "gdn-1", Name = "Main Market Yard (Galla Mandi Pharr)" },
            new Godown { Id = "gdn-2", Name = "Godown # 1 (Station Road)" },
            new Godown { Id = "gdn-3", Name = "Godown # 2 (Bypass Shed)" }
        };
        CmbWbGodown.ItemsSource = _godowns;
        CmbWbGodown.SelectedIndex = 0;

        // Calculate KPI values
        double todayPurchase = 0;
        double todayPurchaseWt = 0;
        int todayPurchaseBags = 0;

        double todaySales = 0;
        double todaySalesWt = 0;
        int todaySalesBags = 0;

        string today = DateTime.Now.ToString("yyyy-MM-dd");

        foreach (var v in _vouchers)
        {
            if (v.Date == today)
            {
                if (v.Type == "PURCHASE")
                {
                    todayPurchase += v.TotalAmount;
                    todayPurchaseWt += v.FinalWeight;
                    todayPurchaseBags += v.Bags;
                }
                else if (v.Type == "SALE")
                {
                    todaySales += v.TotalAmount;
                    todaySalesWt += v.FinalWeight;
                    todaySalesBags += v.Bags;
                }
            }
        }

        TxtTodayPurchaseAmount.Text = $"PKR {todayPurchase:N0}";
        TxtTodayPurchaseWeight.Text = $"{todayPurchaseWt:N0} KG · {todayPurchaseBags} Bags";

        TxtTodaySalesAmount.Text = $"PKR {todaySales:N0}";
        TxtTodaySalesWeight.Text = $"{todaySalesWt:N0} KG · {todaySalesBags} Bags";

        TxtTotalVouchersCount.Text = $"{_vouchers.Count} Vouchers";
        TxtStatus.Text = $"Ready · Local SQLite Database: {_db.DatabaseFilePath} · {_vouchers.Count} Total Vouchers";
    }

    private void PrepareNewVoucherForm()
    {
        string nextNo = $"PUR-2026-{(_vouchers.Count + 1):D3}";
        TxtWbVoucherNo.Text = nextNo;
        TxtWbDate.Text = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        TxtWbGross.Text = "18500";
        TxtWbTare.Text = "4500";
        TxtWbDeductions.Text = "140";
        TxtWbRate.Text = "4200";
        CalculateWeighbridge();
    }

    private void WbWeights_Changed(object sender, TextChangedEventArgs e)
    {
        CalculateWeighbridge();
    }

    private void CalculateWeighbridge()
    {
        if (TxtWbNet == null || TxtWbFinalWeight == null || TxtWbTotalAmount == null) return;

        double.TryParse(TxtWbGross.Text, out double gross);
        double.TryParse(TxtWbTare.Text, out double tare);
        double.TryParse(TxtWbDeductions.Text, out double ded);
        double.TryParse(TxtWbRate.Text, out double rate);

        double net = Math.Max(0, gross - tare);
        double final = Math.Max(0, net - ded);

        // Rate in Mandi is per 40 KG (Maund)
        double total = (final / 40.0) * rate;

        TxtWbNet.Text = net.ToString("N0");
        TxtWbFinalWeight.Text = final.ToString("N0");
        TxtWbTotalAmount.Text = total.ToString("N0");
    }

    private void BtnSaveVoucher_Click(object sender, RoutedEventArgs e)
    {
        SaveCurrentVoucher(printDirect: false);
    }

    private void BtnSaveAndPrint_Click(object sender, RoutedEventArgs e)
    {
        SaveCurrentVoucher(printDirect: true);
    }

    private void SaveCurrentVoucher(bool printDirect)
    {
        var party = CmbWbParty.SelectedItem as Party;
        var item = CmbWbItem.SelectedItem as Item;
        var godown = CmbWbGodown.SelectedItem as Godown;

        double.TryParse(TxtWbGross.Text, out double gross);
        double.TryParse(TxtWbTare.Text, out double tare);
        double.TryParse(TxtWbDeductions.Text, out double ded);
        double.TryParse(TxtWbRate.Text, out double rate);
        int.TryParse(TxtWbBags.Text, out int bags);

        double net = Math.Max(0, gross - tare);
        double final = Math.Max(0, net - ded);
        double total = (final / 40.0) * rate;

        var v = new Voucher
        {
            Id = Guid.NewGuid().ToString(),
            VoucherNo = TxtWbVoucherNo.Text,
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            Time = DateTime.Now.ToString("HH:mm:ss"),
            Type = "PURCHASE",
            PartyId = party?.Id ?? "",
            PartyName = party?.Name ?? "General Farmer",
            ItemId = item?.Id ?? "",
            ItemName = item?.Name ?? "Wheat (گندم)",
            GodownId = godown?.Id ?? "",
            GodownName = godown?.Name ?? "Main Market Yard",
            VehicleNo = TxtWbVehicleNo.Text,
            GrossWeight = gross,
            TareWeight = tare,
            NetWeight = net,
            Bags = bags,
            Deductions = ded,
            FinalWeight = final,
            Rate = rate,
            TotalAmount = total,
            Status = "Approved",
            CreatedBy = "Munshi"
        };

        // Write directly to SQLite database file
        _db.InsertVoucher(v);
        TxtStatus.Text = $"Voucher {v.VoucherNo} saved to SQLite: {_db.DatabaseFilePath}";

        if (printDirect)
        {
            ExecuteDirectThermalPrint(v);
        }
        else
        {
            MessageBox.Show($"Weighbridge Voucher {v.VoucherNo} saved to SQLite file successfully!", "Mandi ERP Desktop", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        RefreshAllData();
        PrepareNewVoucherForm();
        SwitchView("Dashboard");
    }

    private void ExecuteDirectThermalPrint(Voucher v)
    {
        byte[] escPosBytes = DirectThermalPrinter.BuildEscPosWeighingTicket(v, _currentBusiness, _printerConfig);
        bool success = DirectThermalPrinter.SendBytesToPrinter(_printerConfig.PrinterName, escPosBytes);

        if (success)
        {
            MessageBox.Show($"Raw ESC/POS slip sent directly to thermal printer '{_printerConfig.PrinterName}' without browser dialog!", "Thermal Print Success", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        else
        {
            MessageBox.Show($"Could not open printer '{_printerConfig.PrinterName}'. Please verify the printer is powered on and connected in Windows Devices and Printers.", "Printer Notice", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
    }

    private void BtnDirectPrintRow_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.DataContext is Voucher v)
        {
            ExecuteDirectThermalPrint(v);
        }
    }

    private void BtnNewTicket_Click(object sender, RoutedEventArgs e)
    {
        SwitchView("Weighbridge");
    }

    private void BtnRefresh_Click(object sender, RoutedEventArgs e)
    {
        RefreshAllData();
    }

    private void Nav_Click(object sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string tag)
        {
            SwitchView(tag);
        }
    }

    private void SwitchView(string viewTag)
    {
        ViewDashboard.Visibility = Visibility.Collapsed;
        ViewWeighbridge.Visibility = Visibility.Collapsed;
        ViewParties.Visibility = Visibility.Collapsed;
        ViewPrinterSettings.Visibility = Visibility.Collapsed;

        // Reset button colors
        BtnNavDashboard.Background = Brushes.Transparent;
        BtnNavWeighbridge.Background = Brushes.Transparent;
        BtnNavSales.Background = Brushes.Transparent;
        BtnNavAction.Background = Brushes.Transparent;
        BtnNavParties.Background = Brushes.Transparent;
        BtnNavReports.Background = Brushes.Transparent;
        BtnNavMonthClosing.Background = Brushes.Transparent;
        BtnNavPrinter.Background = Brushes.Transparent;

        var activeBrush = new SolidColorBrush(Color.FromRgb(30, 41, 59));

        switch (viewTag)
        {
            case "Dashboard":
                ViewDashboard.Visibility = Visibility.Visible;
                BtnNavDashboard.Background = activeBrush;
                break;
            case "Weighbridge":
                ViewWeighbridge.Visibility = Visibility.Visible;
                BtnNavWeighbridge.Background = activeBrush;
                break;
            case "Parties":
                ViewParties.Visibility = Visibility.Visible;
                BtnNavParties.Background = activeBrush;
                break;
            case "PrinterSettings":
                ViewPrinterSettings.Visibility = Visibility.Visible;
                BtnNavPrinter.Background = activeBrush;
                break;
            default:
                ViewDashboard.Visibility = Visibility.Visible;
                BtnNavDashboard.Background = activeBrush;
                break;
        }
    }

    private void BtnSavePrinterSettings_Click(object sender, RoutedEventArgs e)
    {
        _printerConfig.PrinterName = CmbInstalledPrinters.SelectedItem?.ToString() ?? "POS-80";
        _printerConfig.AutoCut = ChkAutoCut.IsChecked == true;
        _printerConfig.BeepOnPrint = ChkBeep.IsChecked == true;
        _printerConfig.ShopHeader = TxtShopHeader.Text;

        _db.SavePrinterConfig(_printerConfig);
        TxtPrinterStatus.Text = $"Thermal: {_printerConfig.PrinterName} (Direct RAW)";

        MessageBox.Show($"Thermal printer settings saved to SQLite!\nPrinter: {_printerConfig.PrinterName}\nAutoCut: {_printerConfig.AutoCut}", "Settings Saved", MessageBoxButton.OK, MessageBoxImage.Information);
    }

    private void BtnTestPrint_Click(object sender, RoutedEventArgs e)
    {
        var testVoucher = new Voucher
        {
            VoucherNo = "TEST-TICKET",
            Date = DateTime.Now.ToString("yyyy-MM-dd"),
            Time = DateTime.Now.ToString("HH:mm:ss"),
            Type = "PURCHASE",
            PartyName = "Direct Thermal Test Party",
            ItemName = "Wheat (گندم دیسی)",
            GodownName = "Yard # 1",
            VehicleNo = "TEST-01",
            GrossWeight = 20000,
            TareWeight = 5000,
            NetWeight = 15000,
            Bags = 300,
            Deductions = 150,
            FinalWeight = 14850,
            Rate = 4250,
            TotalAmount = 1577812
        };

        string targetPrinter = CmbInstalledPrinters.SelectedItem?.ToString() ?? _printerConfig.PrinterName;
        byte[] escPosBytes = DirectThermalPrinter.BuildEscPosWeighingTicket(testVoucher, _currentBusiness, _printerConfig);
        bool success = DirectThermalPrinter.SendBytesToPrinter(targetPrinter, escPosBytes);

        if (success)
        {
            MessageBox.Show($"Test receipt sent to '{targetPrinter}' successfully!\nCheck printer for paper cut & beep.", "Test Print Success", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        else
        {
            MessageBox.Show($"Failed to send raw bytes to '{targetPrinter}'. Ensure the printer name is correct in Windows Devices and Printers.", "Test Failed", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }
}
