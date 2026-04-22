// lib/printer.ts
// Simulated Thermal Printer SDK (ESC/POS Simulator)

export const ThermalPrinter = {
  connect: async (deviceAddress: string) => {
    console.log(`[PRINTER] Connecting to Bluetooth Printer at ${deviceAddress}...`);
    return new Promise((resolve) => setTimeout(() => {
      console.log(`[PRINTER] Connected successfully.`);
      resolve(true);
    }, 500));
  },

  printReceipt: async (orderId: string, items: any[], total: number) => {
    console.log('\n--- BEGIN RECEIPT ---');
    console.log('       CAFE-X       ');
    console.log('  Jl. Senopati 12   ');
    console.log('--------------------');
    console.log(`Order: ${orderId}`);
    console.log(`Date: ${new Date().toLocaleString()}`);
    console.log('--------------------');
    
    items.forEach(item => {
      const qtyStr = `${item.qty}x`.padEnd(3);
      const nameStr = item.name.padEnd(10).substring(0, 10);
      const subtotal = item.qty * item.price;
      const priceStr = subtotal.toLocaleString('id-ID');
      console.log(`${qtyStr} ${nameStr} ${priceStr}`);
    });
    
    console.log('--------------------');
    console.log(`TOTAL: Rp ${total.toLocaleString('id-ID')}`);
    console.log('--------------------');
    console.log('   THANK YOU!   ');
    console.log('--- END RECEIPT ---\n');

    // Simulate hardware delay
    return new Promise(resolve => setTimeout(resolve, 800));
  },

  openCashDrawer: async () => {
    console.log('[PRINTER] *Bzzzt* Cash drawer opened.');
  }
};
