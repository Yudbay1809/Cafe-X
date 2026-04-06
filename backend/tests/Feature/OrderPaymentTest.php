<?php

namespace Tests\Feature;

use App\Services\PosService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OrderPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_double_payment_rejected(): void
    {
        DB::table('pos_settings')->insert([
            'setting_key' => 'tax_pct',
            'setting_value' => '0',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('pos_settings')->insert([
            'setting_key' => 'service_pct',
            'setting_value' => '0',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productId = DB::table('produk')->insertGetId([
            'nama_menu' => 'Test Coffee',
            'jenis_menu' => 'coffee',
            'stok' => 10,
            'harga' => 10000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderId = DB::table('pos_orders')->insertGetId([
            'order_no' => 'ORD-TEST-0001',
            'business_date' => now()->toDateString(),
            'status' => 'new',
            'total_amount' => 10000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('pos_order_items')->insert([
            'order_id' => $orderId,
            'product_id' => $productId,
            'product_name_snapshot' => 'Test Coffee',
            'unit_price' => 10000,
            'qty' => 1,
            'line_subtotal' => 10000,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $service = app(PosService::class);
        $service->payOrder('tester', $orderId, 'cash', 10000);

        $this->expectException(\RuntimeException::class);
        $service->payOrder('tester', $orderId, 'cash', 10000);
    }
}
