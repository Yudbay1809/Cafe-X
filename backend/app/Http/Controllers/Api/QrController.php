<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\QrCreateOrderRequest;
use App\Http\Requests\Api\QrPlaceOrderRequest;
use App\Services\AuditService;
use App\Services\PosService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class QrController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly PosService $service)
    {
    }

    public function createOrder(QrCreateOrderRequest $request)
    {
        $data = $request->validated();

        $qr = DB::table('table_qr_tokens')
            ->where('token', (string) $data['table_token'])
            ->where('is_active', 1)
            ->where(function ($q): void {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->first();
        if (!$qr) {
            return $this->fail('Table token invalid', 404);
        }

        $table = DB::table('pos_tables')
            ->where('id', (int) $qr->table_id)
            ->where('is_active', 1)
            ->first();

        if (!$table) {
            return $this->fail('Table inactive', 409);
        }

        $deviceId = (string) ($data['device_id'] ?? $request->ip() ?? 'unknown');
        $throttleKey = 'qr_order:' . hash('sha256', $data['table_token'] . '|' . $deviceId);
        if (Cache::has($throttleKey)) {
            return $this->fail('Too many requests', 429);
        }
        Cache::put($throttleKey, 1, now()->addSeconds(10));

        $order = $this->service->createOrder(
            source: 'QR',
            createdBy: 'qr:' . $table->table_code,
            tableId: (int) $table->id,
            notes: (string) ($data['notes'] ?? ''),
            tenantId: isset($table->tenant_id) ? (int) $table->tenant_id : null,
            outletId: isset($table->outlet_id) ? (int) $table->outlet_id : null
        );

        return $this->ok($order, 'Order QR dibuat');
    }

    public function menu(string $tableToken)
    {
        $qr = DB::table('table_qr_tokens')
            ->where('token', $tableToken)
            ->where('is_active', 1)
            ->where(function ($q): void {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->first();
        if (!$qr) {
            return $this->fail('Table token invalid', 404);
        }
        $table = DB::table('pos_tables')->where('id', (int) $qr->table_id)->where('is_active', 1)->first();
        if (!$table) {
            return $this->fail('Table inactive', 409);
        }

        $products = DB::table('produk')
            ->select(['id_menu', 'nama_menu', 'jenis_menu', 'stok', 'harga', 'gambar'])
            ->where('tenant_id', $table->tenant_id)
            ->where('is_active', 1)
            ->orderBy('nama_menu')
            ->get();

        return $this->ok([
            'table' => [
                'table_code' => $table->table_code,
                'table_name' => $table->table_name,
            ],
            'products' => $products,
        ]);
    }

    public function publicMenu(Request $request)
    {
        $tenantId = (int) $request->query('tenant_id', 1);
        if ($tenantId < 1) {
            $tenantId = 1;
        }

        $products = DB::table('produk')
            ->select(['id_menu', 'nama_menu', 'jenis_menu', 'stok', 'harga', 'gambar'])
            ->where('tenant_id', $tenantId)
            ->where('is_active', 1)
            ->orderBy('nama_menu')
            ->get();

        return $this->ok([
            'tenant_id' => $tenantId,
            'products' => $products,
        ]);
    }

    public function tableTokenByCode(string $tableCode)
    {
        $tableCode = strtoupper(trim($tableCode));
        if (!preg_match('/^[A-Z]{1,2}\d{1,3}$/', $tableCode)) {
            return $this->fail('Format nomor meja tidak valid', 422);
        }

        $table = DB::table('pos_tables')
            ->where('table_code', $tableCode)
            ->where('is_active', 1)
            ->first();
        if (!$table) {
            return $this->fail('Table not found', 404);
        }

        $qr = DB::table('table_qr_tokens')
            ->where('table_id', (int) $table->id)
            ->where('is_active', 1)
            ->where(function ($q): void {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->orderByDesc('id')
            ->first();

        if (!$qr) {
            return $this->fail('Table token invalid', 404);
        }

        return $this->ok([
            'table_token' => (string) $qr->token,
            'table' => [
                'table_code' => $table->table_code,
                'table_name' => $table->table_name,
            ],
        ]);
    }

    public function placeOrder(QrPlaceOrderRequest $request)
    {
        $data = $request->validated();
        $qr = DB::table('table_qr_tokens')
            ->where('token', (string) $data['table_token'])
            ->where('is_active', 1)
            ->where(function ($q): void {
                $q->whereNull('expired_at')->orWhere('expired_at', '>', now());
            })
            ->first();
        if (!$qr) {
            return $this->fail('Table token invalid', 404);
        }
        $table = DB::table('pos_tables')->where('id', (int) $qr->table_id)->where('is_active', 1)->first();
        if (!$table) {
            return $this->fail('Table inactive', 409);
        }

        try {
            $order = $this->service->createOrder(
                source: 'QR',
                createdBy: 'qr:' . $table->table_code,
                tableId: (int) $table->id,
                notes: (string) ($data['notes'] ?? ''),
                tenantId: isset($table->tenant_id) ? (int) $table->tenant_id : null,
                outletId: isset($table->outlet_id) ? (int) $table->outlet_id : null
            );

            foreach ((array) $data['items'] as $item) {
                $this->service->addItem(
                    username: 'qr:' . $table->table_code,
                    orderId: (int) $order['order_id'],
                    productId: (int) $item['product_id'],
                    qty: (int) $item['qty'],
                    notes: (string) ($item['notes'] ?? '')
                );
            }

            app(AuditService::class)->log(
                tenantId: $table->tenant_id ?? null,
                outletId: $table->outlet_id ?? null,
                actor: 'qr:' . $table->table_code,
                eventType: 'qr.order.place',
                entityType: 'order',
                entityId: (string) $order['order_id'],
                payload: ['items_count' => count((array) $data['items'])]
            );

            $detail = DB::table('pos_orders')->where('id', (int) $order['order_id'])->first();
            return $this->ok([
                'order_id' => (int) $order['order_id'],
                'order_no' => (string) $order['order_no'],
                'status' => (string) ($detail->status ?? 'new'),
                'total_amount' => (float) ($detail->total_amount ?? 0),
            ], 'Order QR berhasil dibuat');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function orderStatus(string $tableToken, int $orderId)
    {
        $qr = DB::table('table_qr_tokens')
            ->where('token', $tableToken)
            ->where('is_active', 1)
            ->first();
        if (!$qr) {
            return $this->fail('Table token invalid', 404);
        }
        $order = DB::table('pos_orders')->where('id', $orderId)->where('table_id', (int) $qr->table_id)->first();
        if (!$order) {
            return $this->fail('Order not found', 404);
        }

        return $this->ok([
            'order_id' => (int) $order->id,
            'order_no' => (string) $order->order_no,
            'status' => (string) $order->status,
            'total_amount' => (float) $order->total_amount,
        ]);
    }
}
