<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $event = trim((string) $request->query('event', ''));
        $actor = trim((string) $request->query('actor', ''));
        $entity = trim((string) $request->query('entity', ''));
        $dateFrom = trim((string) $request->query('from', ''));
        $dateTo = trim((string) $request->query('to', ''));
        $limit = (int) ($request->query('limit') ?? 50);
        $limit = $limit > 0 && $limit <= 200 ? $limit : 50;
        $page = (int) ($request->query('page') ?? 1);
        $page = $page > 0 ? $page : 1;
        $offset = ($page - 1) * $limit;

        $base = DB::table('audit_logs')
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->when($outletId > 0, fn ($qb) => $qb->where('outlet_id', $outletId))
            ->when($event !== '', fn ($qb) => $qb->where('event_type', $event))
            ->when($actor !== '', fn ($qb) => $qb->where('actor', $actor))
            ->when($entity !== '', fn ($qb) => $qb->where('entity_type', $entity))
            ->when($dateFrom !== '', fn ($qb) => $qb->where('created_at', '>=', $dateFrom))
            ->when($dateTo !== '', fn ($qb) => $qb->where('created_at', '<=', $dateTo));

        $total = (int) (clone $base)->count('id');

        $items = (clone $base)
            ->orderByDesc('id')
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
}
