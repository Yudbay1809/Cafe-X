<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\OutletBrandUpdateRequest;
use App\Services\AuditService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutletController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $query = DB::table('outlets')
            ->select(['id', 'name', 'code', 'timezone', 'brand_color', 'brand_name', 'contact_phone', 'is_active'])
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->orderBy('name');
        $items = $query->get();
        return $this->ok(['items' => $items->all()]);
    }

    public function updateBrand(OutletBrandUpdateRequest $request, int $id)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $data = $request->validated();

        $outlet = DB::table('outlets')
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->where('id', $id)
            ->first();
        if (!$outlet) {
            return $this->fail('Outlet not found', 404);
        }

        DB::table('outlets')->where('id', $id)->update([
            'brand_color' => $data['brand_color'] ?? $outlet->brand_color,
            'brand_name' => $data['brand_name'] ?? $outlet->brand_name,
            'contact_phone' => $data['contact_phone'] ?? $outlet->contact_phone,
            'updated_at' => now(),
        ]);

        app(AuditService::class)->log(
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'outlet.brand.update',
            entityType: 'outlet',
            entityId: (string) $id,
            payload: $data
        );

        return $this->ok(['id' => $id], 'Outlet brand updated');
    }
}
