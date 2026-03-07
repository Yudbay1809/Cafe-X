<?php

namespace Tests\Unit;

use App\Services\PosService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PosServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate', ['--force' => true]);
        $this->artisan('db:seed', ['--force' => true]);
    }

    public function test_add_item_decreases_stock_and_recomputes_total(): void
    {
        $service = app(PosService::class);

        $order = $service->createOrder('POS', 'admin', null, 'svc-test', 1, 1, null);
        $orderId = (int) $order['order_id'];

        $before = (int) DB::table('produk')->where('id_menu', 1)->value('stok');
        $result = $service->addItem('admin', $orderId, 1, 1);
        $after = (int) DB::table('produk')->where('id_menu', 1)->value('stok');

        $this->assertSame($before - 1, $after);
        $this->assertSame($orderId, (int) $result['order_id']);
        $this->assertGreaterThan(0, (float) $result['totals']['total_amount']);
    }

    public function test_cancel_order_restores_stock(): void
    {
        $service = app(PosService::class);
        $order = $service->createOrder('POS', 'admin', null, 'svc-test', 1, 1, null);
        $orderId = (int) $order['order_id'];

        $before = (int) DB::table('produk')->where('id_menu', 1)->value('stok');
        $service->addItem('admin', $orderId, 1, 2);
        $mid = (int) DB::table('produk')->where('id_menu', 1)->value('stok');
        $service->cancelOrder('admin', $orderId, 'test-cancel');
        $after = (int) DB::table('produk')->where('id_menu', 1)->value('stok');

        $this->assertSame($before - 2, $mid);
        $this->assertSame($before, $after);
    }
}
