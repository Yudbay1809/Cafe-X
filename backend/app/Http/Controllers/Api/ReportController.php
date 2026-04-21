<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    use ApiResponse;

    public function summary(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);

        $today = now()->toDateString();

        $sales = DB::table('pos_payments')
            ->where('tenant_id', $tenantId)
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId))
            ->whereDate('paid_at', $today)
            ->sum('amount');

        $ordersData = DB::table('pos_orders')
            ->where('tenant_id', $tenantId)
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId))
            ->whereDate('created_at', $today)
            ->select(
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(total_amount) as net_sales'),
                DB::raw('SUM(discount_amount) as discount_total'),
                DB::raw('SUM(subtotal) as gross_subtotal')
            )
            ->first();

        return $this->ok([
            'date' => $today,
            'orders_count' => (int) ($ordersData->count ?? 0),
            'sales_total' => (float) ($ordersData->net_sales ?? 0),
            'discount_total' => (float) ($ordersData->discount_total ?? 0),
            'gross_subtotal' => (float) ($ordersData->gross_subtotal ?? 0),
        ]);
    }

    public function shift(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $shiftId = (int) ($request->query('shift_id') ?? 0);

        $shiftQ = DB::table('pos_shifts')
            ->where('tenant_id', $tenantId)
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId));
        $shift = $shiftId > 0
            ? $shiftQ->where('id', $shiftId)->first()
            : $shiftQ->orderByDesc('id')->first();

        if (!$shift) {
            return $this->fail('Shift not found', 404);
        }

        $paymentsByMethod = DB::table('pos_payments')
            ->select('method', DB::raw('COUNT(*) as trx_count'), DB::raw('SUM(amount) as total'))
            ->where('tenant_id', $tenantId)
            ->where('shift_id', (int) $shift->id)
            ->groupBy('method')
            ->get();

        $ordersTotal = (int) DB::table('pos_orders')
            ->where('tenant_id', $tenantId)
            ->where('shift_id', (int) $shift->id)
            ->count();
        $voidCount = (int) DB::table('pos_orders')
            ->where('tenant_id', $tenantId)
            ->where('shift_id', (int) $shift->id)
            ->where('status', 'canceled')
            ->count();

        return $this->ok([
            'shift' => $shift,
            'orders_total' => $ordersTotal,
            'void_count' => $voidCount,
            'payments_by_method' => $paymentsByMethod,
            'cash' => [
                'opening_cash' => (float) ($shift->opening_cash ?? 0),
                'closing_cash' => (float) ($shift->closing_cash ?? 0),
                'expected_cash' => (float) ($shift->expected_cash ?? 0),
                'variance_cash' => (float) ($shift->variance_cash ?? 0),
            ],
        ]);
    }

    public function sales(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $from = $request->query('from');
        $to = $request->query('to');

        $base = DB::table('pos_payments')
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId))
            ->when($from, fn ($q) => $q->whereDate('paid_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('paid_at', '<=', $to));

        $total = (float) $base->sum('amount');
        $count = (int) $base->count('id');

        return $this->ok([
            'total_amount' => $total,
            'payment_count' => $count,
            'from' => $from,
            'to' => $to,
        ]);
    }

    public function products(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $from = $request->query('from');
        $to = $request->query('to');

        $items = DB::table('pos_order_items as i')
            ->join('pos_orders as o', 'o.id', '=', 'i.order_id')
            ->leftJoin('produk as p', 'p.id_menu', '=', 'i.product_id')
            ->select('i.product_id', DB::raw('SUM(i.qty) as qty'), DB::raw('SUM(i.line_subtotal) as total'), DB::raw('COALESCE(p.nama_menu, i.product_name_snapshot) as name'))
            ->when($tenantId > 0, fn ($q) => $q->where('o.tenant_id', $tenantId))
            ->when($outletId > 0, fn ($q) => $q->where('o.outlet_id', $outletId))
            ->when($from, fn ($q) => $q->whereDate('o.created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('o.created_at', '<=', $to))
            ->groupBy('i.product_id')
            ->orderByDesc('qty')
            ->limit(50)
            ->get();

        return $this->ok([
            'items' => $items->all(),
            'from' => $from,
            'to' => $to,
        ]);
    }

    public function daily(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $from = $request->query('from');
        $to = $request->query('to');

        $rows = DB::table('pos_orders')
            ->select(
                DB::raw('DATE(created_at) as date'), 
                DB::raw('COUNT(*) as orders'), 
                DB::raw('SUM(total_amount) as total'),
                DB::raw('SUM(discount_amount) as discount')
            )
            ->when($tenantId > 0, fn ($q) => $q->where('tenant_id', $tenantId))
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId))
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();

        return $this->ok([
            'items' => $rows->all(),
            'from' => $from,
            'to' => $to,
        ]);
    }

    public function exportSales(Request $request)
    {
        $auth = (array) $request->attributes->get('auth_user', []);
        $tenantId = (int) ($auth['tenant_id'] ?? 0);
        $outletId = (int) ($auth['outlet_id'] ?? 0);
        $from = $request->query('from') ?? now()->toDateString();
        $to = $request->query('to') ?? now()->toDateString();

        $rows = DB::table('pos_orders')
            ->where('tenant_id', $tenantId)
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId))
            ->whereDate('created_at', '>=', $from)
            ->whereDate('created_at', '<=', $to)
            ->orderBy('created_at')
            ->get();

        $callback = function() use ($rows) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Order No', 'Date', 'Status', 'Subtotal', 'Tax', 'Service', 'Discount', 'Total']);

            foreach ($rows as $row) {
                fputcsv($file, [
                    $row->id,
                    $row->order_no,
                    $row->created_at,
                    $row->status,
                    (float)$row->subtotal,
                    (float)$row->tax_amount,
                    (float)$row->service_amount,
                    (float)$row->discount_amount,
                    (float)$row->total_amount,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"sales-report-{$from}-to-{$to}.csv\"",
        ]);
    }
}



