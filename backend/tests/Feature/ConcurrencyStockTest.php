<?php

namespace Tests\Feature;

use App\Services\PosService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ConcurrencyStockTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_prevents_double_add(): void
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
            'nama_menu' => 'Test Espresso',
            'jenis_menu' => 'coffee',
            'stok' => 1,
            'harga' => 15000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $orderId = DB::table('pos_orders')->insertGetId([
            'order_no' => 'ORD-TEST-0003',
            'business_date' => now()->toDateString(),
            'status' => 'new',
            'total_amount' => 15000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $service = app(PosService::class);
        $service->addItem('tester', $orderId, $productId, 1, '');

        $this->expectException(\RuntimeException::class);
        $service->addItem('tester', $orderId, $productId, 1, '');
    }
}
