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

        $orders = DB::table('pos_orders')
            ->where('tenant_id', $tenantId)
            ->when($outletId > 0, fn ($q) => $q->where('outlet_id', $outletId))
            ->whereDate('created_at', $today)
            ->count();

        return $this->ok([
            'date' => $today,
            'orders_count' => (int) $orders,
            'sales_total' => (float) $sales,
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
}
