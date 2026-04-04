<?php

namespace App\Modules\Product\Services;

use Illuminate\Support\Facades\DB;

class ProductService
{
    public function list(?int $tenantId = null): array
    {
        $query = DB::table('produk')
            ->select(['id_menu', 'nama_menu', 'jenis_menu', 'stok', 'harga', 'gambar', 'is_active'])
            ->when($tenantId, fn ($qb) => $qb->where('tenant_id', $tenantId));

        return $query->orderByDesc('id_menu')->get()->all();
    }
}
