<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class StockService
{
    public function decrease(int $productId, int $qty): void
    {
        $recipes = DB::table('recipes')->where('product_id', $productId)->get();
        if ($recipes->isNotEmpty()) {
            foreach ($recipes as $r) {
                DB::table('ingredients')->where('id', $r->ingredient_id)->update([
                    'stock' => DB::raw('stock - ' . ($r->qty * $qty))
                ]);
            }
        } else {
            DB::table('produk')->where('id_menu', $productId)->update(['stok' => DB::raw('stok - ' . $qty)]);
        }
    }

    public function increase(int $productId, int $qty): void
    {
        $recipes = DB::table('recipes')->where('product_id', $productId)->get();
        if ($recipes->isNotEmpty()) {
            foreach ($recipes as $r) {
                DB::table('ingredients')->where('id', $r->ingredient_id)->update([
                    'stock' => DB::raw('stock + ' . ($r->qty * $qty))
                ]);
            }
        } else {
            DB::table('produk')->where('id_menu', $productId)->update(['stok' => DB::raw('stok + ' . $qty)]);
        }
    }

    public function recordMovement(?int $tenantId, ?int $outletId, int $productId, string $type, int $delta, ?int $orderId, string $notes, string $actor): void
    {
        DB::table('pos_stock_movements')->insert([
            'tenant_id' => $tenantId,
            'outlet_id' => $outletId,
            'product_id' => $productId,
            'movement_type' => $type,
            'qty_delta' => $delta,
            'ref_order_id' => $orderId,
            'notes' => $notes,
            'created_by' => $actor,
            'created_at' => now(),
        ]);
    }
}

