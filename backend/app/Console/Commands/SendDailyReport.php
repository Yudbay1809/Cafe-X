<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\NotificationService;

class SendDailyReport extends Command
{
    protected $signature = 'app:send-daily-report {date?}';
    protected $description = 'Mengirimkan ringkasan laporan finansial harian ke email/WA Owner';

    public function handle(): void
    {
        $date = $this->argument('date') ?? now()->format('Y-m-d');
        $this->info("Menyiapkan laporan untuk tanggal: {$date}");

        // 1. Ambil data ringkasan
        $summary = DB::table('pos_orders')
            ->whereDate('created_at', $date)
            ->where('status', 'paid')
            ->selectRaw('COUNT(*) as total_orders, SUM(total_amount) as total_revenue, SUM(discount_amount + points_discount) as total_discounts')
            ->first();

        if ($summary->total_orders == 0) {
            $this->warn("Tidak ada transaksi untuk tanggal ini.");
            return;
        }

        // 2. Performa per Outlet
        $outlets = DB::table('pos_orders')
            ->join('outlets', 'outlets.id', '=', 'pos_orders.outlet_id')
            ->whereDate('pos_orders.created_at', $date)
            ->where('pos_orders.status', 'paid')
            ->select('outlets.name', DB::raw('SUM(total_amount) as revenue'))
            ->groupBy('outlets.id', 'outlets.name')
            ->get();

        // 3. Top 5 Menu
        $topMenus = DB::table('pos_order_items')
            ->join('pos_orders', 'pos_orders.id', '=', 'pos_order_items.order_id')
            ->join('products', 'products.id', '=', 'pos_order_items.product_id')
            ->whereDate('pos_orders.created_at', $date)
            ->where('pos_orders.status', 'paid')
            ->select('products.name', DB::raw('SUM(pos_order_items.qty) as total_qty'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        // 4. Format Laporan untuk Log/WA
        $msg = "📊 *LAPORAN HARIAN CAFE-X ({$date})*\n\n";
        $msg .= "💰 Total Revenue: Rp " . number_format($summary->total_revenue, 0, ',', '.') . "\n";
        $msg .= "🧾 Total Transaksi: {$summary->total_orders}\n";
        $msg .= "💸 Total Diskon: Rp " . number_format($summary->total_discounts, 0, ',', '.') . "\n\n";
        
        $msg .= "*Performa Outlet:*\n";
        foreach ($outlets as $o) {
            $msg .= "• {$o->name}: Rp " . number_format($o->revenue, 0, ',', '.') . "\n";
        }

        $msg .= "\n*Top 5 Menu:*\n";
        foreach ($topMenus as $m) {
            $msg .= "• {$m->name} ({$m->total_qty} terjual)\n";
        }

        // Mengirim ke Owner (Mock via Log & WA Service)
        Log::info("Daily Financial Report Sent", ['report' => $msg]);
        
        // Asumsikan kita punya nomor WA Owner di config
        $ownerPhone = env('OWNER_WHATSAPP', '081234567890');
        app(NotificationService::class)->sendWhatsApp($ownerPhone, $msg);

        $this->info("Laporan berhasil dikirim!");
    }
}
