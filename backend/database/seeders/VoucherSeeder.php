<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class VoucherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('pos_vouchers')->insert([
            [
                'code' => 'CAFEX10',
                'name' => 'Discount 10% for Regulars',
                'type' => 'percent',
                'value' => 10,
                'min_order_amount' => 0,
                'max_discount_amount' => 50000,
                'is_active' => true,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(6),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'GRANDOPENING',
                'name' => 'Grand Opening Fixed 25K',
                'type' => 'fixed',
                'value' => 25000,
                'min_order_amount' => 100000,
                'max_discount_amount' => null,
                'is_active' => true,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(1),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
