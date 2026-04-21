<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProcurementController extends BaseApiController
{
    // ─── SUPPLIERS ───────────────────────────────────────────────

    public function supplierIndex(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id', 1);
        $q = $request->query('q');

        $query = DB::table('suppliers')->where('tenant_id', $tenantId);
        if ($q) $query->where('name', 'like', "%{$q}%");

        $items = $query->orderBy('name')->get();
        return $this->ok(['items' => $items]);
    }

    public function supplierStore(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'phone'          => 'nullable|string|max:30',
            'email'          => 'nullable|email|max:100',
            'address'        => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:100',
            'payment_term'   => 'nullable|in:cash,net7,net14,net30',
        ]);
        $tenantId = $request->attributes->get('tenant_id', 1);

        $id = DB::table('suppliers')->insertGetId([
            ...$data,
            'tenant_id'    => $tenantId,
            'is_active'    => 1,
            'payment_term' => $data['payment_term'] ?? 'cash',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        return $this->ok(['id' => $id], 'Supplier berhasil ditambahkan');
    }

    public function supplierUpdate(Request $request, int $id)
    {
        $data = $request->validate([
            'name'           => 'sometimes|required|string|max:100',
            'phone'          => 'nullable|string|max:30',
            'email'          => 'nullable|email|max:100',
            'address'        => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:100',
            'payment_term'   => 'nullable|in:cash,net7,net14,net30',
            'is_active'      => 'nullable|boolean',
        ]);
        DB::table('suppliers')->where('id', $id)->update([...$data, 'updated_at' => now()]);
        return $this->ok([], 'Supplier diperbarui');
    }

    public function supplierDestroy(int $id)
    {
        $hasPO = DB::table('purchase_orders')->where('supplier_id', $id)->exists();
        if ($hasPO) {
            return $this->fail('Supplier tidak dapat dihapus karena sudah memiliki Purchase Order', 409);
        }
        DB::table('suppliers')->where('id', $id)->delete();
        return $this->ok([], 'Supplier dihapus');
    }

    // ─── PURCHASE ORDERS ─────────────────────────────────────────

    public function poIndex(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id', 1);
        $status = $request->query('status');

        $query = DB::table('purchase_orders as po')
            ->leftJoin('suppliers as s', 's.id', '=', 'po.supplier_id')
            ->select('po.*', 's.name as supplier_name')
            ->where('po.tenant_id', $tenantId);

        if ($status) $query->where('po.status', $status);

        $items = $query->orderByDesc('po.id')->get();
        return $this->ok(['items' => $items]);
    }

    public function poStore(Request $request)
    {
        $data = $request->validate([
            'supplier_id'   => 'required|integer',
            'outlet_id'     => 'nullable|integer',
            'expected_date' => 'nullable|date',
            'notes'         => 'nullable|string|max:255',
            'items'         => 'required|array|min:1',
            'items.*.ingredient_id'   => 'required|integer',
            'items.*.qty'             => 'required|numeric|min:0.001',
            'items.*.unit'            => 'nullable|string|max:30',
            'items.*.unit_price'      => 'nullable|numeric|min:0',
        ]);

        $tenantId = $request->attributes->get('tenant_id', 1);
        $actor    = $request->attributes->get('username', 'system');

        return DB::transaction(function () use ($data, $tenantId, $actor) {
            $poNo = 'PO-' . date('ymd') . '-' . str_pad(
                DB::table('purchase_orders')->where('tenant_id', $tenantId)->count() + 1,
                4, '0', STR_PAD_LEFT
            );

            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += ($item['qty'] ?? 0) * ($item['unit_price'] ?? 0);
            }

            $poId = DB::table('purchase_orders')->insertGetId([
                'tenant_id'    => $tenantId,
                'outlet_id'    => $data['outlet_id'] ?? null,
                'supplier_id'  => $data['supplier_id'],
                'po_no'        => $poNo,
                'status'       => 'draft',
                'total_amount' => $totalAmount,
                'notes'        => $data['notes'] ?? null,
                'expected_date' => $data['expected_date'] ?? null,
                'created_by'   => $actor,
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            foreach ($data['items'] as $item) {
                $ingredient = DB::table('ingredients')->where('id', $item['ingredient_id'])->first();
                DB::table('purchase_order_items')->insert([
                    'purchase_order_id'         => $poId,
                    'ingredient_id'             => $item['ingredient_id'],
                    'ingredient_name_snapshot'  => $ingredient?->name ?? 'Unknown',
                    'qty'                       => $item['qty'],
                    'unit'                      => $item['unit'] ?? ($ingredient?->unit ?? 'pcs'),
                    'unit_price'                => $item['unit_price'] ?? 0,
                    'line_total'                => ($item['qty'] ?? 0) * ($item['unit_price'] ?? 0),
                    'created_at'                => now(),
                    'updated_at'                => now(),
                ]);
            }

            return $this->ok(['po_id' => $poId, 'po_no' => $poNo], 'Purchase Order berhasil dibuat');
        });
    }

    public function poShow(int $id)
    {
        $po = DB::table('purchase_orders as po')
            ->leftJoin('suppliers as s', 's.id', '=', 'po.supplier_id')
            ->select('po.*', 's.name as supplier_name', 's.phone as supplier_phone', 's.payment_term')
            ->where('po.id', $id)
            ->first();

        if (!$po) return $this->fail('PO tidak ditemukan', 404);

        $items = DB::table('purchase_order_items')->where('purchase_order_id', $id)->get();
        $receipts = DB::table('goods_receipts')->where('purchase_order_id', $id)->get();

        return $this->ok(['po' => $po, 'items' => $items, 'receipts' => $receipts]);
    }

    public function poUpdateStatus(Request $request, int $id)
    {
        $data = $request->validate(['status' => 'required|in:draft,sent,partial,received,canceled']);
        DB::table('purchase_orders')->where('id', $id)->update([
            'status'     => $data['status'],
            'updated_at' => now(),
        ]);
        return $this->ok([], 'Status PO diperbarui');
    }

    // ─── GOODS RECEIPTS ──────────────────────────────────────────

    public function grIndex(Request $request)
    {
        $tenantId = $request->attributes->get('tenant_id', 1);
        $items = DB::table('goods_receipts as gr')
            ->leftJoin('purchase_orders as po', 'po.id', '=', 'gr.purchase_order_id')
            ->leftJoin('suppliers as s', 's.id', '=', 'po.supplier_id')
            ->select('gr.*', 'po.po_no', 's.name as supplier_name')
            ->where('gr.tenant_id', $tenantId)
            ->orderByDesc('gr.id')
            ->get();
        return $this->ok(['items' => $items]);
    }

    public function grStore(Request $request)
    {
        $data = $request->validate([
            'purchase_order_id' => 'nullable|integer',
            'outlet_id'         => 'nullable|integer',
            'received_date'     => 'required|date',
            'notes'             => 'nullable|string|max:255',
            'items'             => 'required|array|min:1',
            'items.*.ingredient_id'  => 'required|integer',
            'items.*.qty_received'   => 'required|numeric|min:0.001',
            'items.*.qty_ordered'    => 'nullable|numeric|min:0',
            'items.*.unit'           => 'nullable|string|max:30',
            'items.*.unit_price'     => 'nullable|numeric|min:0',
        ]);

        $tenantId = $request->attributes->get('tenant_id', 1);
        $actor    = $request->attributes->get('username', 'system');

        return DB::transaction(function () use ($data, $tenantId, $actor) {
            $grNo = 'GR-' . date('ymd') . '-' . str_pad(
                DB::table('goods_receipts')->where('tenant_id', $tenantId)->count() + 1,
                4, '0', STR_PAD_LEFT
            );

            $grId = DB::table('goods_receipts')->insertGetId([
                'tenant_id'         => $tenantId,
                'outlet_id'         => $data['outlet_id'] ?? null,
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'gr_no'             => $grNo,
                'received_by'       => $actor,
                'received_date'     => $data['received_date'],
                'notes'             => $data['notes'] ?? null,
                'status'            => 'received',
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            foreach ($data['items'] as $item) {
                $ingredient = DB::table('ingredients')->where('id', $item['ingredient_id'])->first();
                if (!$ingredient) continue;

                DB::table('goods_receipt_items')->insert([
                    'goods_receipt_id'         => $grId,
                    'ingredient_id'            => $item['ingredient_id'],
                    'ingredient_name_snapshot' => $ingredient->name,
                    'qty_ordered'              => $item['qty_ordered'] ?? 0,
                    'qty_received'             => $item['qty_received'],
                    'unit'                     => $item['unit'] ?? $ingredient->unit,
                    'unit_price'               => $item['unit_price'] ?? 0,
                    'created_at'               => now(),
                    'updated_at'               => now(),
                ]);

                // ✅ Auto-increase ingredient stock
                DB::table('ingredients')
                    ->where('id', $item['ingredient_id'])
                    ->increment('stock', $item['qty_received']);
            }

            // Update PO status if linked
            if (!empty($data['purchase_order_id'])) {
                DB::table('purchase_orders')->where('id', $data['purchase_order_id'])
                    ->update(['status' => 'received', 'updated_at' => now()]);
            }

            return $this->ok(['gr_id' => $grId, 'gr_no' => $grNo], 'Barang berhasil diterima & stok diperbarui');
        });
    }

    public function grShow(int $id)
    {
        $gr = DB::table('goods_receipts as gr')
            ->leftJoin('purchase_orders as po', 'po.id', '=', 'gr.purchase_order_id')
            ->leftJoin('suppliers as s', 's.id', '=', 'po.supplier_id')
            ->select('gr.*', 'po.po_no', 's.name as supplier_name')
            ->where('gr.id', $id)->first();

        if (!$gr) return $this->fail('GR tidak ditemukan', 404);
        $items = DB::table('goods_receipt_items')->where('goods_receipt_id', $id)->get();
        return $this->ok(['gr' => $gr, 'items' => $items]);
    }
}
