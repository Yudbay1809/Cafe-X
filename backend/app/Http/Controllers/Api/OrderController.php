<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderCancelled;
use App\Events\OrderPaid;
use App\Events\OrderPlaced;
use App\Events\OrderStatusUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OrderAddItemRequest;
use App\Http\Requests\Api\OrderCancelRequest;
use App\Http\Requests\Api\OrderCancelItemRequest;
use App\Http\Requests\Api\OrderCreateRequest;
use App\Http\Requests\Api\OrderMergeRequest;
use App\Http\Requests\Api\OrderMoveTableRequest;
use App\Http\Requests\Api\OrderPayRequest;
use App\Http\Requests\Api\OrderSplitRequest;
use App\Http\Requests\Api\OrderStatusUpdateRequest;
use App\Http\Requests\Api\OrderUpdateItemRequest;
use App\Http\Requests\Api\ReceiptRequest;
use App\Services\AuditService;
use App\Services\IdempotencyService;
use App\Services\PosService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class OrderController extends BaseApiController
{

    public function __construct(
        private readonly PosService $service,
        private readonly IdempotencyService $idempotency
    ) {
    }

    public function create(OrderCreateRequest $request)
    {
        $data = $request->validated();

        $auth = $request->attributes->get('auth_user', []);
        $source = $data['source'] ?? 'POS';
        $tableCode = strtoupper((string) ($data['table_code'] ?? ''));
        $tableId = null;
        if ($tableCode !== '') {
            $table = DB::table('pos_tables')->where('table_code', $tableCode)->where('is_active', 1)->first();
            if (!$table) {
                return $this->fail('Table not found', 404);
            }
            $tableId = (int) $table->id;
        }

        $order = $this->service->createOrder(
            source: $source,
            createdBy: (string) ($auth['username'] ?? 'system'),
            tableId: $tableId,
            notes: (string) ($data['notes'] ?? ''),
            tenantId: isset($auth['tenant_id']) ? (int) $auth['tenant_id'] : null,
            outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null
        );
        
        event(new OrderPlaced($order));

        app(AuditService::class)->log(
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'order.create',
            entityType: 'order',
            entityId: (string) $order['order_id'],
            payload: $order
        );

        return $this->ok($order, 'Order dibuat');
    }

    public function index(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $status = (string) $request->query('status', '');
        $q = trim((string) $request->query('q', ''));
        $limit = (int) ($request->query('limit') ?? 50);
        $limit = $limit > 0 && $limit <= 200 ? $limit : 50;
        $page = (int) ($request->query('page') ?? 1);
        $page = $page > 0 ? $page : 1;
        $offset = ($page - 1) * $limit;

        $base = DB::table('pos_orders as o')
            ->leftJoin('pos_tables as t', 't.id', '=', 'o.table_id')
            ->when($tenantId > 0, fn ($qb) => $qb->where('o.tenant_id', $tenantId))
            ->when($outletId > 0, fn ($qb) => $qb->where('o.outlet_id', $outletId))
            ->when($status !== '', fn ($qb) => $qb->where('o.status', $status))
            ->when($q !== '', function ($qb) use ($q) {
                $qb->where(function ($w) use ($q) {
                    $w->where('o.order_no', 'like', "%{$q}%")
                      ->orWhere('t.table_code', 'like', "%{$q}%")
                      ->orWhere('t.table_name', 'like', "%{$q}%");
                });
            });

        $total = (int) (clone $base)->count('o.id');

        $items = (clone $base)
            ->select([
                'o.id',
                'o.order_no',
                'o.status',
                'o.total_amount',
                'o.source',
                'o.created_at',
                'o.paid_at',
                't.table_code',
                't.table_name',
            ])
            ->orderByDesc('o.id')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return $this->ok([
            'items' => $items->all(),
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
        ]);
    }

    public function addItem(OrderAddItemRequest $request)
    {
        $data = $request->validated();

        $auth = $request->attributes->get('auth_user', []);
        try {
            $result = $this->service->addItem(
                username: (string) ($auth['username'] ?? 'system'),
                orderId: (int) $data['order_id'],
                productId: (int) $data['product_id'],
                qty: (int) $data['qty'],
                notes: (string) ($data['notes'] ?? '')
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: (string) ($auth['username'] ?? 'system'),
                eventType: 'order.add_item',
                entityType: 'order',
                entityId: (string) $result['order_id'],
                payload: $result
            );
            return $this->ok($result, 'Item ditambahkan');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function detail(Request $request, int $orderId)
    {
        $order = DB::table('pos_orders')->where('id', $orderId)->first();
        if (!$order) {
            return $this->fail('Order not found', 404);
        }

        $items = DB::table('pos_order_items')
            ->where('order_id', $orderId)
            ->orderBy('id')
            ->get();

        return $this->ok([
            'order' => $order,
            'items' => $items,
        ]);
    }

    public function pay(OrderPayRequest $request)
    {
        $data = $request->validated();

        $auth = $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        $replay = $this->idempotency->getReplay($request, 'orders/pay', $actor);
        if ($replay !== null) {
            return response()->json($replay);
        }

        try {
            $result = $this->service->payOrder(
                actor: $actor,
                orderId: (int) $data['order_id'],
                method: (string) $data['method'],
                amount: (float) $data['amount'],
                referenceNo: (string) ($data['reference_no'] ?? '')
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: $actor,
                eventType: 'order.pay',
                entityType: 'order',
                entityId: (string) $result['order_id'],
                payload: $result
            );
            
            event(new OrderPaid($result));

            $response = [
                'success' => true,
                'message' => 'Pembayaran berhasil',
                'data' => $result,
                'server_time' => now()->format('Y-m-d H:i:s'),
            ];
            $this->idempotency->store($request, 'orders/pay', $actor, $response);
            return response()->json($response);
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function cancel(OrderCancelRequest $request)
    {
        $data = $request->validated();

        $auth = $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        $order = DB::table('pos_orders')->where('id', (int) $data['order_id'])->first();
        $cancelHighThreshold = (float) (DB::table('pos_settings')->where('setting_key', 'cancel_high_threshold')->value('setting_value') ?? 500000);
        $permissions = is_array($auth['permissions'] ?? null) ? $auth['permissions'] : [];
        if ($order && (float) $order->total_amount >= $cancelHighThreshold && !in_array('order.cancel.high', $permissions, true)) {
            return $this->fail('Order bernilai besar butuh otorisasi supervisor', 403);
        }
        $replay = $this->idempotency->getReplay($request, 'orders/cancel', $actor);
        if ($replay !== null) {
            return response()->json($replay);
        }
        try {
            $result = $this->service->cancelOrder(
                actor: $actor,
                orderId: (int) $data['order_id'],
                reason: (string) ($data['reason'] ?? 'Canceled by user')
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: $actor,
                eventType: 'order.cancel',
                entityType: 'order',
                entityId: (string) $result['order_id'],
                payload: $result
            );

            event(new OrderCancelled($result));

            $response = [
                'success' => true,
                'message' => 'Order dibatalkan',
                'data' => $result,
                'server_time' => now()->format('Y-m-d H:i:s'),
            ];
            $this->idempotency->store($request, 'orders/cancel', $actor, $response);
            return response()->json($response);
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function status(OrderStatusUpdateRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');

        try {
            $result = $this->service->transitionOrderStatus(
                actor: $actor,
                orderId: (int) $data['order_id'],
                toStatus: (string) $data['status']
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: $actor,
                eventType: 'order.status',
                entityType: 'order',
                entityId: (string) $result['order_id'],
                payload: $result
            );

            event(new OrderStatusUpdated($result));

            return $this->ok($result, 'Status order diperbarui');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function updateItem(OrderUpdateItemRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $result = $this->service->updateItemQty(
                actor: $actor,
                orderId: (int) $data['order_id'],
                productId: (int) $data['product_id'],
                qty: (int) $data['qty'],
                notes: (string) ($data['notes'] ?? '')
            );
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.item.update', 'order', (string) $result['order_id'], $result);
            return $this->ok($result, 'Qty item diperbarui');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function cancelItem(OrderCancelItemRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $result = $this->service->cancelItem(
                actor: $actor,
                orderId: (int) $data['order_id'],
                productId: (int) $data['product_id'],
                reason: (string) ($data['reason'] ?? '')
            );
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.item.cancel', 'order', (string) $result['order_id'], $result);
            return $this->ok($result, 'Item order dibatalkan');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function moveTable(OrderMoveTableRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $result = $this->service->moveOrderTable($actor, (int) $data['order_id'], (string) $data['to_table_code']);
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.move_table', 'order', (string) $result['order_id'], $result);
            return $this->ok($result, 'Meja order dipindah');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function merge(OrderMergeRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $result = $this->service->mergeOrders($actor, (int) $data['source_order_id'], (int) $data['target_order_id']);
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.merge', 'order', (string) $data['target_order_id'], $result);
            return $this->ok($result, 'Order berhasil digabung');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function split(OrderSplitRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $result = $this->service->splitOrder($actor, (int) $data['order_id'], (array) $data['items']);
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.split', 'order', (string) $data['order_id'], $result);
            return $this->ok($result, 'Order berhasil di-split');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function receipt(ReceiptRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $payload = $this->service->receiptData((int) $data['order_id']);
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.receipt.print', 'order', (string) $data['order_id'], ['type' => 'print']);
            return $this->ok($payload, 'Receipt siap dicetak');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 404);
        }
    }

    public function reprint(ReceiptRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        try {
            $payload = $this->service->receiptData((int) $data['order_id']);
            app(AuditService::class)->log($auth['tenant_id'] ?? null, $auth['outlet_id'] ?? null, $actor, 'order.receipt.reprint', 'order', (string) $data['order_id'], ['type' => 'reprint']);
            return $this->ok($payload, 'Receipt reprint siap');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 404);
        }
    }

    public function cancelById(Request $request, int $orderId)
    {
        $data = $request->validate([
            'reason' => 'nullable|string|max:200',
        ]);
        $auth = $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        $order = DB::table('pos_orders')->where('id', $orderId)->first();
        $cancelHighThreshold = (float) (DB::table('pos_settings')->where('setting_key', 'cancel_high_threshold')->value('setting_value') ?? 500000);
        $permissions = is_array($auth['permissions'] ?? null) ? $auth['permissions'] : [];
        if ($order && (float) $order->total_amount >= $cancelHighThreshold && !in_array('order.cancel.high', $permissions, true)) {
            return $this->fail('Order bernilai besar butuh otorisasi supervisor', 403);
        }
        $replay = $this->idempotency->getReplay($request, 'orders/cancel', $actor);
        if ($replay !== null) {
            return response()->json($replay);
        }
        try {
            $result = $this->service->cancelOrder(
                actor: $actor,
                orderId: $orderId,
                reason: (string) ($data['reason'] ?? 'Canceled by user')
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: $actor,
                eventType: 'order.cancel',
                entityType: 'order',
                entityId: (string) $result['order_id'],
                payload: $result
            );
            $response = [
                'success' => true,
                'message' => 'Order dibatalkan',
                'data' => $result,
                'server_time' => now()->format('Y-m-d H:i:s'),
            ];
            $this->idempotency->store($request, 'orders/cancel', $actor, $response);
            return response()->json($response);
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function applyVoucher(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|integer',
            'code' => 'required|string',
        ]);

        try {
            $result = $this->service->applyVoucher($data['order_id'], $data['code']);
            return $this->ok($result, 'Voucher berhasil digunakan');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }
}


