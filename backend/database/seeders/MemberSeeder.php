<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1;

        $c1Id = DB::table('customers')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Budi Santoso',
            'phone' => '08123456789',
            'email' => 'budi@example.com',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $c2Id = DB::table('customers')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Siti Aminah',
            'phone' => '08987654321',
            'email' => 'siti@example.com',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Initial points
        DB::table('customer_points')->insert([
            [
                'customer_id' => $c1Id,
                'tenant_id' => $tenantId,
                'points' => 150,
                'updated_at' => now(),
            ],
            [
                'customer_id' => $c2Id,
                'tenant_id' => $tenantId,
                'points' => 25,
                'updated_at' => now(),
            ]
        ]);
    }
}
