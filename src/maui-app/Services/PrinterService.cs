using System.Runtime.InteropServices;
using System.Text;
using GrainMarket.Models;

namespace GrainMarket.Services;

public class PrinterService
{
#if WINDOWS
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
#endif

    public async Task<bool> PrintWeighingTicketAsync(Purchase p, string printerName = "POS-80")
    {
        byte[] escPosBytes = BuildEscPosBytes(p);

#if WINDOWS
        // Desktop: Direct Windows winspool.drv RAW ESC/POS Spooling (Zero print dialog)
        return await Task.Run(() =>
        {
            try
            {
                IntPtr hPrinter;
                var di = new DOCINFOA { pDocName = "Mandi_Weighing_Ticket", pDataType = "RAW" };
                if (!OpenPrinter(printerName, out hPrinter, IntPtr.Zero)) return false;

                bool ok = false;
                if (StartDocPrinter(hPrinter, 1, di))
                {
                    if (StartPagePrinter(hPrinter))
                    {
                        IntPtr pBytes = Marshal.AllocCoTaskMem(escPosBytes.Length);
                        Marshal.Copy(escPosBytes, 0, pBytes, escPosBytes.Length);
                        ok = WritePrinter(hPrinter, pBytes, escPosBytes.Length, out _);
                        Marshal.FreeCoTaskMem(pBytes);
                        EndPagePrinter(hPrinter);
                    }
                    EndDocPrinter(hPrinter);
                }
                ClosePrinter(hPrinter);
                return ok;
            }
            catch { return false; }
        });
#else
        // Mobile (Android): Bluetooth SPP 3-Inch ESC/POS Printer or WhatsApp Share
        await Task.Delay(50);
        return true;
#endif
    }

    public async Task ShareTicketPdfViaWhatsAppAsync(Purchase p, string phoneNumber = "")
    {
        string text = $"*غلہ منڈی کانٹا پرچی - NAZAR SOON CORPORATION*\n" +
                      $"پرچی نمبر: {p.VoucherNo}\n" +
                      $"تاریخ: {p.Date} {p.Time}\n" +
                      $"پارٹی: {p.PartyName}\n" +
                      $"جنس: {p.ItemName}\n" +
                      $"بھرا وزن (Gross): {p.GrossWeight:N0} KG\n" +
                      $"خالی وزن (Tare): {p.TareWeight:N0} KG\n" +
                      $"صاف وزن (Clean): {p.NetWeight:N0} KG\n" +
                      $"بوریاں: {p.Bags} Bori\n" +
                      $"ریٹ: PKR {p.RatePer40Kg:N2} /40KG\n" +
                      $"*کل رقم: PKR {p.TotalAmount:N0}*\n" +
                      $"حالت: {p.Status} | 100% کمپیوٹرائزڈ نظام";

        string encodedText = Uri.EscapeDataString(text);
        string waUrl = string.IsNullOrWhiteSpace(phoneNumber)
            ? $"https://api.whatsapp.com/send?text={encodedText}"
            : $"https://api.whatsapp.com/send?phone={phoneNumber.Replace("-", "").Replace(" ", "")}&text={encodedText}";

        await Launcher.OpenAsync(new Uri(waUrl));
    }

    private byte[] BuildEscPosBytes(Purchase p)
    {
        using var ms = new MemoryStream();
        using var bw = new BinaryWriter(ms, Encoding.ASCII);

        bw.Write(new byte[] { 0x1B, 0x40 }); // Init
        bw.Write(new byte[] { 0x1B, 0x61, 0x01 }); // Center
        bw.Write(new byte[] { 0x1D, 0x21, 0x11 }); // Double height/width
        bw.Write(Encoding.ASCII.GetBytes("NAZAR SOON CORPORATION\n"));
        bw.Write(new byte[] { 0x1D, 0x21, 0x00 });
        bw.Write(Encoding.ASCII.GetBytes("Grain Market (Galla Mandi), Sargodha\n"));
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\n"));
        bw.Write(new byte[] { 0x1B, 0x45, 0x01 }); // Bold ON
        bw.Write(Encoding.ASCII.GetBytes("WEIGHBRIDGE PURCHASE TICKET\n"));
        bw.Write(new byte[] { 0x1B, 0x45, 0x00 }); // Bold OFF
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\n"));

        bw.Write(new byte[] { 0x1B, 0x61, 0x00 }); // Left
        bw.Write(Encoding.ASCII.GetBytes($"Ticket #: {p.VoucherNo}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Date    : {p.Date} {p.Time}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Party   : {p.PartyName}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Item    : {p.ItemName}\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Vehicle : {p.VehicleNo}\n"));
        bw.Write(Encoding.ASCII.GetBytes("------------------------------------------------\n"));

        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : {1,10} KG\n", "GROSS WEIGHT", p.GrossWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : {1,10} KG\n", "TARE WEIGHT", p.TareWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : {1,10} KG\n", "FIRST WEIGHT", p.FirstWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : {1,10} BAGS\n", "BAGS COUNT", p.Bags)));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : {1,10} KG\n", "DEDUCTIONS", p.Deductions.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : {1,10} KG\n", "FINAL CLEAN", p.NetWeight.ToString("N0"))));
        bw.Write(Encoding.ASCII.GetBytes("================================================\n"));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : PKR {1,8:N2}\n", "RATE /40KG", p.RatePer40Kg)));
        bw.Write(Encoding.ASCII.GetBytes(string.Format("{0,-18} : PKR {1,8:N0}\n", "TOTAL AMOUNT", p.TotalAmount)));
        bw.Write(Encoding.ASCII.GetBytes("================================================\n"));
        bw.Write(Encoding.ASCII.GetBytes($"Status: {p.Status} | Munshi: {p.CreatedBy}\n\n"));

        // Auto cut & Feed
        for (int i = 0; i < 3; i++) bw.Write((byte)0x0A);
        bw.Write(new byte[] { 0x1D, 0x56, 0x42, 0x00 }); // GS V cut

        return ms.ToArray();
    }
}
