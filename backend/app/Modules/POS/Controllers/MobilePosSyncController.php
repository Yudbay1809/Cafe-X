<?php

namespace App\Modules\POS\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MobilePosSyncController extends Controller
{
    /**
     * Endpoint: GET /api/v1/sync/master
     * Mengunduh Master Menu (Produk, Kategori) untuk keperluan Local DB Kasir (Offline).
     */
    public function syncMaster(Request $request)
    {
        // 1. Ambil seluruh Kategori Aktif
        $categories = DB::table('categories')->select('id', 'name')->get();
        
        // 2. Ambil seluruh Produk Aktif
        $products = DB::table('products')
            ->select('id', 'category_id', 'name', 'price', 'image', 'is_active')
            ->where('is_active', 1)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Master data successfully retrieved',
            'data' => [
                'categories' => $categories,
                'products' => $products
            ]
        ]);
    }

    /**
     * Endpoint: POST /api/v1/sync/pos
     * Menerima sinkronisasi transaksi offline secara massal dari Mobile POS.
     */
    public function syncPos(Request $request)
    {
        $payload = $request->input('orders', []);
        
        if (empty($payload)) {
            return response()->json(['success' => false, 'message' => 'No orders provided']);
        }

        $processedCount = 0;
        $failedCount = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($payload as $offlineOrder) {
                // Conflict Resolution: Cek apakah Order ID Offline ini sudah pernah masuk sebelumnya
                $exists = DB::table('pos_orders')
                    ->where('offline_id', $offlineOrder['id'])
                    ->exists();

                if ($exists) {
                    $failedCount++;
                    $errors[] = "Order {$offlineOrder['id']} already synced.";
                    continue; // Skip jika sudah ada (Mencegah double posting)
                }

                // 1. Insert ke tabel pos_orders
                $orderId = DB::table('pos_orders')->insertGetId([
                    'offline_id' => $offlineOrder['id'],
                    'tenant_id' => 1, // Default tenant
                    'outlet_id' => 1, // Default outlet
                    'order_type' => 'dine_in',
                    'status' => 'paid',
                    'payment_status' => 'paid',
                    'payment_method' => $offlineOrder['payment_method'] ?? 'cash',
                    'subtotal_amount' => $offlineOrder['total'],
                    'tax_amount' => 0,
                    'total_amount' => $offlineOrder['total'],
                    'created_at' => $offlineOrder['created_at'],
                    'updated_at' => now(),
                ]);

                // 2. Insert Items & Kurangi Stok (Conflict Resolution via Database Transactions)
                foreach ($offlineOrder['items'] as $item) {
                    DB::table('pos_order_items')->insert([
                        'order_id' => $orderId,
                        'product_id' => $item['product_id'],
                        'qty' => $item['qty'],
                        'price' => $item['price'],
                        'subtotal' => $item['qty'] * $item['price'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $processedCount++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully synced {$processedCount} orders. Failed: {$failedCount}.",
                'data' => [
                    'processed' => $processedCount,
                    'failed' => $failedCount,
                    'errors' => $errors
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Offline POS Sync Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Sync failed due to server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Endpoint: GET /api/v1/sync/online-orders
     * Mengambil pesanan baru yang masuk dari Customer QR Portal.
     */
    public function getOnlineOrders(Request $request)
    {
        // Simulasi mengambil pesanan yang berstatus 'pending' dari QR Customer
        $orders = DB::table('pos_orders')
            ->where('order_type', 'qr_order')
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        $data = [];
        foreach ($orders as $order) {
            $items = DB::table('pos_order_items')
                ->where('order_id', $order->id)
                ->get();
            $data[] = [
                'id' => $order->id,
                'table_number' => 'Meja ' . rand(1, 10), // Simulasi nomor meja
                'total' => $order->total_amount,
                'created_at' => $order->created_at,
                'items' => $items
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Endpoint: POST /api/v1/sync/expenses
     * Sinkronisasi pengeluaran kas kecil (petty cash) dari Mobile POS.
     */
    public function syncExpenses(Request $request)
    {
        $expenses = $request->input('expenses', []);
        
        foreach ($expenses as $expense) {
            DB::table('petty_cash_logs')->insert([
                'outlet_id' => 1,
                'description' => $expense['description'],
                'amount' => $expense['amount'],
                'category' => 'expense',
                'created_at' => $expense['created_at'],
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => count($expenses) . ' expenses synced'
        ]);
    }
}
