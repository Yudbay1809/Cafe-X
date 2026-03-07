<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ProductUpsertRequest;
use App\Services\AuditService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $q = trim((string) $request->query('q', ''));
        $category = trim((string) $request->query('category', ''));
        $active = $request->query('active', null);

        $query = DB::table('produk')
            ->select(['id_menu', 'nama_menu', 'jenis_menu', 'stok', 'harga', 'gambar', 'is_active'])
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->when($q !== '', fn ($qb) => $qb->where('nama_menu', 'like', "%{$q}%"))
            ->when($category !== '', fn ($qb) => $qb->where('jenis_menu', $category))
            ->when($active !== null, fn ($qb) => $qb->where('is_active', (int) ((bool) $active)))
            ->orderByDesc('id_menu');

        $items = $query->get();
        return $this->ok(['items' => $items->all()]);
    }

    public function store(ProductUpsertRequest $request)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);

        $id = DB::table('produk')->insertGetId([
            'tenant_id' => $tenantId ?: null,
            'nama_menu' => $data['nama_menu'],
            'jenis_menu' => $data['jenis_menu'] ?? null,
            'stok' => (int) ($data['stok'] ?? 0),
            'harga' => (float) $data['harga'],
            'gambar' => $data['gambar'] ?? null,
            'is_active' => array_key_exists('is_active', $data) ? (int) ((bool) $data['is_active']) : 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        app(AuditService::class)->log(
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'product.create',
            entityType: 'product',
            entityId: (string) $id,
            payload: $data
        );

        return $this->ok(['id_menu' => $id], 'Product created');
    }

    public function update(ProductUpsertRequest $request, int $id)
    {
        $data = $request->validated();
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);

        $product = DB::table('produk')
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->where('id_menu', $id)
            ->first();
        if (!$product) {
            return $this->fail('Product not found', 404);
        }

        DB::table('produk')
            ->where('id_menu', $id)
            ->update([
                'nama_menu' => $data['nama_menu'],
                'jenis_menu' => $data['jenis_menu'] ?? null,
                'stok' => (int) ($data['stok'] ?? 0),
                'harga' => (float) $data['harga'],
                'gambar' => $data['gambar'] ?? null,
                'is_active' => array_key_exists('is_active', $data) ? (int) ((bool) $data['is_active']) : (int) ($product->is_active ?? 1),
                'updated_at' => now(),
            ]);

        app(AuditService::class)->log(
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'product.update',
            entityType: 'product',
            entityId: (string) $id,
            payload: $data
        );

        return $this->ok(['id_menu' => $id], 'Product updated');
    }

    public function destroy(Request $request, int $id)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);

        $product = DB::table('produk')
            ->when($tenantId > 0, fn ($qb) => $qb->where('tenant_id', $tenantId))
            ->where('id_menu', $id)
            ->first();
        if (!$product) {
            return $this->fail('Product not found', 404);
        }

        DB::table('produk')->where('id_menu', $id)->update([
            'is_active' => 0,
            'updated_at' => now(),
        ]);

        app(AuditService::class)->log(
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            actor: (string) ($auth['username'] ?? 'system'),
            eventType: 'product.deactivate',
            entityType: 'product',
            entityId: (string) $id,
            payload: ['is_active' => 0]
        );

        return $this->ok(['id_menu' => $id], 'Product deactivated');
    }
}
