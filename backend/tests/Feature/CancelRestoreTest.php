<?php

namespace Tests\Feature;

use App\Services\PosService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class CancelRestoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_cancel_restores_stock(): void
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
            'nama_menu' => 'Test Latte',
            'jenis_menu' => 'coffee',
            'stok' => 5,
            'harga' => 20000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderId = DB::table('pos_orders')->insertGetId([
            'order_no' => 'ORD-TEST-0002',
            'business_date' => now()->toDateString(),
            'status' => 'new',
            'total_amount' => 20000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('pos_order_items')->insert([
            'order_id' => $orderId,
            'product_id' => $productId,
            'product_name_snapshot' => 'Test Latte',
            'unit_price' => 20000,
            'qty' => 1,
            'line_subtotal' => 20000,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $service = app(PosService::class);
        $service->cancelOrder('tester', $orderId, 'test');

        $stock = (int) DB::table('produk')->where('id_menu', $productId)->value('stok');
        $this->assertEquals(6, $stock);
    }
}
