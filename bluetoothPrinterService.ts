/**
 * Bluetooth Thermal POS Printer Service (ESC/POS)
 * Supports:
 * 1. Web Bluetooth API (Direct BLE connection to 58mm/80mm POS receipt printers)
 * 2. RawBT Android Mobile POS App integration
 * 3. ESC/POS Command Generator (Bangla transliterated / Clean English formatting)
 */

import { Order, Company } from '../types';

export interface BluetoothDeviceState {
  name: string;
  connected: boolean;
  error?: string;
}

// Common Bluetooth Thermal Printer GATT Service UUIDs
const KNOWN_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Receipt
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Serial
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
];

class BluetoothPrinterManager {
  private device: any = null;
  private server: any = null;
  private characteristic: any = null;

  public isWebBluetoothSupported(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Scan and connect to a Bluetooth thermal printer
   */
  public async connect(): Promise<{ success: boolean; deviceName: string; error?: string }> {
    if (!this.isWebBluetoothSupported()) {
      return {
        success: false,
        deviceName: '',
        error: 'আপনার ব্রাউজারে Web Bluetooth সাপোর্ট নেই। Google Chrome ব্রাউজার ব্যবহার করুন অথবা RawBT অ্যাপ অপশন চাপুন।',
      };
    }

    try {
      // Prompt user to select Bluetooth Printer
      // @ts-ignore
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: KNOWN_PRINTER_SERVICES,
      });

      if (!this.device) {
        return { success: false, deviceName: '', error: 'কোনো প্রিন্টার সিলেক্ট করা হয়নি।' };
      }

      const deviceName = this.device.name || 'Bluetooth POS Printer';

      // Connect to GATT Server
      this.server = await this.device.gatt.connect();

      // Find the writable characteristic across primary services
      let foundChar: any = null;

      for (const serviceUuid of KNOWN_PRINTER_SERVICES) {
        try {
          const service = await this.server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();

          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              foundChar = char;
              break;
            }
          }
          if (foundChar) break;
        } catch {
          // Continue searching other services
        }
      }

      if (!foundChar) {
        // Fallback: search all available services
        try {
          const services = await this.server.getPrimaryServices();
          for (const service of services) {
            const chars = await service.getCharacteristics();
            for (const char of chars) {
              if (char.properties.write || char.properties.writeWithoutResponse) {
                foundChar = char;
                break;
              }
            }
            if (foundChar) break;
          }
        } catch (e) {
          console.warn('Fallback primary services scan error:', e);
        }
      }

      if (!foundChar) {
        throw new Error('প্রিন্টারের সাথে কানেক্ট হয়েছে কিন্তু রাইট করার চ্যানেল পাওয়া যায়নি। প্রিন্টারটি রিস্টার্ট দিয়ে আবার চেষ্টা করুন।');
      }

      this.characteristic = foundChar;

      // Handle disconnect
      this.device.addEventListener('gattserverdisconnected', () => {
        this.server = null;
        this.characteristic = null;
      });

      return { success: true, deviceName };
    } catch (err: any) {
      console.error('Bluetooth connection failed:', err);
      return {
        success: false,
        deviceName: '',
        error: err?.message || 'ব্লুটুথ কানেকশনে সমস্যা হয়েছে। ব্লুটুথ চালু আছে কিনা ও প্রিন্টার পেয়ার করা আছে কিনা চেক করুন।',
      };
    }
  }

  public isConnected(): boolean {
    return !!(this.server && this.server.connected && this.characteristic);
  }

  public getConnectedDeviceName(): string {
    return this.device?.name || 'Bluetooth Printer';
  }

  public disconnect(): void {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }

  /**
   * Send ESC/POS byte buffer to printer in chunks (avoids BLE packet drops)
   */
  public async sendData(buffer: Uint8Array): Promise<boolean> {
    if (!this.characteristic) {
      throw new Error('ব্লুটুথ প্রিন্টার কানেক্টেড নেই। প্রথমে কানেক্ট করুন।');
    }

    const chunkSize = 64; // Standard BLE packet safe size
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.slice(i, i + chunkSize);
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }
      // Small delay between packets
      await new Promise((r) => setTimeout(r, 20));
    }
    return true;
  }

  /**
   * Generates ESC/POS byte array for standard 58mm/80mm thermal receipt
   */
  public buildEscPosReceipt(
    order: Order,
    company?: Company,
    previousDue: number = 0,
    totalPayable: number = 0,
    remainingDue: number = 0
  ): Uint8Array {
    const encoder = new TextEncoder();
    const parts: number[] = [];

    const addBytes = (...bytes: number[]) => parts.push(...bytes);
    const addText = (text: string) => {
      const encoded = encoder.encode(text);
      for (let i = 0; i < encoded.length; i++) {
        parts.push(encoded[i]);
      }
    };
    const addLine = (text: string = '') => {
      addText(text + '\n');
    };

    // 1. Initialize Printer (ESC @)
    addBytes(0x1b, 0x40);

    // 2. Center Align (ESC a 1)
    addBytes(0x1b, 0x61, 0x01);

    // Header: Bold & Double Height (GS ! 0x11)
    addBytes(0x1d, 0x21, 0x11);
    addBytes(0x1b, 0x45, 0x01); // Bold ON
    addLine('DESSERT BOSS');

    // Normal Font (GS ! 0x00)
    addBytes(0x1d, 0x21, 0x00);
    addBytes(0x1b, 0x45, 0x00); // Bold OFF
    addLine('Fresh Gourmet Coconut Pudding');
    addLine('Falooda & Premium Desserts');
    addLine('Distribution Hub - Dhaka');
    addLine('Hotline: +880 1711-000000');
    addLine('================================');

    // Left Align (ESC a 0)
    addBytes(0x1b, 0x61, 0x00);

    // Order Meta Info
    addLine(`Invoice No : #${order.Order_ID}`);
    addLine(`Date & Time: ${order.Date} ${order.Time || ''}`);
    addLine(`Client/Shop: ${order.Company_Name}`);
    if (company?.Phone_Number) {
      addLine(`Phone      : ${company.Phone_Number}`);
    }
    if (company?.Address) {
      addLine(`Address    : ${company.Address.slice(0, 32)}`);
    }
    if (order.Delivered_By) {
      addLine(`Rider/Staff: ${order.Delivered_By}`);
    }
    addLine('--------------------------------');

    // Items Table Header (58mm = 32 chars width)
    // "Item                 Qty   Total"
    addLine('Item Name          Qty     Total');
    addLine('--------------------------------');

    const items =
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

    items.forEach((item) => {
      const name = item.Item_Name.slice(0, 16).padEnd(17, ' ');
      const qty = `${item.Quantity}`.padStart(4, ' ');
      const total = `৳${item.Total}`.padStart(10, ' ');
      addLine(`${name}${qty}${total}`);
      if (item.Unit_Price) {
        addLine(`  @ ৳${item.Unit_Price} each`);
      }
    });

    addLine('--------------------------------');

    // Financial Totals
    const padRow = (label: string, value: string) => {
      const spaceCount = Math.max(1, 32 - label.length - value.length);
      return `${label}${' '.repeat(spaceCount)}${value}`;
    };

    addLine(padRow('Order Total Bill:', `৳ ${order.Total_Bill.toLocaleString()}`));
    addLine(padRow('Previous Due:', `৳ ${previousDue.toLocaleString()}`));

    // Bold Total Payable
    addBytes(0x1b, 0x45, 0x01);
    addLine(padRow('Total Payable:', `৳ ${totalPayable.toLocaleString()}`));
    addBytes(0x1b, 0x45, 0x00);

    addLine(padRow(`Paid Amount (${order.Payment_Method || 'Cash'}):`, `৳ ${order.Paid_Amount.toLocaleString()}`));

    // Remaining Due
    addBytes(0x1b, 0x45, 0x01);
    addLine(padRow('Remaining Net Due:', `৳ ${remainingDue.toLocaleString()}`));
    addBytes(0x1b, 0x45, 0x00);

    addLine(padRow('Status:', `${order.Status}`));
    addLine('================================');

    // Center Footer Note
    addBytes(0x1b, 0x61, 0x01);
    addLine('Thank you for choosing Dessert Boss!');
    addLine('Quality & Taste Guaranteed');
    addLine('Software: Dessert Boss POS');

    // Feed 4 lines & cut (ESC d 4 + GS V 66 0)
    addBytes(0x1b, 0x64, 0x04);
    addBytes(0x1d, 0x56, 0x42, 0x00);

    return new Uint8Array(parts);
  }

  /**
   * Generates a test print slip
   */
  public buildTestSlip(): Uint8Array {
    const encoder = new TextEncoder();
    const parts: number[] = [];

    const addBytes = (...bytes: number[]) => parts.push(...bytes);
    const addLine = (text: string = '') => {
      const encoded = encoder.encode(text + '\n');
      for (let i = 0; i < encoded.length; i++) parts.push(encoded[i]);
    };

    addBytes(0x1b, 0x40); // Init
    addBytes(0x1b, 0x61, 0x01); // Center
    addBytes(0x1d, 0x21, 0x11); // Double size
    addLine('DESSERT BOSS');
    addBytes(0x1d, 0x21, 0x00);
    addLine('Bluetooth POS Printer Test');
    addLine('--------------------------------');
    addLine('Status: Connection Successful!');
    addLine(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) + ' BST');
    addLine('--------------------------------');
    addLine('Ready for 58mm / 80mm Printing');
    addBytes(0x1b, 0x64, 0x04); // Feed
    addBytes(0x1d, 0x56, 0x42, 0x00); // Cut

    return new Uint8Array(parts);
  }

  /**
   * Direct RawBT Android Intent URL (opens RawBT printer app on Android)
   */
  public getRawBtPrintUrl(text: string): string {
    const encoded = encodeURIComponent(text);
    return `rawbt:data:text/plain;charset=utf-8,${encoded}`;
  }
}

export const bluetoothPrinter = new BluetoothPrinterManager();
