<?php

namespace App\Modules\POS\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SultanController extends Controller
{
    public function createBooking(Request $request)
    {
        $id = DB::table('bookings')->insertGetId([
            'tenant_id' => $request->tenant_id,
            'booking_date' => $request->date,
            'booking_time' => $request->time,
            'guests' => $request->guests,
            'table_type' => $request->tableType,
            'booking_fee' => 50000,
            'status' => 'confirmed',
            'notes' => $request->notes,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['success' => true, 'booking_id' => $id]);
    }

    public function addStamps(Request $request)
    {
        $memberId = $request->member_id;
        $stamps = $request->stamps;
        $spend = $request->spend;

        $loyalty = DB::table('loyalty_stamps')->where('member_id', $memberId)->first();

        if ($loyalty) {
            DB::table('loyalty_stamps')->where('member_id', $memberId)->update([
                'stamps_count' => $loyalty->stamps_count + $stamps,
                'total_spend' => $loyalty->total_spend + $spend,
                'updated_at' => now(),
            ]);
        } else {
            DB::table('loyalty_stamps')->insert([
                'member_id' => $memberId,
                'stamps_count' => $stamps,
                'total_spend' => $spend,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['success' => true]);
    }

    public function getPayroll(Request $request)
    {
        // Simulated logic for staff performance
        $staff = [
            ['id' => 1, 'name' => 'Andi Pratama', 'base' => 5000000, 'commission' => 450000],
            ['id' => 2, 'name' => 'Siti Aminah', 'base' => 4000000, 'commission' => 850000],
        ];

        return response()->json(['success' => true, 'data' => $staff]);
    }
}
