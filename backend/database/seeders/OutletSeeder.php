<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OutletSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;
        
        // 1. Create/Find Outlet 2
        $outlet2 = DB::table('outlets')->where('code', 'OUTLET-2')->first();
        if ($outlet2) {
            $outlet2Id = $outlet2->id;
        } else {
            $outlet2Id = DB::table('outlets')->insertGetId([
                'tenant_id' => $tenantId,
                'name' => 'Cafe-X Outlet 2 (City Mall)',
                'code' => 'OUTLET-2',
                'brand_name' => 'Cafe-X',
                'brand_color' => '#0891b2',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 2. Generate Orders for Outlet 2
        for ($i = 0; $i < 10; $i++) {
            $date = $i < 5 ? now()->subDay() : now();
            $subtotal = rand(100000, 500000);
            $tax = $subtotal * 0.1;
            $orderNo = 'CX2-' . $date->format('ymd') . '-' . str_pad($i+1, 4, '0', STR_PAD_LEFT);
            
            DB::table('pos_orders')->updateOrInsert(
                ['order_no' => $orderNo],
                [
                    'tenant_id' => $tenantId,
                    'outlet_id' => $outlet2Id,
                    'status' => 'paid',
                    'source' => 'POS',
                    'subtotal' => $subtotal,
                    'tax_amount' => $tax,
                    'total_amount' => $subtotal + $tax,
                    'business_date' => $date->format('Y-m-d'),
                    'paid_at' => $date,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]
            );
        }
    }
}
