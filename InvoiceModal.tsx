import React, { useState } from 'react';
import { Order, Company } from '../types';
import {
  Printer,
  Share2,
  Copy,
  MessageSquare,
  X,
  Receipt,
  Check,
  Building,
  User,
  ExternalLink,
  Bluetooth,
  Smartphone,
  RefreshCw,
  AlertCircle,
  Wifi,
} from 'lucide-react';
import { bluetoothPrinter } from '../services/bluetoothPrinterService';

interface InvoiceModalProps {
  order: Order | null;
  company: Company | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  company,
  isOpen,
  onClose,
}) => {
  const [viewFormat, setViewFormat] = useState<'thermal' | 'standard'>('thermal');
  const [copied, setCopied] = useState(false);
  const [bluetoothConnecting, setBluetoothConnecting] = useState(false);
  const [bluetoothPrinting, setBluetoothPrinting] = useState(false);
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState<string>(
    bluetoothPrinter.isConnected() ? bluetoothPrinter.getConnectedDeviceName() : ''
  );
  const [bluetoothMsg, setBluetoothMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!isOpen || !order) return null;

  const previousDue = company ? company.Current_Due : 0;
  // If order was already counted in Current_Due, calculate starting previous due before this order
  const netDueBeforeThisOrder = Math.max(0, previousDue - (order.Due_Amount || 0));
  const totalPayable = order.Total_Bill + netDueBeforeThisOrder;
  const currentNetRemainingDue = totalPayable - order.Paid_Amount;

  const orderItemsList =
    order.Items && order.Items.length > 0
      ? order.Items
      : [
          {
            Item_Name: order.Item_Name,
            Quantity: order.Quantity,
            Unit_Price: Math.round(order.Total_Bill / Math.max(1, order.Quantity)),
            Total: order.Total_Bill,
          },
        ];

  // Build shareable plain-text invoice
  const buildPlainTextInvoice = () => {
    let text = `================================\n`;
    text += `        DESSERT BOSS 🥥        \n`;
    text += ` Fresh Gourmet Coconut Puddings \n`;
    text += ` Hotlines: +8801711-000000     \n`;
    text += `================================\n`;
    text += `Invoice #: ${order.Order_ID}\n`;
    text += `Date: ${order.Date} ${order.Time || ''}\n`;
    text += `Client: ${order.Company_Name}\n`;
    if (company?.Address) text += `Address: ${company.Address}\n`;
    if (order.Delivered_By) text += `Delivery Staff: ${order.Delivered_By}\n`;
    text += `--------------------------------\n`;
    text += `ITEMS ORDERED:\n`;
    orderItemsList.forEach((item, idx) => {
      text += `${idx + 1}. ${item.Item_Name}\n`;
      text += `   ${item.Quantity} pcs x ৳${item.Unit_Price} = ৳${item.Total.toLocaleString()}\n`;
    });
    text += `--------------------------------\n`;
    text += `Current Order Total: ৳ ${order.Total_Bill.toLocaleString()}\n`;
    text += `Previous Due Balance: ৳ ${netDueBeforeThisOrder.toLocaleString()}\n`;
    text += `Total Payable Amount: ৳ ${totalPayable.toLocaleString()}\n`;
    text += `Paid Amount Today:    ৳ ${order.Paid_Amount.toLocaleString()} (${order.Payment_Method || 'Cash'})\n`;
    text += `Remaining Total Due:  ৳ ${currentNetRemainingDue.toLocaleString()}\n`;
    text += `Status: ${order.Status}\n`;
    text += `================================\n`;
    text += `Thank you for your business!\n`;
    text += `Dessert Boss Distribution Hub\n`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextInvoice());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const rawText = buildPlainTextInvoice();
    const cleanPhone = company ? company.Phone_Number.replace(/[^0-9]/g, '') : '';
    const encoded = encodeURIComponent(rawText);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  // Dedicated Clean Thermal Print Window
  const handleOpenPrintWindow = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      // Pop-up blocked, fallback to standard window.print
      window.print();
      return;
    }

    const itemsRows = orderItemsList
      .map(
        (item, idx) => `
        <tr>
          <td style="padding: 4px 2px; font-weight: 600;">${idx + 1}. ${item.Item_Name}</td>
          <td style="padding: 4px 2px; text-align: center; font-weight: bold;">${item.Quantity}</td>
          <td style="padding: 4px 2px; text-align: right;">৳${item.Unit_Price}</td>
          <td style="padding: 4px 2px; text-align: right; font-weight: bold;">৳${item.Total.toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice #${order.Order_ID} - Dessert Boss</title>
          <style>
            @page {
              margin: 4mm;
              size: auto;
            }
            body {
              font-family: 'Courier New', Courier, monospace, sans-serif;
              margin: 0;
              padding: 10px;
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.35;
            }
            .slip {
              max-width: 320px;
              margin: 0 auto;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
            .border-top { border-top: 1px dashed #000; padding-top: 6px; margin-top: 6px; }
            .double-line { border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 4px 0; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; }
            .btn-bar { text-align: center; margin-bottom: 12px; }
            .print-btn {
              background: #047857; color: #fff; border: none; padding: 8px 18px;
              border-radius: 6px; font-weight: bold; font-size: 13px; cursor: pointer;
            }
            @media print {
              .btn-bar { display: none !important; }
              body { padding: 0 !important; }
            }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="btn-bar">
              <button class="print-btn" onclick="window.print()">🖨️ এখনই প্রিন্ট করুন (Print Slip)</button>
            </div>

            <div class="text-center border-bottom">
              <h2 style="margin: 0; font-size: 18px; font-weight: 900; letter-spacing: 1px;">DESSERT BOSS</h2>
              <div style="font-size: 11px; font-weight: bold;">Gourmet Coconut Pudding & Falooda</div>
              <div style="font-size: 10px;">Chilled Distribution Network</div>
              <div style="font-size: 10px;">Hotline: +880 1711-000000</div>
            </div>

            <div class="border-bottom" style="font-size: 11px;">
              <div class="row">
                <span>ইনভয়েস / মেমো #:</span>
                <span class="bold">${order.Order_ID}</span>
              </div>
              <div class="row">
                <span>তারিখ ও সময়:</span>
                <span>${order.Date} ${order.Time || ''}</span>
              </div>
              <div class="row">
                <span>ডেলিভারি স্ট্যাটাস:</span>
                <span class="bold">${order.Status}</span>
              </div>
              ${order.Delivered_By ? `<div class="row"><span>ডেলিভারি স্টাফ:</span><span class="bold">${order.Delivered_By}</span></div>` : ''}
            </div>

            <div class="border-bottom" style="font-size: 11px;">
              <div style="font-size: 10px; color: #444; font-weight: bold;">গ্রাহক / দোকান বিবরণ:</div>
              <div class="bold" style="font-size: 13px;">${order.Company_Name}</div>
              ${company?.Address ? `<div>${company.Address}</div>` : ''}
              ${company?.Phone_Number ? `<div>মোবাইল: ${company.Phone_Number}</div>` : ''}
            </div>

            <div style="margin: 6px 0;">
              <table>
                <thead>
                  <tr style="border-bottom: 1px dashed #000; font-size: 10px;">
                    <th style="text-align: left; padding-bottom: 3px;">আইটেম</th>
                    <th style="text-align: center; padding-bottom: 3px;">সংখ্যা</th>
                    <th style="text-align: right; padding-bottom: 3px;">দর</th>
                    <th style="text-align: right; padding-bottom: 3px;">মোট</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </div>

            <div class="border-top" style="font-size: 11px;">
              <div class="row">
                <span>আজকের মোট বিল:</span>
                <span class="bold">৳ ${order.Total_Bill.toLocaleString()}</span>
              </div>
              <div class="row">
                <span>পূর্বের বকেয়া (Previous Due):</span>
                <span>+ ৳ ${netDueBeforeThisOrder.toLocaleString()}</span>
              </div>
              <div class="row double-line bold" style="font-size: 12px;">
                <span>সর্বমোট প্রদেয় (Total Payable):</span>
                <span>৳ ${totalPayable.toLocaleString()}</span>
              </div>
              <div class="row" style="color: #047857;">
                <span>আজকের জমা (পেইড):</span>
                <span class="bold">- ৳ ${order.Paid_Amount.toLocaleString()} (${order.Payment_Method || 'Cash'})</span>
              </div>
              <div class="row bold" style="font-size: 13px; color: #b91c1c; border-top: 1px solid #000; padding-top: 3px; margin-top: 3px;">
                <span>বর্তমান অবশিষ্ট বাকি (Net Due):</span>
                <span>৳ ${currentNetRemainingDue.toLocaleString()}</span>
              </div>
            </div>

            <div style="margin-top: 25px; padding-top: 10px; border-top: 1px dashed #000; font-size: 10px; text-align: center;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div style="border-top: 1px solid #000; padding-top: 2px; width: 45%;">কর্তৃপক্ষের স্বাক্ষর</div>
                <div style="border-top: 1px solid #000; padding-top: 2px; width: 45%;">দোকানদারের স্বাক্ষর</div>
              </div>
              <div>* ৪°C - ৮°C তাপমাত্রায় সংরক্ষণ করুন *</div>
              <div class="bold" style="margin-top: 2px;">Dessert Boss এর সাথে থাকার জন্য ধন্যবাদ!</div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  };

  const handleDirectPrint = () => {
    window.print();
  };

  const handleConnectBluetooth = async () => {
    setBluetoothConnecting(true);
    setBluetoothMsg(null);
    try {
      const result = await bluetoothPrinter.connect();
      if (result.success) {
        setBluetoothDeviceName(result.deviceName);
        setBluetoothMsg({ text: `সংযুক্ত: ${result.deviceName} (Ready)`, type: 'success' });
      } else {
        setBluetoothMsg({ text: result.error || 'কানেক্ট করা যায়নি', type: 'error' });
      }
    } catch (err: any) {
      setBluetoothMsg({ text: err.message || 'কানেকশনে সমস্যা হয়েছে', type: 'error' });
    } finally {
      setBluetoothConnecting(false);
    }
  };

  const handlePrintBluetooth = async () => {
    setBluetoothMsg(null);
    if (!bluetoothPrinter.isConnected()) {
      const conn = await bluetoothPrinter.connect();
      if (!conn.success) {
        setBluetoothMsg({ text: conn.error || 'প্রিন্টার কানেক্ট করা যায়নি', type: 'error' });
        return;
      }
      setBluetoothDeviceName(conn.deviceName);
    }

    setBluetoothPrinting(true);
    setBluetoothMsg({ text: 'ব্লুটুথ প্রিন্টারে ইনভয়েস পাঠানো হচ্ছে...', type: 'info' });
    try {
      const receiptData = bluetoothPrinter.buildEscPosReceipt(
        order,
        company,
        netDueBeforeThisOrder,
        totalPayable,
        currentNetRemainingDue
      );
      await bluetoothPrinter.sendData(receiptData);
      setBluetoothMsg({ text: '✓ ব্লুটুথ প্রিন্টারে সফলভাবে প্রিন্ট হয়েছে!', type: 'success' });
    } catch (err: any) {
      setBluetoothMsg({ text: `প্রিন্ট ব্যর্থ: ${err.message}`, type: 'error' });
    } finally {
      setBluetoothPrinting(false);
    }
  };

  const handleTestPrintBluetooth = async () => {
    if (!bluetoothPrinter.isConnected()) {
      const conn = await bluetoothPrinter.connect();
      if (!conn.success) {
        setBluetoothMsg({ text: conn.error || 'প্রিন্টার কানেক্ট করা যায়নি', type: 'error' });
        return;
      }
      setBluetoothDeviceName(conn.deviceName);
    }

    setBluetoothPrinting(true);
    try {
      const testSlip = bluetoothPrinter.buildTestSlip();
      await bluetoothPrinter.sendData(testSlip);
      setBluetoothMsg({ text: '✓ টেস্ট স্লিপ প্রিন্ট সফল হয়েছে!', type: 'success' });
    } catch (err: any) {
      setBluetoothMsg({ text: `টেস্ট প্রিন্ট ব্যর্থ: ${err.message}`, type: 'error' });
    } finally {
      setBluetoothPrinting(false);
    }
  };

  const handleRawBtMobilePrint = () => {
    const text = buildPlainTextInvoice();
    const url = bluetoothPrinter.getRawBtPrintUrl(text);
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[94vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-4 py-3 bg-emerald-950 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Receipt size={17} className="text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm leading-tight">ডেলিভারি ইনভয়েস ও মেমো প্রিন্ট</h3>
              <p className="text-[11px] text-emerald-300">
                মেমো নং #{order.Order_ID} • {order.Company_Name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle: Thermal vs Standard */}
            <div className="flex bg-emerald-900/80 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setViewFormat('thermal')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  viewFormat === 'thermal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200'
                }`}
              >
                POS রিসিট (58mm)
              </button>
              <button
                onClick={() => setViewFormat('standard')}
                className={`px-2 py-1 rounded-md font-semibold transition-all ${
                  viewFormat === 'standard' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-200'
                }`}
              >
                A4 মেমো
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-emerald-800 text-emerald-200 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Bluetooth Thermal Printer Quick Bar */}
        <div className="bg-emerald-900/95 text-white px-3.5 py-2 border-b border-emerald-800 flex items-center justify-between flex-wrap gap-2 text-xs no-print">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                bluetoothPrinter.isConnected() ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-400'
              }`}
            />
            <div className="flex items-center gap-1 font-medium">
              <Bluetooth
                size={14}
                className={bluetoothPrinter.isConnected() ? 'text-emerald-300' : 'text-zinc-300'}
              />
              <span className="font-bold text-[11px]">
                {bluetoothPrinter.isConnected()
                  ? `সংযুক্ত: ${bluetoothDeviceName}`
                  : 'ব্লুটুথ থার্মাল প্রিন্টার (58mm/80mm)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {!bluetoothPrinter.isConnected() ? (
              <button
                onClick={handleConnectBluetooth}
                disabled={bluetoothConnecting}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {bluetoothConnecting ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <Bluetooth size={12} />
                )}
                <span>{bluetoothConnecting ? 'খোঁজা হচ্ছে...' : 'প্রিন্টার কানেক্ট'}</span>
              </button>
            ) : (
              <button
                onClick={handleTestPrintBluetooth}
                disabled={bluetoothPrinting}
                className="px-2 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 text-[10px] font-bold transition-all"
              >
                টেস্ট প্রিন্ট
              </button>
            )}

            <button
              onClick={handleRawBtMobilePrint}
              className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-800 text-emerald-200 text-[10px] font-bold flex items-center gap-1 transition-all border border-emerald-700/60"
              title="RawBT Print Service Android App দিয়ে সরাসরি প্রিন্ট"
            >
              <Smartphone size={11} />
              <span>RawBT অ্যাপ</span>
            </button>
          </div>
        </div>

        {/* Bluetooth Notification Message (if any) */}
        {bluetoothMsg && (
          <div
            className={`px-4 py-1.5 text-[11px] font-semibold flex items-center justify-between no-print ${
              bluetoothMsg.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-b border-emerald-300'
                : bluetoothMsg.type === 'error'
                ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border-b border-rose-300'
                : 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-b border-blue-300'
            }`}
          >
            <span>{bluetoothMsg.text}</span>
            <button
              onClick={() => setBluetoothMsg(null)}
              className="text-xs font-bold px-1.5 py-0.5 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        {/* Printable Invoice Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950">
          <div
            id="printable-invoice"
            className={`mx-auto bg-white text-zinc-900 transition-all ${
              viewFormat === 'thermal'
                ? 'max-w-[340px] p-4 font-mono text-xs border border-dashed border-zinc-300 shadow-md rounded-lg'
                : 'max-w-[480px] p-6 text-xs border border-zinc-200 shadow-md rounded-xl'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-zinc-800">
              <div className="w-9 h-9 mx-auto rounded-full bg-emerald-900 text-white flex items-center justify-center font-black text-lg mb-1">
                🥥
              </div>
              <h1 className="text-base font-black tracking-tight uppercase">
                DESSERT BOSS
              </h1>
              <p className="text-[10px] text-zinc-600 font-sans uppercase tracking-wider font-semibold">
                Gourmet Dessert & Food Distribution
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-sans">
                Chilled Delivery Hotline: +880 1711-000000
              </p>
            </div>

            {/* Invoice Meta */}
            <div className="py-2.5 border-b border-dashed border-zinc-300 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Invoice No:</span>
                <span className="font-bold">{order.Order_ID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & Time:</span>
                <span>{order.Date} {order.Time || '09:00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold uppercase text-emerald-800">{order.Status}</span>
              </div>
              {order.Delivered_By && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">ডেলিভারি স্টাফ:</span>
                  <span className="font-bold text-zinc-800">{order.Delivered_By}</span>
                </div>
              )}
            </div>

            {/* Customer Details */}
            <div className="py-2.5 border-b border-dashed border-zinc-300 text-[11px] space-y-0.5">
              <span className="text-[10px] uppercase text-zinc-400 font-bold block">
                DELIVER TO (দোকান / ক্লায়েন্ট):
              </span>
              <p className="font-bold text-xs text-zinc-900">
                {order.Company_Name}
              </p>
              {company && (
                <>
                  <p className="text-[10px] text-zinc-600">{company.Address}</p>
                  <p className="text-[10px] text-zinc-600">Tel: {company.Phone_Number}</p>
                  {company.Contact_Person && (
                    <p className="text-[10px] text-zinc-600">Attn: {company.Contact_Person}</p>
                  )}
                </>
              )}
            </div>

            {/* Line Items Table */}
            <div className="py-2.5 border-b border-zinc-800">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-dashed border-zinc-400 text-zinc-600">
                    <th className="pb-1">Item Description</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Price</th>
                    <th className="pb-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {orderItemsList.map((item, idx) => (
                    <tr key={idx} className="py-1">
                      <td className="py-1 pr-1 font-medium">{item.Item_Name}</td>
                      <td className="py-1 text-center font-bold">{item.Quantity}</td>
                      <td className="py-1 text-right">৳{item.Unit_Price}</td>
                      <td className="py-1 text-right font-bold">৳{item.Total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Ledger Calculation */}
            <div className="py-2.5 border-b border-dashed border-zinc-400 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>আজকের মোট বিল (Order Subtotal):</span>
                <span className="font-bold">৳ {order.Total_Bill.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>পূর্বের বকেয়া (Previous Balance):</span>
                <span>+ ৳ {netDueBeforeThisOrder.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-dashed border-zinc-300 text-xs">
                <span>সর্বমোট প্রদেয় বিল (Total Payable):</span>
                <span>৳ {totalPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>আজকের জমা / পেইড ({order.Payment_Method || 'Cash'}):</span>
                <span>- ৳ {order.Paid_Amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-rose-700 pt-1 border-t border-zinc-800 text-xs">
                <span>মোট বর্তমান বকেয়া (Net Remaining Due):</span>
                <span>৳ {currentNetRemainingDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Signatures & Footer Note */}
            <div className="pt-4 pb-2 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center text-[10px] pt-4">
                <div className="border-t border-zinc-400 pt-1">
                  <span>কর্তৃপক্ষের স্বাক্ষর</span>
                </div>
                <div className="border-t border-zinc-400 pt-1">
                  <span>রিসিভ স্বাক্ষর</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-zinc-500 pt-2 border-t border-dashed border-zinc-300">
                <p>৪°C - ৮°C তাপমাত্রায় সংরক্ষণ করুন</p>
                <p className="font-bold mt-0.5">Dessert Boss এর সাথে থাকার জন্য ধন্যবাদ!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer (Hidden when printing) */}
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি টেক্সট'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <MessageSquare size={14} />
              <span>হোয়াটসঅ্যাপ মেমো</span>
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Bluetooth Direct Thermal Print Button */}
            <button
              onClick={handlePrintBluetooth}
              disabled={bluetoothPrinting}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
              title="ব্লুটুথ থার্মাল প্রিন্টারে সরাসরি ESC/POS প্রিন্ট পাঠান"
            >
              {bluetoothPrinting ? (
                <RefreshCw size={14} className="animate-spin text-white" />
              ) : (
                <Bluetooth size={14} className="text-blue-200" />
              )}
              <span>{bluetoothPrinting ? 'প্রিন্ট হচ্ছে...' : 'ব্লুটুথ প্রিন্ট'}</span>
            </button>

            {/* Primary POS Slip Print Window (100% reliable) */}
            <button
              onClick={handleOpenPrintWindow}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              title="নতুন পরিষ্কার প্রিন্ট প্রিভিউ উইন্ডো খুলবে"
            >
              <ExternalLink size={14} />
              <span>রিসিট স্লিপ</span>
            </button>

            <button
              onClick={handleDirectPrint}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Printer size={14} />
              <span>প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
