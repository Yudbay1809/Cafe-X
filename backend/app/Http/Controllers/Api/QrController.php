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

    public function validateVoucher(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        try {
            $result = $this->service->validateVoucher($data['code'], (float) $data['subtotal']);
            return $this->ok($result, 'Voucher valid');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 422);
        }
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

            if (!empty($data['voucher_code'])) {
                try {
                    $this->service->applyVoucher((int) $order['order_id'], (string) $data['voucher_code']);
                } catch (Throwable $ve) {
                    // Log error but don't fail the whole order if voucher fails at the end
                    \Illuminate\Support\Facades\Log::warning("Voucher auto-apply failed for order #{$order['order_id']}: " . $ve->getMessage());
                }
            }

            if (!empty($data['member_phone'])) {
                try {
                    $this->service->applyMember((int) $order['order_id'], (string) $data['member_phone']);
                    
                    if (!empty($data['redeem_points']) && (int)$data['redeem_points'] > 0) {
                        $this->service->redeemPoints((int) $order['order_id'], (int) $data['redeem_points']);
                    }
                } catch (Throwable $me) {
                    \Illuminate\Support\Facades\Log::warning("Member/Redeem auto-apply failed for order #{$order['order_id']}: " . $me->getMessage());
                }
            }

            $detail = DB::table('pos_orders')->where('id', (int) $order['order_id'])->first();
            return $this->ok([
                'order_id' => (int) $order['order_id'],
                'order_no' => (string) $order['order_no'],
                'status' => (string) ($detail->status ?? 'new'),
                'total_amount' => (float) ($detail->total_amount ?? 0),
                'discount_amount' => (float) ($detail->discount_amount ?? 0),
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
            'discount_amount' => (float) ($order->discount_amount ?? 0),
        ]);
    }

    public function applyVoucher(Request $request)
    {
        $data = $request->validate([
            'table_token' => 'required|string',
            'order_id' => 'required|integer',
            'code' => 'required|string',
        ]);

        $qr = DB::table('table_qr_tokens')
            ->where('token', (string) $data['table_token'])
            ->where('is_active', 1)
            ->first();
            
        if (!$qr) {
            return $this->fail('Table token invalid', 404);
        }

        $order = DB::table('pos_orders')
            ->where('id', (int)$data['order_id'])
            ->where('table_id', (int) $qr->table_id)
            ->first();
            
        if (!$order) {
            return $this->fail('Order not found', 404);
        }

        try {
            $result = $this->service->applyVoucher((int)$data['order_id'], (string)$data['code']);
            return $this->ok($result, 'Voucher berhasil digunakan');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function lookupMember(Request $request)
    {
        $phone = $request->query('phone');
        if (!$phone) return $this->error('Nomor telepon diperlukan');

        $member = DB::table('customers')
            ->where('phone', $phone)
            ->first();

        if (!$member) return $this->error('Member tidak ditemukan');

        $points = DB::table('customer_points')
            ->where('customer_id', $member->id)
            ->value('points') ?? 0;

        return $this->ok([
            'id' => $member->id,
            'name' => $member->name,
            'phone' => $member->phone,
            'points' => (int) $points,
        ]);
    }

    public function applyMember(Request $request)
    {
        $orderId = (int) $request->input('order_id');
        $phone = (string) $request->input('phone');

        try {
            $res = App::make(PosService::class)->applyMember($orderId, $phone);
            return $this->ok($res);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function redeemPoints(Request $request)
    {
        $orderId = (int) $request->input('order_id');
        $points = (int) $request->input('points');

        try {
            $res = App::make(PosService::class)->redeemPoints($orderId, $points);
            return $this->ok($res);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}

