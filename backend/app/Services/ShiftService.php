<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use RuntimeException;

class ShiftService
{
    public function currentOpenShift(string $username, ?int $tenantId = null, ?int $outletId = null): ?object
    {
        $q = DB::table('pos_shifts')->where('opened_by', $username)->where('status', 'open');
        if ($tenantId) {
            $q->where('tenant_id', $tenantId);
        }
        if ($outletId) {
            $q->where('outlet_id', $outletId);
        }
        return $q->orderByDesc('id')->first();
    }

    public function assertOpenShiftExists(string $username, ?int $tenantId = null, ?int $outletId = null): object
    {
        $shift = $this->currentOpenShift($username, $tenantId, $outletId);
        if (!$shift) {
            throw new RuntimeException('Tidak ada shift terbuka');
        }
        return $shift;
    }

    public function open(string $username, float $openingCash, ?int $tenantId = null, ?int $outletId = null, string $notes = ''): array
    {
        $exists = $this->currentOpenShift($username, $tenantId, $outletId);
        if ($exists) {
            throw new RuntimeException('Masih ada shift terbuka untuk user ini');
        }

        $id = DB::table('pos_shifts')->insertGetId([
            'tenant_id' => $tenantId,
            'outlet_id' => $outletId,
            'shift_date' => now()->toDateString(),
            'opened_by' => $username,
            'opened_at' => now(),
            'opening_cash' => $openingCash,
            'notes' => $notes,
            'status' => 'open',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return [
            'shift_id' => $id,
            'opened_at' => now()->format('Y-m-d H:i:s'),
            'opening_cash' => $openingCash,
        ];
    }

    public function close(string $username, float $closingCash, ?int $tenantId = null, ?int $outletId = null, string $notes = ''): array
    {
        return DB::transaction(function () use ($username, $closingCash, $tenantId, $outletId, $notes): array {
            $shift = $this->assertOpenShiftExists($username, $tenantId, $outletId);

            $paidSales = (float) DB::table('pos_payments')
                ->where('tenant_id', $shift->tenant_id)
                ->where('outlet_id', $shift->outlet_id)
                ->where('shift_id', $shift->id)
                ->sum('amount');

            $expectedCash = round((float) $shift->opening_cash + $paidSales, 2);
            $variance = round($closingCash - $expectedCash, 2);

            DB::table('pos_shifts')
                ->where('id', $shift->id)
                ->update([
                    'closed_by' => $username,
                    'closed_at' => now(),
                    'closing_cash' => $closingCash,
                    'expected_cash' => $expectedCash,
                    'variance_cash' => $variance,
                    'notes' => $notes,
                    'status' => 'closed',
                    'sync_version' => DB::raw('sync_version + 1'),
                    'updated_at' => now(),
                ]);

            return [
                'shift_id' => (int) $shift->id,
                'closed_at' => now()->format('Y-m-d H:i:s'),
                'closing_cash' => $closingCash,
                'expected_cash' => $expectedCash,
                'variance_cash' => $variance,
            ];
        });
    }
}
