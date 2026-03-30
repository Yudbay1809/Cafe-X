# Printer ESC/POS Test Matrix

## Tujuan
Memastikan integrasi printer ESC/POS stabil untuk skenario kasir (print, reprint, koneksi putus, dan format receipt).

## Perangkat Uji (contoh)
- Printer: Epson TM-T20/TM-T82 (USB/LAN)
- Printer: Xprinter XP-58/XP-80 (USB/Bluetooth)
- Printer: Sunmi/Generic 58mm (Bluetooth)

## Matrix Pengujian

| Area | Skenario | Langkah | Ekspektasi | Status |
|---|---|---|---|---|
| Koneksi | USB terdeteksi | Plug USB, buka POS, test print | Printer muncul dan bisa print | TODO |
| Koneksi | LAN terdeteksi | Set IP, test print | Print berhasil | TODO |
| Koneksi | Bluetooth pairing | Pair, test print | Print berhasil | TODO |
| Format | Struk standard | Print order normal | Layout rapi, teks tidak terpotong | TODO |
| Format | Struk panjang | Order > 30 item | Tidak overflow, paging normal | TODO |
| Format | Reprint | Reprint terakhir | Sama dengan print awal | TODO |
| Error | Printer offline | Cabut printer lalu print | Muncul pesan error ramah kasir | TODO |
| Error | Paper habis | Simulasikan paper empty | Pesan jelas, print retry | TODO |
| Performa | Print cepat | 5 order berturut | Tidak hang, antrian stabil | TODO |
| Charset | Rupiah & simbol | Print harga Rp | Rupiah tampil benar | TODO |

## Checklist Rilis
- Semua skenario lulus untuk minimal 1 printer USB dan 1 printer LAN.
- Error handling jelas dan tidak mengganggu transaksi lain.
- Reprint bisa dilakukan tanpa duplikasi audit.
