<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PosFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate', ['--force' => true]);
        $this->artisan('db:seed', ['--force' => true]);
    }

    private function authHeaders(): array
    {
        $resp = $this->postJson('/api/v1/auth/login', [
            'username' => 'admin',
            'password' => 'admin',
            'device_name' => 'test-device',
        ]);
        $resp->assertOk();
        $token = $resp->json('data.token');

        return [
            'Authorization' => 'Bearer ' . $token,
            'Idempotency-Key' => 'it-' . bin2hex(random_bytes(8)),
        ];
    }

    public function test_double_payment_is_rejected(): void
    {
        $headers = $this->authHeaders();

        $create = $this->withHeaders($headers)->postJson('/api/v1/orders/create', [
            'source' => 'POS',
            'notes' => 'unit test',
        ]);
        $create->assertOk();
        $orderId = (int) $create->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 1,
        ])->assertOk();

        $payPayload = [
            'order_id' => $orderId,
            'method' => 'cash',
            'amount' => 999999,
        ];

        $firstHeaders = $headers;
        $firstHeaders['Idempotency-Key'] = 'pay-1-' . bin2hex(random_bytes(4));
        $this->withHeaders($firstHeaders)->postJson('/api/v1/orders/pay', $payPayload)->assertOk();

        $secondHeaders = $headers;
        $secondHeaders['Idempotency-Key'] = 'pay-2-' . bin2hex(random_bytes(4));
        $this->withHeaders($secondHeaders)->postJson('/api/v1/orders/pay', $payPayload)
            ->assertStatus(409);
    }

    public function test_cancel_restores_stock(): void
    {
        $headers = $this->authHeaders();

        $startStock = (int) DB::table('produk')->where('id_menu', 1)->value('stok');
        $create = $this->withHeaders($headers)->postJson('/api/v1/orders/create', [
            'source' => 'POS',
        ]);
        $create->assertOk();
        $orderId = (int) $create->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 2,
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/cancel', [
            'order_id' => $orderId,
            'reason' => 'test-cancel',
        ])->assertOk();

        $endStock = (int) DB::table('produk')->where('id_menu', 1)->value('stok');
        $this->assertSame($startStock, $endStock);
    }

    public function test_sync_push_returns_mixed_result(): void
    {
        $headers = $this->authHeaders();

        $response = $this->withHeaders($headers)->postJson('/api/v1/sync/push', [
            'events' => [
                [
                    'type' => 'create_order',
                    'payload' => ['source' => 'POS'],
                ],
                [
                    'type' => 'unsupported_event',
                    'payload' => ['foo' => 'bar'],
                ],
            ],
        ]);

        $response->assertOk();
        $this->assertSame(2, (int) $response->json('data.processed'));
        $this->assertSame(1, (int) $response->json('data.failed'));
    }

    public function test_order_status_strict_transition(): void
    {
        $headers = $this->authHeaders();

        $create = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS']);
        $create->assertOk();
        $orderId = (int) $create->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/status', [
            'order_id' => $orderId,
            'status' => 'ready',
        ])->assertStatus(409);

        $this->withHeaders($headers)->postJson('/api/v1/orders/status', [
            'order_id' => $orderId,
            'status' => 'preparing',
        ])->assertOk();
    }

    public function test_low_stock_guard_blocks_second_add(): void
    {
        $headers = $this->authHeaders();
        DB::table('produk')->where('id_menu', 1)->update(['stok' => 1]);

        $create = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS']);
        $create->assertOk();
        $orderId = (int) $create->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 1,
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 1,
        ])->assertStatus(409);
    }

    public function test_update_and_cancel_item_flow(): void
    {
        $headers = $this->authHeaders();
        $create = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS']);
        $orderId = (int) $create->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 3,
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/update-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 2,
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/cancel-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'reason' => 'wrong input',
        ])->assertOk();
    }

    public function test_move_merge_split_and_receipt(): void
    {
        $headers = $this->authHeaders();
        $this->withHeaders($headers)->postJson('/api/v1/tables/upsert', [
            'table_code' => 'B1',
            'table_name' => 'Table B1',
            'rotate_qr' => true,
        ])->assertOk();

        $o1 = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS'])->json('data.order_id');
        $o2 = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS'])->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', ['order_id' => $o1, 'product_id' => 1, 'qty' => 1])->assertOk();
        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', ['order_id' => $o2, 'product_id' => 1, 'qty' => 1])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/move-table', [
            'order_id' => $o1,
            'to_table_code' => 'B1',
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/merge', [
            'source_order_id' => $o2,
            'target_order_id' => $o1,
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/split', [
            'order_id' => $o1,
            'items' => [['product_id' => 1, 'qty' => 1]],
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/receipt', ['order_id' => $o1])->assertOk();
        $this->withHeaders($headers)->postJson('/api/v1/orders/reprint', ['order_id' => $o1])->assertOk();
    }
    public function test_idempotency_replay_on_pay(): void
    {
        $headers = $this->authHeaders();

        $create = $this->withHeaders($headers)->postJson('/api/v1/orders/create', [
            'source' => 'POS',
        ]);
        $create->assertOk();
        $orderId = (int) $create->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $orderId,
            'product_id' => 1,
            'qty' => 1,
        ])->assertOk();

        $payPayload = [
            'order_id' => $orderId,
            'method' => 'cash',
            'amount' => 999999,
        ];

        $headers['Idempotency-Key'] = 'pay-replay';
        $first = $this->withHeaders($headers)->postJson('/api/v1/orders/pay', $payPayload);
        $first->assertOk();

        $second = $this->withHeaders($headers)->postJson('/api/v1/orders/pay', $payPayload);
        $second->assertOk();

        $this->assertSame($first->json('data.order_id'), $second->json('data.order_id'));
    }

    public function test_stock_guard_across_orders(): void
    {
        $headers = $this->authHeaders();
        DB::table('produk')->where('id_menu', 1)->update(['stok' => 1]);

        $o1 = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS'])->json('data.order_id');
        $o2 = $this->withHeaders($headers)->postJson('/api/v1/orders/create', ['source' => 'POS'])->json('data.order_id');

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $o1,
            'product_id' => 1,
            'qty' => 1,
        ])->assertOk();

        $this->withHeaders($headers)->postJson('/api/v1/orders/add-item', [
            'order_id' => $o2,
            'product_id' => 1,
            'qty' => 1,
        ])->assertStatus(409);
    }
}


