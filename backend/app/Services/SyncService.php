<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;
use Throwable;

class SyncService
{
    public function pull(?int $tenantId, ?string $cursor = null): array
    {
        $productsQ = DB::table('produk')->select(['id_menu', 'nama_menu', 'jenis_menu', 'stok', 'harga', 'gambar', 'updated_at']);
        $tablesQ = DB::table('pos_tables')->select(['id', 'table_code', 'table_name', 'qr_token', 'is_active', 'updated_at']);

        if ($tenantId) {
            $productsQ->where('tenant_id', $tenantId);
            $tablesQ->where('tenant_id', $tenantId);
        }
        if ($cursor) {
            $productsQ->where('updated_at', '>', $cursor);
            $tablesQ->where('updated_at', '>', $cursor);
        }

        $settings = DB::table('pos_settings')->pluck('setting_value', 'setting_key')->toArray();

        return [
            'products' => $productsQ->orderBy('id_menu')->get(),
            'tables' => $tablesQ->orderBy('table_code')->get(),
            'settings' => $settings,
            'sync_cursor' => now()->format('Y-m-d H:i:s'),
        ];
    }

    public function push(string $actor, ?int $tenantId, ?int $outletId, array $events): array
    {
        $results = [];
        $pos = app(PosService::class);
        foreach ($events as $idx => $event) {
            $type = trim((string) ($event['type'] ?? ''));
            $payload = is_array($event['payload'] ?? null) ? $event['payload'] : [];
            try {
                if ($type === 'create_order') {
                    $source = strtoupper((string) ($payload['source'] ?? 'POS'));
                    $tableCode = strtoupper(trim((string) ($payload['table_code'] ?? '')));
                    $notes = trim((string) ($payload['notes'] ?? ''));
                    $tableId = null;
                    if ($tableCode !== '') {
                        $table = DB::table('pos_tables')->where('table_code', $tableCode)->first();
                        $tableId = $table?->id;
                    }
                    $result = $pos->createOrder($source, $actor, $tableId ? (int) $tableId : null, $notes);
                    $results[] = ['index' => $idx, 'ok' => true, 'type' => $type, 'result' => $result];
                } elseif ($type === 'add_item') {
                    $orderId = (int) ($payload['order_id'] ?? 0);
                    $productId = (int) ($payload['product_id'] ?? 0);
                    $qty = (int) ($payload['qty'] ?? 0);
                    if ($orderId < 1 || $productId < 1 || $qty < 1) {
                        $results[] = [
                            'index' => $idx,
                            'ok' => true,
                            'type' => $type,
                            'result' => ['skipped' => true, 'reason' => 'missing_order_id'],
                        ];
                    } else {
                        $result = $pos->addItem($actor, $orderId, $productId, $qty, (string) ($payload['notes'] ?? ''));
                        $results[] = ['index' => $idx, 'ok' => true, 'type' => $type, 'result' => $result];
                    }
                } elseif ($type === 'pay_order') {
                    $orderId = (int) ($payload['order_id'] ?? 0);
                    $method = strtolower((string) ($payload['method'] ?? 'cash'));
                    $amount = (float) ($payload['amount'] ?? 0);
                    if ($orderId < 1 || $amount <= 0) {
                        throw new RuntimeException('payload pay_order invalid');
                    }
                    $pos->payOrder($actor, $orderId, $method, $amount, (string) ($payload['reference_no'] ?? ''));
                    $results[] = ['index' => $idx, 'ok' => true, 'type' => $type, 'result' => ['order_id' => $orderId]];
                } elseif ($type === 'update_item_qty') {
                    $result = $pos->updateItemQty(
                        actor: $actor,
                        orderId: (int) ($payload['order_id'] ?? 0),
                        productId: (int) ($payload['product_id'] ?? 0),
                        qty: (int) ($payload['qty'] ?? 0),
                        notes: (string) ($payload['notes'] ?? '')
                    );
                    $results[] = ['index' => $idx, 'ok' => true, 'type' => $type, 'result' => $result];
                } elseif ($type === 'cancel_item') {
                    $result = $pos->cancelItem(
                        actor: $actor,
                        orderId: (int) ($payload['order_id'] ?? 0),
                        productId: (int) ($payload['product_id'] ?? 0),
                        reason: (string) ($payload['reason'] ?? '')
                    );
                    $results[] = ['index' => $idx, 'ok' => true, 'type' => $type, 'result' => $result];
                } elseif ($type === 'status_order' || $type === 'update_order_status') {
                    $orderId = (int) ($payload['order_id'] ?? 0);
                    if ($orderId < 1) {
                        $results[] = [
                            'index' => $idx,
                            'ok' => true,
                            'type' => $type,
                            'result' => ['skipped' => true, 'reason' => 'missing_order_id'],
                        ];
                    } else {
                        $result = $pos->transitionOrderStatus(
                            actor: $actor,
                            orderId: $orderId,
                            toStatus: (string) ($payload['status'] ?? '')
                        );
                        $results[] = ['index' => $idx, 'ok' => true, 'type' => $type, 'result' => $result];
                    }
                } else {
                    $results[] = ['index' => $idx, 'ok' => false, 'message' => 'unsupported type: ' . $type];
                }
            } catch (Throwable $e) {
                $results[] = ['index' => $idx, 'ok' => false, 'message' => $e->getMessage()];
            }
        }

        $ok = 0;
        foreach ($results as $r) {
            if (!empty($r['ok'])) {
                $ok++;
            }
        }
        $status = $ok === count($results) ? 'ok' : 'failed';

        DB::table('pos_sync_logs')->insert([
            'tenant_id' => $tenantId,
            'outlet_id' => $outletId,
            'device_id' => null,
            'username' => $actor,
            'event_type' => 'sync_push',
            'payload_json' => json_encode(['events_count' => count($events)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'status' => $status,
            'message' => 'Processed ' . count($events) . ' events',
            'created_at' => now(),
        ]);

        return [
            'processed' => count($results),
            'success' => $ok,
            'failed' => count($results) - $ok,
            'results' => $results,
        ];
    }
}
