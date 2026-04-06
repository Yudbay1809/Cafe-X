<?php

namespace App\Modules\Inventory\Controllers;

use App\Support\ApiResponse;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController
{
    use ApiResponse;

    public function __construct(private readonly StockService $stock)
    {
    }

    public function index(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $from = $request->query('from');
        $to = $request->query('to');
        $limit = (int) ($request->query('limit') ?? 50);
        $limit = $limit > 0 && $limit <= 200 ? $limit : 50;
        $page = (int) ($request->query('page') ?? 1);
        $page = $page > 0 ? $page : 1;
        $offset = ($page - 1) * $limit;

        $base = DB::table('pos_stock_movements')
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->when($outletId > 0, fn ($qb) => $qb->where('outlet_id', $outletId))
            ->when($from, fn ($qb) => $qb->whereDate('created_at', '>=', $from))
            ->when($to, fn ($qb) => $qb->whereDate('created_at', '<=', $to));

        $total = (int) (clone $base)->count('id');
        $items = (clone $base)->orderByDesc('id')->offset($offset)->limit($limit)->get();

        return $this->ok([
            'items' => $items->all(),
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
        ]);
    }

    public function adjust(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|min:1',
            'qty' => 'required|integer|min:1',
            'direction' => 'required|in:in,out',
            'notes' => 'nullable|string|max:200',
        ]);

        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        $tenantId = $auth['tenant_id'] ?? null;
        $outletId = $auth['outlet_id'] ?? null;

        $delta = (int) $data['qty'];
        if ($data['direction'] === 'out') {
            $this->stock->decrease((int) $data['product_id'], $delta);
            $delta = -$delta;
        } else {
            $this->stock->increase((int) $data['product_id'], $delta);
        }

        $this->stock->recordMovement(
            tenantId: $tenantId ? (int) $tenantId : null,
            outletId: $outletId ? (int) $outletId : null,
            productId: (int) $data['product_id'],
            type: 'adjustment',
            delta: $delta,
            orderId: null,
            notes: (string) ($data['notes'] ?? ''),
            actor: $actor
        );

        return $this->ok(['product_id' => (int) $data['product_id'], 'delta' => $delta], 'Stock adjusted');
    }
}

