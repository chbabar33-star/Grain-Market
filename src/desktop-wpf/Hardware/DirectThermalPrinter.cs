using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using MandiERP.Models;

namespace MandiERP.Hardware;

public class DirectThermalPrinter
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    public class DOCINFOA
    {
        [MarshalAs(UnmanagedType.LPStr)] public string? pDocName;
        [MarshalAs(UnmanagedType.LPStr)] public string? pOutputFile;
        [MarshalAs(UnmanagedType.LPStr)] public string? pDataType;
    }

    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool OpenPrinter([MarshalAs(UnmanagedType.LPStr)] string szPrinter, out IntPtr hPrinter, IntPtr pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool ClosePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartDocPrinter(IntPtr hPrinter, int level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndDocPrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool StartPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool EndPagePrinter(IntPtr hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
    public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

    public static bool SendBytesToPrinter(string printerName, byte[] bytes)
    {
        if (string.IsNullOrWhiteSpace(printerName)) return false;

        IntPtr hPrinter;
        var di = new DOCINFOA
        {
            pDocName = "Mandi_Weighing_Ticket",
            pDataType = "RAW"
        };

        if (!OpenPrinter(printerName.Normalize(), out hPrinter, IntPtr.Zero))
        {
            return false;
        }

        bool success = false;
        if (StartDocPrinter(hPrinter, 1, di))
        {
            if (StartPagePrinter(hPrinter))
            {
                IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
                Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);

                success = WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out _);
                Marshal.FreeCoTaskMem(pUnmanagedBytes);

                EndPagePrinter(hPrinter);
            }
            EndDocPrinter(hPrinter);
        }
        ClosePrinter(hPrinter);
        return success;
    }

    public static byte[] BuildEscPosWeighingTicket(Voucher voucher, Business business, ThermalPrinterConfig config)
    {
        using var ms = new MemoryStream();
        using var bw = new BinaryWriter(ms, Encoding.ASCII);

        // ESC @ -> Initialize printer
        bw.Write(new byte[] { 0x1B, 0x40 });

        // Optional Beep (Buzzer)
        if (config.BeepOnPrint)
        {
            bw.Write(new byte[] { 0x1B, 0x42, 0x02, 0x02 }); // 2 beeps
        }

        // Align Center
        bw.Write(new byte[] { 0x1B, 0x61, 0x01 });

        // Double Height + Double Width for Shop Name
        bw.Write(new byte[] { 0x1D, 0x21, 0x11 });
        bw.Write(Encoding.ASCII.GetBytes(business.Name + "\n"));

        // Normal text size
        bw.Write(new byte[] { 0x1D, 0x21, 0x00 });
        bw.Write(Encoding.ASCII.GetBytes(business.Address + "\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Phone: {business.Phone} | NTN: {business.NTN}\n"));
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\n"));

        // Title: WEIGHBRIDGE FIRST WEIGHT SLIP
        bw.Write(new byte[] { 0x1B, 0x45, 0x01 }); // Bold ON
        string typeLabel = voucher.Type == "PURCHASE" ? "WEIGHBRIDGE PURCHASE SLIP (KANTA PARCHI)" : "SALES OUTWARD SLIP";
        bw.Write(Encoding.ASCII.GetBytes(typeLabel + "\n"));
        bw.Write(new byte[] { 0x1B, 0x45, 0x00 }); // Bold OFF

        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\n"));

        // Align Left
        bw.Write(new byte[] { 0x1B, 0x61, 0x00 });
        bw.Write(Encoding.ASCII.GetBytes($"Token / Voucher No: {voucher.VoucherNo}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Date & Time       : {voucher.Date} {voucher.Time}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Party (Farmer/Mill): {voucher.PartyName}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Commodity (Jins)  : {voucher.ItemName}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Godown Destination: {voucher.GodownName}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Vehicle No        : {voucher.VehicleNo}\n"));
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\n"));

        // Weights Breakdown
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\n", "GROSS WEIGHT (Bhara)", voucher.GrossWeight.ToString("N0")));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\n", "TARE WEIGHT (Khali)", voucher.TareWeight.ToString("N0")));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\n", "NET WEIGHT (Wazan)", voucher.NetWeight.ToString("N0")));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} BAGS\n", "BAGS COUNT (Bori)", voucher.Bags)));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\n", "DEDUCTION (Karda/Chhan)", voucher.Deductions.ToString("N0")));

        bw.Write(Encoding.ASCII.GetBytes("================================================\n"));

        // Final Weight & Total Value
        bw.Write(new byte[] { 0x1B, 0x45, 0x01 }); // Bold ON
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : {1,12} KG\n", "FINAL CLEAN WEIGHT", voucher.FinalWeight.ToString("N0")));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : PKR {1,10:N2} /40kg\n", "AGREED RATE", voucher.Rate)));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-20} : PKR {1,10:N0}\n", "TOTAL VALUE", voucher.TotalAmount)));
        bw.Write(new byte[] { 0x1B, 0x45, 0x00 }); // Bold OFF

        bw.Write(Encoding.ASCII.GetBytes("================================================\n"));

        // Signatures
        bw.Write(Encoding.ASCII.GetBytes("\n"));
        bw.Write(Encoding.ASCII.GetBytes("  Munshi / Weighmaster            Party / Driver\n"));
        bw.Write(Encoding.ASCII.GetBytes("  ____________________           ____________________\n"));
        bw.Write(Encoding.ASCII.GetBytes("\n"));

        // Center Footer
        bw.Write(new byte[] { 0x1B, 0x61, 0x01 });
        bw.Write(Encoding.ASCII.GetBytes(config.FooterNote + "\n"));
        bw.Write(Encoding.ASCII.GetBytes("Powered by Mandi ERP Offline Desktop Edition (.NET 8)\n"));

        // Feed Lines
        for (int i = 0; i < Math.Max(1, config.FeedLines); i++)
        {
            bw.Write((byte)0x0A);
        }

        // Auto Cut
        if (config.AutoCut)
        {
            // GS V 66 0 -> Partial Cut with feed
            bw.Write(new byte[] { 0x1D, 0x56, 0x42, 0x00 });
        }

        return ms.ToArray();
    }
}
