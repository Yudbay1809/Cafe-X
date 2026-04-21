<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class PosService
{
    public function __construct(
        private readonly StockService $stockService,
        private readonly ShiftService $shiftService,
        private readonly OrderStateService $orderStateService
    ) {
    }

    public function issueToken(string $username, string $role, string $tokenName = 'device'): string
    {
        $token = bin2hex(random_bytes(32));
        $hash = hash('sha256', $token);
        DB::table('api_tokens')->insert([
            'username' => $username,
            'role_name' => $role,
            'token_hash' => $hash,
            'token_name' => $tokenName,
            'expires_at' => now()->addDays(30),
            'revoked_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $token;
    }

    public function nextOrderNo(string $businessDate): string
    {
        $prefix = 'ORD-' . date('Ymd', strtotime($businessDate));
        $last = DB::table('pos_orders')
            ->where('order_no', 'like', $prefix . '-%')
            ->orderByDesc('id')
            ->value('order_no');

        $next = 1;
        if (is_string($last) && $last !== '') {
            $parts = explode('-', $last);
            $lastPart = (string) end($parts);
            if ($lastPart !== '' && ctype_digit($lastPart)) {
                $next = ((int) $lastPart) + 1;
            }
        }

        return $prefix . '-' . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function recomputeOrderTotals(int $orderId): array
    {
        $subtotal = (float) DB::table('pos_order_items')
            ->where('order_id', $orderId)
            ->where('status', 'active')
            ->sum('line_subtotal');

        $order = DB::table('pos_orders')->where('id', $orderId)->first();
        $discountAmount = (float) ($order->discount_amount ?? 0);

        $billableSubtotal = max(0, $subtotal - $discountAmount);

        $taxPct = (float) DB::table('pos_settings')->where('setting_key', 'tax_pct')->value('setting_value');
        $servicePct = (float) DB::table('pos_settings')->where('setting_key', 'service_pct')->value('setting_value');
        $taxPct = min(100, max(0, $taxPct));
        $servicePct = min(100, max(0, $servicePct));

        $tax = round($billableSubtotal * ($taxPct / 100), 2);
        $service = round($billableSubtotal * ($servicePct / 100), 2);
        $total = round($billableSubtotal + $tax + $service, 2);

        DB::table('pos_orders')
            ->where('id', $orderId)
            ->update([
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'service_amount' => $service,
                'total_amount' => $total,
                'sync_version' => DB::raw('sync_version + 1'),
                'updated_at' => now(),
            ]);

        return [
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'billable_subtotal' => $billableSubtotal,
            'tax_amount' => $tax,
            'service_amount' => $service,
            'total_amount' => $total,
        ];
    }

    public function createOrder(
        string $source,
        string $createdBy,
        ?int $tableId,
        string $notes = '',
        ?int $tenantId = null,
        ?int $outletId = null,
        ?int $shiftId = null
    ): array
    {
        $businessDate = now()->toDateString();
        $orderNo = $this->nextOrderNo($businessDate);

        if ($shiftId === null && $createdBy !== '' && $tenantId !== null) {
            $shift = $this->shiftService->currentOpenShift($createdBy, $tenantId, $outletId);
            $shiftId = $shift?->id ? (int) $shift->id : null;
        }

        $orderId = DB::table('pos_orders')->insertGetId([
            'order_no' => $orderNo,
            'business_date' => $businessDate,
            'tenant_id' => $tenantId,
            'outlet_id' => $outletId,
            'table_id' => $tableId,
            'shift_id' => $shiftId,
            'source' => $source,
            'status' => 'new',
            'notes' => $notes,
            'created_by' => $createdBy,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [
            'order_id' => $orderId,
            'order_no' => $orderNo,
            'source' => $source,
            'status' => 'new',
            'shift_id' => $shiftId,
        ];
    }

    public function addItem(string $username, int $orderId, int $productId, int $qty, string $notes = ''): array
    {
        return DB::transaction(function () use ($username, $orderId, $productId, $qty, $notes): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled', 'served'], true)) {
                throw new RuntimeException('Order tidak valid');
            }

            $product = DB::table('produk')->lockForUpdate()->where('id_menu', $productId)->first();
            if (!$product) {
                throw new RuntimeException('Produk tidak ditemukan');
            }

            if ((int) $product->stok < $qty) {
                throw new RuntimeException('Stok tidak mencukupi');
            }

            $existing = DB::table('pos_order_items')
                ->lockForUpdate()
                ->where('order_id', $orderId)
                ->where('product_id', $productId)
                ->where('status', 'active')
                ->first();

            $newQty = $qty + (int) ($existing->qty ?? 0);
            $unitPrice = (float) $product->harga;
            $lineSubtotal = round($newQty * $unitPrice, 2);

            if ($existing) {
                DB::table('pos_order_items')
                    ->where('id', $existing->id)
                    ->update([
                        'qty' => $newQty,
                        'unit_price' => $unitPrice,
                        'line_subtotal' => $lineSubtotal,
                        'notes' => $notes,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('pos_order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $productId,
                    'product_name_snapshot' => $product->nama_menu,
                    'unit_price' => $unitPrice,
                    'qty' => $newQty,
                    'line_subtotal' => $lineSubtotal,
                    'notes' => $notes,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $this->stockService->decrease($productId, $qty);
            $this->stockService->recordMovement(
                tenantId: $order->tenant_id ? (int) $order->tenant_id : null,
                outletId: $order->outlet_id ? (int) $order->outlet_id : null,
                productId: $productId,
                type: 'sale',
                delta: -$qty,
                orderId: $orderId,
                notes: 'Order item added',
                actor: $username
            );

            $totals = $this->recomputeOrderTotals($orderId);

            return [
                'order_id' => $orderId,
                'product_id' => $productId,
                'added_qty' => $qty,
                'totals' => $totals,
            ];
        });
    }

    public function updateItemQty(string $actor, int $orderId, int $productId, int $qty, string $notes = ''): array
    {
        return DB::transaction(function () use ($actor, $orderId, $productId, $qty, $notes): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid');
            }

            $item = DB::table('pos_order_items')
                ->lockForUpdate()
                ->where('order_id', $orderId)
                ->where('product_id', $productId)
                ->where('status', 'active')
                ->first();
            if (!$item) {
                throw new RuntimeException('Item order tidak ditemukan');
            }

            $product = DB::table('produk')->lockForUpdate()->where('id_menu', $productId)->first();
            if (!$product) {
                throw new RuntimeException('Produk tidak ditemukan');
            }

            $oldQty = (int) $item->qty;
            $delta = $qty - $oldQty;
            if ($delta > 0 && (int) $product->stok < $delta) {
                throw new RuntimeException('Stok tidak mencukupi');
            }
            if ($delta > 0) {
                $this->stockService->decrease($productId, $delta);
                $this->stockService->recordMovement(
                    tenantId: $order->tenant_id ? (int) $order->tenant_id : null,
                    outletId: $order->outlet_id ? (int) $order->outlet_id : null,
                    productId: $productId,
                    type: 'sale_adjust',
                    delta: -$delta,
                    orderId: $orderId,
                    notes: 'Adjust qty increase',
                    actor: $actor
                );
            } elseif ($delta < 0) {
                $restore = abs($delta);
                $this->stockService->increase($productId, $restore);
                $this->stockService->recordMovement(
                    tenantId: $order->tenant_id ? (int) $order->tenant_id : null,
                    outletId: $order->outlet_id ? (int) $order->outlet_id : null,
                    productId: $productId,
                    type: 'qty_reduce_restore',
                    delta: $restore,
                    orderId: $orderId,
                    notes: 'Adjust qty decrease',
                    actor: $actor
                );
            }

            $unitPrice = (float) $item->unit_price;
            $lineSubtotal = round($qty * $unitPrice, 2);
            DB::table('pos_order_items')->where('id', $item->id)->update([
                'qty' => $qty,
                'line_subtotal' => $lineSubtotal,
                'notes' => $notes,
                'updated_at' => now(),
            ]);

            return [
                'order_id' => $orderId,
                'product_id' => $productId,
                'old_qty' => $oldQty,
                'new_qty' => $qty,
                'totals' => $this->recomputeOrderTotals($orderId),
            ];
        });
    }

    public function cancelItem(string $actor, int $orderId, int $productId, string $reason = ''): array
    {
        return DB::transaction(function () use ($actor, $orderId, $productId, $reason): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid');
            }

            $item = DB::table('pos_order_items')
                ->lockForUpdate()
                ->where('order_id', $orderId)
                ->where('product_id', $productId)
                ->where('status', 'active')
                ->first();
            if (!$item) {
                throw new RuntimeException('Item order tidak ditemukan');
            }

            $qty = (int) $item->qty;
            $this->stockService->increase($productId, $qty);
            $this->stockService->recordMovement(
                tenantId: $order->tenant_id ? (int) $order->tenant_id : null,
                outletId: $order->outlet_id ? (int) $order->outlet_id : null,
                productId: $productId,
                type: 'item_cancel_restore',
                delta: $qty,
                orderId: $orderId,
                notes: $reason !== '' ? $reason : 'Cancel item',
                actor: $actor
            );

            DB::table('pos_order_items')->where('id', $item->id)->update([
                'status' => 'canceled',
                'notes' => $reason !== '' ? $reason : $item->notes,
                'updated_at' => now(),
            ]);

            return [
                'order_id' => $orderId,
                'product_id' => $productId,
                'canceled_qty' => $qty,
                'totals' => $this->recomputeOrderTotals($orderId),
            ];
        });
    }

    public function payOrder(
        string $actor,
        int $orderId,
        string $method,
        float $amount,
        string $referenceNo = ''
    ): array {
        return DB::transaction(function () use ($actor, $orderId, $method, $amount, $referenceNo): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order) {
                throw new RuntimeException('Order tidak ditemukan');
            }
            if (!$this->orderStateService->canTransition((string) $order->status, 'paid')) {
                throw new RuntimeException('Status order tidak valid untuk pembayaran');
            }

            $total = (float) $order->total_amount;
            if ($amount < $total) {
                throw new RuntimeException('Nominal pembayaran kurang');
            }

            $existingPaid = DB::table('pos_payments')->where('order_id', $orderId)->exists();
            if ($existingPaid) {
                throw new RuntimeException('Pembayaran order sudah tercatat');
            }

            DB::table('pos_payments')->insert([
                'tenant_id' => $order->tenant_id,
                'outlet_id' => $order->outlet_id,
                'shift_id' => $order->shift_id,
                'order_id' => $orderId,
                'method' => $method,
                'amount' => $amount,
                'reference_no' => $referenceNo,
                'paid_by' => $actor,
                'paid_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('pos_orders')
                ->where('id', $orderId)
                ->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'sync_version' => DB::raw('sync_version + 1'),
                    'updated_at' => now(),
                ]);

            return [
                'order_id' => $orderId,
                'total' => $total,
                'paid_amount' => $amount,
                'change' => round($amount - $total, 2),
                'paid_at' => now()->format('Y-m-d H:i:s'),
            ];
        });
    }

    public function cancelOrder(string $actor, int $orderId, string $reason = 'Canceled by user'): array
    {
        return DB::transaction(function () use ($actor, $orderId, $reason): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order) {
                throw new RuntimeException('Order tidak ditemukan');
            }
            if (!$this->orderStateService->canTransition((string) $order->status, 'canceled')) {
                throw new RuntimeException('Status order tidak valid untuk pembatalan');
            }

            $items = DB::table('pos_order_items')
                ->lockForUpdate()
                ->where('order_id', $orderId)
                ->where('status', 'active')
                ->get();

            foreach ($items as $item) {
                $this->stockService->increase((int) $item->product_id, (int) $item->qty);
                $this->stockService->recordMovement(
                    tenantId: $order->tenant_id ? (int) $order->tenant_id : null,
                    outletId: $order->outlet_id ? (int) $order->outlet_id : null,
                    productId: (int) $item->product_id,
                    type: 'cancel_restore',
                    delta: (int) $item->qty,
                    orderId: $orderId,
                    notes: 'Order canceled',
                    actor: $actor
                );
            }

            DB::table('pos_order_items')
                ->where('order_id', $orderId)
                ->where('status', 'active')
                ->update([
                    'status' => 'canceled',
                    'updated_at' => now(),
                ]);

            DB::table('pos_orders')->where('id', $orderId)->update([
                'status' => 'canceled',
                'canceled_at' => now(),
                'canceled_reason' => $reason,
                'sync_version' => DB::raw('sync_version + 1'),
                'updated_at' => now(),
            ]);

            return [
                'order_id' => $orderId,
                'canceled_at' => now()->format('Y-m-d H:i:s'),
                'reason' => $reason,
            ];
        });
    }

    public function transitionOrderStatus(string $actor, int $orderId, string $toStatus): array
    {
        return DB::transaction(function () use ($actor, $orderId, $toStatus): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order) {
                throw new RuntimeException('Order tidak ditemukan');
            }
            $from = (string) $order->status;
            if (!$this->orderStateService->canTransition($from, $toStatus)) {
                throw new RuntimeException("Transisi status tidak valid: {$from} -> {$toStatus}");
            }

            $updates = [
                'status' => $toStatus,
                'sync_version' => DB::raw('sync_version + 1'),
                'updated_at' => now(),
            ];
            if ($toStatus === 'paid') {
                $updates['paid_at'] = now();
                $this->calculateLoyaltyPoints($orderId);
                $this->deductRedeemedPoints($orderId);
            }
            if ($toStatus === 'canceled') {
                $updates['canceled_at'] = now();
            }
            DB::table('pos_orders')->where('id', $orderId)->update($updates);

            // ✅ Trigger Notifikasi WA jika pesanan sudah SIAP (ready for pickup)
            if ($toStatus === 'prepared') {
                try {
                    app(\App\Services\NotificationService::class)->notifyOrderReady($orderId);
                } catch (\Exception $ne) {
                    \Illuminate\Support\Facades\Log::warning("Gagal mengirim notifikasi WA: " . $ne->getMessage());
                }
            }

            return [
                'order_id' => $orderId,
                'from_status' => $from,
                'to_status' => $toStatus,
                'updated_by' => $actor,
                'updated_at' => now()->format('Y-m-d H:i:s'),
            ];
        });
    }

    public function moveOrderTable(string $actor, int $orderId, string $toTableCode): array
    {
        return DB::transaction(function () use ($actor, $orderId, $toTableCode): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid');
            }
            $table = DB::table('pos_tables')->where('table_code', strtoupper($toTableCode))->where('is_active', 1)->first();
            if (!$table) {
                throw new RuntimeException('Meja tujuan tidak ditemukan');
            }
            DB::table('pos_orders')->where('id', $orderId)->update([
                'table_id' => (int) $table->id,
                'updated_at' => now(),
                'sync_version' => DB::raw('sync_version + 1'),
            ]);

            return [
                'order_id' => $orderId,
                'to_table_code' => strtoupper($toTableCode),
                'updated_by' => $actor,
            ];
        });
    }

    public function mergeOrders(string $actor, int $sourceOrderId, int $targetOrderId): array
    {
        return DB::transaction(function () use ($actor, $sourceOrderId, $targetOrderId): array {
            $source = DB::table('pos_orders')->lockForUpdate()->where('id', $sourceOrderId)->first();
            $target = DB::table('pos_orders')->lockForUpdate()->where('id', $targetOrderId)->first();
            if (!$source || !$target) {
                throw new RuntimeException('Order merge tidak ditemukan');
            }
            if (in_array($source->status, ['paid', 'canceled'], true) || in_array($target->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order paid/canceled tidak bisa merge');
            }

            $items = DB::table('pos_order_items')->lockForUpdate()
                ->where('order_id', $sourceOrderId)->where('status', 'active')->get();

            foreach ($items as $item) {
                $targetItem = DB::table('pos_order_items')->lockForUpdate()
                    ->where('order_id', $targetOrderId)
                    ->where('product_id', (int) $item->product_id)
                    ->where('status', 'active')
                    ->first();
                if ($targetItem) {
                    $newQty = (int) $targetItem->qty + (int) $item->qty;
                    DB::table('pos_order_items')->where('id', $targetItem->id)->update([
                        'qty' => $newQty,
                        'line_subtotal' => round($newQty * (float) $targetItem->unit_price, 2),
                        'updated_at' => now(),
                    ]);
                    DB::table('pos_order_items')->where('id', $item->id)->update([
                        'status' => 'moved',
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('pos_order_items')->where('id', $item->id)->update([
                        'order_id' => $targetOrderId,
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::table('pos_orders')->where('id', $sourceOrderId)->update([
                'status' => 'canceled',
                'canceled_reason' => 'Merged to #' . $targetOrderId,
                'canceled_at' => now(),
                'updated_at' => now(),
            ]);

            $targetTotals = $this->recomputeOrderTotals($targetOrderId);

            return [
                'source_order_id' => $sourceOrderId,
                'target_order_id' => $targetOrderId,
                'target_totals' => $targetTotals,
                'updated_by' => $actor,
            ];
        });
    }

    public function splitOrder(string $actor, int $orderId, array $items): array
    {
        return DB::transaction(function () use ($actor, $orderId, $items): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid');
            }
            $new = $this->createOrder(
                source: (string) $order->source,
                createdBy: $actor,
                tableId: $order->table_id ? (int) $order->table_id : null,
                notes: 'Split from #' . $orderId,
                tenantId: $order->tenant_id ? (int) $order->tenant_id : null,
                outletId: $order->outlet_id ? (int) $order->outlet_id : null,
                shiftId: $order->shift_id ? (int) $order->shift_id : null
            );
            $newOrderId = (int) $new['order_id'];

            foreach ($items as $it) {
                $pid = (int) ($it['product_id'] ?? 0);
                $qty = (int) ($it['qty'] ?? 0);
                if ($pid < 1 || $qty < 1) {
                    throw new RuntimeException('Item split tidak valid');
                }
                $srcItem = DB::table('pos_order_items')->lockForUpdate()
                    ->where('order_id', $orderId)
                    ->where('product_id', $pid)
                    ->where('status', 'active')
                    ->first();
                if (!$srcItem || (int) $srcItem->qty < $qty) {
                    throw new RuntimeException('Qty split melebihi item sumber');
                }

                $remain = (int) $srcItem->qty - $qty;
                if ($remain === 0) {
                    DB::table('pos_order_items')->where('id', $srcItem->id)->update([
                        'status' => 'split',
                        'updated_at' => now(),
                    ]);
                } else {
                    DB::table('pos_order_items')->where('id', $srcItem->id)->update([
                        'qty' => $remain,
                        'line_subtotal' => round($remain * (float) $srcItem->unit_price, 2),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('pos_order_items')->insert([
                    'tenant_id' => $order->tenant_id,
                    'order_id' => $newOrderId,
                    'product_id' => $pid,
                    'product_name_snapshot' => $srcItem->product_name_snapshot,
                    'unit_price' => $srcItem->unit_price,
                    'qty' => $qty,
                    'line_subtotal' => round($qty * (float) $srcItem->unit_price, 2),
                    'notes' => 'Split from #' . $orderId,
                    'status' => 'active',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $sourceTotals = $this->recomputeOrderTotals($orderId);
            $newTotals = $this->recomputeOrderTotals($newOrderId);

            return [
                'source_order_id' => $orderId,
                'new_order_id' => $newOrderId,
                'source_totals' => $sourceTotals,
                'new_totals' => $newTotals,
                'updated_by' => $actor,
            ];
        });
    }

    public function validateVoucher(string $code, float $subtotal): array
    {
        $voucher = DB::table('pos_vouchers')
            ->where('code', $code)
            ->where('is_active', 1)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$voucher) {
            throw new RuntimeException('Kode voucher tidak valid atau sudah kedaluwarsa');
        }

        if ($voucher->usage_limit !== null && $voucher->usage_count >= $voucher->usage_limit) {
            throw new RuntimeException('Voucher ini sudah mencapai batas penggunaan');
        }

        if ($subtotal < $voucher->min_order_amount) {
            throw new RuntimeException('Minimal order untuk voucher ini adalah ' . number_format($voucher->min_order_amount, 0, ',', '.'));
        }

        $discount = 0;
        if ($voucher->type === 'percent') {
            $discount = ($subtotal * ($voucher->value / 100));
            if ($voucher->max_discount_amount !== null && $discount > $voucher->max_discount_amount) {
                $discount = $voucher->max_discount_amount;
            }
        } else {
            $discount = (float) $voucher->value;
        }

        return [
            'id' => $voucher->id,
            'code' => $voucher->code,
            'name' => $voucher->name,
            'type' => $voucher->type,
            'value' => (float) $voucher->value,
            'discount_amount' => round($discount, 2),
        ];
    }

    public function applyVoucher(int $orderId, string $code): array
    {
        return DB::transaction(function () use ($orderId, $code): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid untuk voucher');
            }

            $voucher = DB::table('pos_vouchers')
                ->where('code', $code)
                ->where('is_active', 1)
                ->where(function($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->first();

            if (!$voucher) {
                throw new RuntimeException('Kode voucher tidak valid atau sudah kedaluwarsa');
            }

            if ($voucher->usage_limit !== null && $voucher->usage_count >= $voucher->usage_limit) {
                throw new RuntimeException('Voucher ini sudah mencapai batas penggunaan');
            }

            $subtotal = (float) DB::table('pos_order_items')
                ->where('order_id', $orderId)
                ->where('status', 'active')
                ->sum('line_subtotal');

            if ($subtotal < $voucher->min_order_amount) {
                throw new RuntimeException('Minimal order untuk voucher ini adalah ' . $voucher->min_order_amount);
            }

            $discount = 0;
            if ($voucher->type === 'percent') {
                $discount = ($subtotal * ($voucher->value / 100));
                if ($voucher->max_discount_amount !== null && $discount > $voucher->max_discount_amount) {
                    $discount = $voucher->max_discount_amount;
                }
            } else {
                $discount = (float) $voucher->value;
            }

            DB::table('pos_orders')->where('id', $orderId)->update([
                'voucher_id' => $voucher->id,
                'voucher_code' => $code,
                'discount_amount' => $discount,
                'updated_at' => now(),
            ]);

            DB::table('pos_vouchers')->where('id', $voucher->id)->increment('usage_count');

            $totals = $this->recomputeOrderTotals($orderId);

            return [
                'order_id' => $orderId,
                'voucher_code' => $code,
                'discount_amount' => $discount,
                'totals' => $totals
            ];
        });
    }

    public function applyMember(int $orderId, string $phone): array
    {
        return DB::transaction(function () use ($orderId, $phone): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid untuk member');
            }

            $member = DB::table('customers')->where('phone', $phone)->first();
            if (!$member) {
                throw new RuntimeException('Member tidak ditemukan');
            }

            DB::table('pos_orders')->where('id', $orderId)->update([
                'member_id' => $member->id,
                'updated_at' => now(),
            ]);

            return [
                'order_id' => $orderId,
                'member' => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'phone' => $member->phone,
                ]
            ];
        });
    }

    protected function calculateLoyaltyPoints(int $orderId): void
    {
        $order = DB::table('pos_orders')->where('id', $orderId)->first();
        if (!$order || !$order->member_id) return;

        // Formula: 1 poin per Rp 1.000 (Subtotal)
        $points = floor((float)$order->total_amount / 1000);
        if ($points < 1) return;

        $exists = DB::table('customer_points')
            ->where('customer_id', $order->member_id)
            ->where('tenant_id', $order->tenant_id)
            ->exists();

        if ($exists) {
            DB::table('customer_points')
                ->where('customer_id', $order->member_id)
                ->where('tenant_id', $order->tenant_id)
                ->increment('points', $points, ['updated_at' => now()]);
        } else {
            DB::table('customer_points')->insert([
                'customer_id' => (int) $order->member_id,
                'tenant_id' => (int) $order->tenant_id,
                'points' => $points,
                'updated_at' => now(),
            ]);
        }

        // Record transaction
        DB::table('customer_transactions')->insert([
            'customer_id' => (int) $order->member_id,
            'tenant_id' => (int) $order->tenant_id,
            'order_id' => $orderId,
            'type' => 'earn',
            'amount' => $points,
            'description' => 'Points earned from Order #' . $order->order_no,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function deductRedeemedPoints(int $orderId): void
    {
        $order = DB::table('pos_orders')->where('id', $orderId)->first();
        if (!$order || !$order->member_id || $order->redeem_points <= 0) return;

        DB::table('customer_points')
            ->where('customer_id', $order->member_id)
            ->where('tenant_id', $order->tenant_id)
            ->decrement('points', $order->redeem_points, ['updated_at' => now()]);

        // Record transaction
        DB::table('customer_transactions')->insert([
            'customer_id' => (int) $order->member_id,
            'tenant_id' => (int) $order->tenant_id,
            'order_id' => $orderId,
            'type' => 'redeem',
            'points_delta' => -$order->redeem_points,
            'ref_type' => 'order',
            'ref_id' => $orderId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function redeemPoints(int $orderId, int $points): array
    {
        return DB::transaction(function () use ($orderId, $points): array {
            $order = DB::table('pos_orders')->lockForUpdate()->where('id', $orderId)->first();
            if (!$order || in_array($order->status, ['paid', 'canceled'], true)) {
                throw new RuntimeException('Order tidak valid untuk penukaran poin');
            }
            if (!$order->member_id) {
                throw new RuntimeException('Order harus terhubung dengan Member sebelum menukar poin');
            }

            // Check point balance
            $balance = DB::table('customer_points')
                ->where('customer_id', $order->member_id)
                ->where('tenant_id', $order->tenant_id)
                ->value('points') ?? 0;

            if ($balance < $points) {
                throw new RuntimeException("Saldo poin tidak mencukupi (Tersedia: {$balance})");
            }

            // Conversion rate: 1 point = Rp 1
            $discount = (float) $points;

            // Discount cannot exceed subtotal (assuming subtotal exists or use total_amount)
            $maxDiscount = (float) $order->subtotal;
            if ($discount > $maxDiscount) {
                $discount = $maxDiscount;
                $points = (int) $discount; // Adjust points to max possible
            }

            $newTotal = ($order->subtotal + $order->tax_amount) - ($order->discount_amount ?? 0) - $discount;

            DB::table('pos_orders')->where('id', $orderId)->update([
                'redeem_points' => $points,
                'points_discount' => $discount,
                'total_amount' => $newTotal,
                'updated_at' => now(),
                'sync_version' => DB::raw('sync_version + 1'),
            ]);

            return [
                'order_id' => $orderId,
                'redeemed_points' => $points,
                'discount_amount' => $discount,
                'new_total' => $newTotal
            ];
        });
    }

    public function receiptData(int $orderId): array
    {
        $order = DB::table('pos_orders')
            ->leftJoin('customers', 'customers.id', '=', 'pos_orders.member_id')
            ->select('pos_orders.*', 'customers.name as member_name')
            ->where('pos_orders.id', $orderId)
            ->first();

        if (!$order) {
            throw new RuntimeException('Order tidak ditemukan');
        }
        $items = DB::table('pos_order_items')->where('order_id', $orderId)->where('status', 'active')->orderBy('id')->get();
        $payments = DB::table('pos_payments')->where('order_id', $orderId)->orderBy('id')->get();
        return [
            'order' => $order,
            'items' => $items,
            'payments' => $payments,
            'printed_at' => now()->format('Y-m-d H:i:s'),
        ];
    }
}
