<?php

namespace App\Modules\Customer\Controllers;

use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController
{
    use ApiResponse;

    public function index(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $q = trim((string) $request->query('q', ''));
        $limit = (int) ($request->query('limit') ?? 50);
        $limit = $limit > 0 && $limit <= 200 ? $limit : 50;
        $page = (int) ($request->query('page') ?? 1);
        $page = $page > 0 ? $page : 1;
        $offset = ($page - 1) * $limit;

        $base = DB::table('customers')
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->when($q !== '', fn ($qb) => $qb->where('name', 'like', "%{$q}%"));

        $total = (int) (clone $base)->count('id');
        $items = (clone $base)->orderByDesc('id')->offset($offset)->limit($limit)->get();

        return $this->ok([
            'items' => $items->all(),
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'phone' => 'nullable|string|max:40',
            'email' => 'nullable|email|max:120',
        ]);
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);

        $id = DB::table('customers')->insertGetId([
            'tenant_id' => $tenantId ?: null,
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->ok(['id' => $id], 'Customer created');
    }
}

