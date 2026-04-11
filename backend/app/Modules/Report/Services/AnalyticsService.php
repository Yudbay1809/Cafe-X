<?php

namespace App\Modules\Report\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get multi-outlet summary
     */
    public function getMultiOutletSummary(?int $tenantId = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth()->toDateString();
        $endDate = $endDate ?? now()->endOfMonth()->toDateString();

        $outlets = DB::table('pos_outlets')
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->where('is_active', true)
            ->get();

        $summary = [];

        foreach ($outlets as $outlet) {
            $sales = $this->getOutletSales($outlet->id, $startDate, $endDate);
            $orders = $this->getOutletOrders($outlet->id, $startDate, $endDate);
            
            $summary[] = [
                'outlet_id' => $outlet->id,
                'outlet_name' => $outlet->outlet_name,
                'total_sales' => $sales['total'],
                'total_orders' => $orders['count'],
                'avg_order_value' => $orders['count'] > 0 ? round($sales['total'] / $orders['count'], 2) : 0,
                'paid_orders' => $orders['paid'],
                'canceled_orders' => $orders['canceled'],
            ];
        }

        $totals = [
            'total_sales' => array_sum(array_column($summary, 'total_sales')),
            'total_orders' => array_sum(array_column($summary, 'total_orders')),
            'avg_order_value' => array_sum(array_column($summary, 'avg_order_value')) / max(count($summary), 1),
        ];

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'outlets' => $summary,
            'totals' => $totals,
        ];
    }

    /**
     * Get comparative performance across outlets
     */
    public function getOutletPerformance(?int $tenantId = null, string $period = 'month'): array
    {
        $dateRange = $this->getDateRange($period);
        
        $outlets = DB::table('pos_outlets')
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->where('is_active', true)
            ->get();

        $performance = [];

        foreach ($outlets as $outlet) {
            $current = $this->getOutletSales($outlet->id, $dateRange['current_start'], $dateRange['current_end']);
            $previous = $this->getOutletSales($outlet->id, $dateRange['prev_start'], $dateRange['prev_end']);

            $growth = $previous['total'] > 0 
                ? round((($current['total'] - $previous['total']) / $previous['total']) * 100, 2) 
                : 0;

            $performance[] = [
                'outlet_id' => $outlet->id,
                'outlet_name' => $outlet->outlet_name,
                'current_period' => [
                    'sales' => $current['total'],
                    'orders' => $current['orders'],
                    'revenue' => $current['revenue'],
                ],
                'previous_period' => [
                    'sales' => $previous['total'],
                    'orders' => $previous['orders'],
                    'revenue' => $previous['revenue'],
                ],
                'growth_percent' => $growth,
                'rank' => 0, // Will be calculated after sorting
            ];
        }

        // Sort by current period revenue descending and assign rank
        usort($performance, fn($a, $b) => $b['current_period']['revenue'] <=> $a['current_period']['revenue']);
        foreach ($performance as $i => &$p) {
            $p['rank'] = $i + 1;
        }

        return [
            'period' => $period,
            'date_range' => $dateRange,
            'outlets' => $performance,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get real-time inventory overview by outlet
     */
    public function getInventoryOverview(?int $outletId = null): array
    {
        $outlets = DB::table('pos_outlets')
            ->when($outletId, fn($q) => $q->where('id', $outletId))
            ->where('is_active', true)
            ->get();

        $overview = [];

        foreach ($outlets as $outlet) {
            $lowStock = DB::table('produk')
                ->where('id_outlet', $outlet->id)
                ->where('stok', '<=', DB::raw('stock_minimum'))
                ->count();

            $outOfStock = DB::table('produk')
                ->where('id_outlet', $outlet->id)
                ->where('stok', '<=', 0)
                ->count();

            $totalProducts = DB::table('produk')
                ->where('id_outlet', $outlet->id)
                ->count();

            $totalStockValue = DB::table('produk')
                ->where('id_outlet', $outlet->id)
                ->sum(DB::raw('stok * harga_modal'));

            $overview[] = [
                'outlet_id' => $outlet->id,
                'outlet_name' => $outlet->outlet_name,
                'total_products' => $totalProducts,
                'in_stock' => $totalProducts - $outOfStock,
                'out_of_stock' => $outOfStock,
                'low_stock' => $lowStock,
                'total_stock_value' => $totalStockValue,
            ];
        }

        return [
            'outlets' => $overview,
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get staff performance comparison
     */
    public function getStaffPerformance(?int $outletId = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth()->toDateString();
        $endDate = $endDate ?? now()->endOfMonth()->toDateString();

        $orders = DB::table('pos_orders')
            ->whereBetween('business_date', [$startDate, $endDate])
            ->when($outletId, fn($q) => $q->where('outlet_id', $outletId))
            ->where('status', 'paid')
            ->get();

        $staffStats = [];

        foreach ($orders as $order) {
            $staffName = $order->created_by ?? 'Unknown';
            
            if (!isset($staffStats[$staffName])) {
                $staffStats[$staffName] = [
                    'staff_name' => $staffName,
                    'total_orders' => 0,
                    'total_sales' => 0,
                    'total_revenue' => 0,
                    'avg_order_value' => 0,
                ];
            }

            $staffStats[$staffName]['total_orders']++;
            $staffStats[$staffName]['total_sales'] += (float) ($order->subtotal ?? 0);
            $staffStats[$staffName]['total_revenue'] += (float) ($order->total_amount ?? 0);
        }

        // Calculate averages and sort
        foreach ($staffStats as &$stats) {
            $stats['avg_order_value'] = $stats['total_orders'] > 0 
                ? round($stats['total_revenue'] / $stats['total_orders'], 2) 
                : 0;
        }

        usort($staffStats, fn($a, $b) => $b['total_revenue'] <=> $a['total_revenue']);

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'outlet_id' => $outletId,
            'staff' => array_values($staffStats),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get hourly sales distribution
     */
    public function getHourlySales(int $outletId, string $date): array
    {
        $orders = DB::table('pos_orders')
            ->where('outlet_id', $outletId)
            ->where('business_date', $date)
            ->where('status', 'paid')
            ->get();

        $hourlyData = array_fill(0, 24, ['hour' => 0, 'orders' => 0, 'revenue' => 0]);

        foreach ($orders as $order) {
            $hour = (int) date('H', strtotime($order->created_at ?? now()));
            $hourlyData[$hour]['hour'] = $hour;
            $hourlyData[$hour]['orders']++;
            $hourlyData[$hour]['revenue'] += (float) ($order->total_amount ?? 0);
        }

        return [
            'outlet_id' => $outletId,
            'date' => $date,
            'hourly_sales' => $hourlyData,
        ];
    }

    /**
     * Get sales by category
     */
    public function getSalesByCategory(?int $outletId = null, ?string $startDate = null, ?string $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth()->toDateString();
        $endDate = $endDate ?? now()->endOfMonth()->toDateString();

        $items = DB::table('pos_order_items as i')
            ->join('pos_orders as o', 'i.order_id', '=', 'o.id')
            ->join('produk as p', 'i.product_id', '=', 'p.id_menu')
            ->whereBetween('o.business_date', [$startDate, $endDate])
            ->when($outletId, fn($q) => $q->where('o.outlet_id', $outletId))
            ->where('o.status', 'paid')
            ->where('i.status', 'active')
            ->groupBy('p.kategori')
            ->select('p.kategori', DB::raw('SUM(i.line_subtotal) as total'), DB::raw('COUNT(*) as orders'))
            ->get();

        return [
            'period' => ['start' => $startDate, 'end' => $endDate],
            'categories' => $items->map(fn($i) => [
                'category' => $i->kategori ?? 'Uncategorized',
                'revenue' => (float) $i->total,
                'orders' => (int) $i->orders,
            ]),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get outlet sales data
     */
    protected function getOutletSales(int $outletId, string $startDate, string $endDate): array
    {
        $orders = DB::table('pos_orders')
            ->where('outlet_id', $outletId)
            ->whereBetween('business_date', [$startDate, $endDate])
            ->where('status', 'paid')
            ->get();

        return [
            'total' => $orders->sum('total_amount'),
            'orders' => $orders->count(),
            'revenue' => $orders->sum('total_amount'),
        ];
    }

    /**
     * Get outlet orders breakdown
     */
    protected function getOutletOrders(int $outletId, string $startDate, string $endDate): array
    {
        $orders = DB::table('pos_orders')
            ->where('outlet_id', $outletId)
            ->whereBetween('business_date', [$startDate, $endDate])
            ->get();

        return [
            'count' => $orders->count(),
            'paid' => $orders->where('status', 'paid')->count(),
            'canceled' => $orders->where('status', 'canceled')->count(),
        ];
    }

    /**
     * Get date range for period
     */
    protected function getDateRange(string $period): array
    {
        $now = now();
        
        switch ($period) {
            case 'day':
                return [
                    'current_start' => $now->copy()->startOfDay()->toDateString(),
                    'current_end' => $now->copy()->endOfDay()->toDateString(),
                    'prev_start' => $now->copy()->subDay()->startOfDay()->toDateString(),
                    'prev_end' => $now->copy()->subDay()->endOfDay()->toDateString(),
                ];
            case 'week':
                return [
                    'current_start' => $now->copy()->startOfWeek()->toDateString(),
                    'current_end' => $now->copy()->endOfWeek()->toDateString(),
                    'prev_start' => $now->copy()->subWeek()->startOfWeek()->toDateString(),
                    'prev_end' => $now->copy()->subWeek()->endOfWeek()->toDateString(),
                ];
            case 'month':
            default:
                return [
                    'current_start' => $now->copy()->startOfMonth()->toDateString(),
                    'current_end' => $now->copy()->endOfMonth()->toDateString(),
                    'prev_start' => $now->copy()->subMonth()->startOfMonth()->toDateString(),
                    'prev_end' => $now->copy()->subMonth()->endOfMonth()->toDateString(),
                ];
        }
    }
}