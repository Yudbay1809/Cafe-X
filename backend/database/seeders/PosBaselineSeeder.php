<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PosBaselineSeeder extends Seeder
{
    public function run(): void
    {
        $tenantRow = DB::table('tenants')->where('code', 'CAFEX-DEMO')->first();
        $tenantId = $tenantRow?->id
            ?: DB::table('tenants')->insertGetId([
                'name' => 'Cafe-X Demo Tenant',
                'code' => 'CAFEX-DEMO',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        $outletRow = DB::table('outlets')->where('tenant_id', $tenantId)->where('code', 'OUTLET-1')->first();
        $outletId = $outletRow?->id
            ?: DB::table('outlets')->insertGetId([
                'tenant_id' => $tenantId,
                'name' => 'Cafe-X Outlet 1',
                'code' => 'OUTLET-1',
                'timezone' => 'Asia/Jakarta',
                'brand_color' => '#0f766e',
                'brand_name' => 'Cafe-X',
                'contact_phone' => '0812-3456-7890',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        $permissions = [
            'order.create' => 'Create order',
            'order.item.edit' => 'Edit order item',
            'order.item.cancel' => 'Cancel order item',
            'order.pay' => 'Pay order',
            'order.cancel' => 'Cancel order',
            'order.cancel.high' => 'Cancel high value order',
            'order.reprint' => 'Reprint receipt',
            'order.merge' => 'Merge order',
            'order.split' => 'Split order',
            'shift.open' => 'Open shift',
            'shift.close' => 'Close shift',
            'table.manage' => 'Manage tables',
            'product.manage' => 'Manage products',
            'report.view' => 'View reports',
            'report.shift' => 'View shift report',
            'audit.view' => 'View audit logs',
            'sync.use' => 'Use sync endpoints',
            'user.manage' => 'Manage users',
        ];
        foreach ($permissions as $name => $display) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name],
                ['display_name' => $display, 'updated_at' => now(), 'created_at' => now()]
            );
        }

        $roles = [
            'owner' => ['order.create', 'order.item.edit', 'order.item.cancel', 'order.pay', 'order.cancel', 'order.cancel.high', 'order.reprint', 'order.merge', 'order.split', 'shift.open', 'shift.close', 'table.manage', 'product.manage', 'report.view', 'report.shift', 'audit.view', 'sync.use', 'user.manage'],
            'admin' => ['order.create', 'order.item.edit', 'order.item.cancel', 'order.pay', 'order.cancel', 'order.cancel.high', 'order.reprint', 'order.merge', 'order.split', 'shift.open', 'shift.close', 'table.manage', 'product.manage', 'report.view', 'report.shift', 'audit.view', 'sync.use'],
            'kasir' => ['order.create', 'order.item.edit', 'order.item.cancel', 'order.pay', 'order.cancel', 'order.reprint', 'shift.open', 'shift.close', 'report.shift', 'sync.use'],
        ];

        foreach ($roles as $roleName => $permNames) {
            $existingRole = DB::table('roles')->where('tenant_id', $tenantId)->where('name', $roleName)->first();
            $roleId = $existingRole?->id
                ?: DB::table('roles')->insertGetId([
                    'tenant_id' => $tenantId,
                    'name' => $roleName,
                    'display_name' => ucfirst($roleName),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            foreach ($permNames as $permName) {
                $permId = DB::table('permissions')->where('name', $permName)->value('id');
                DB::table('role_permissions')->updateOrInsert([
                    'role_id' => $roleId,
                    'permission_id' => $permId,
                ], []);
            }
        }

        DB::table('user')->updateOrInsert(
            ['username' => 'admin'],
            [
                'password' => Hash::make('admin'),
                'nama_lengkap' => 'Admin Demo',
                'jenis_kelamin' => 'Laki-Laki',
                'tanggal_lahir' => '2000-01-01',
                'alamat' => 'Semarang',
                'hp' => '08123456789',
                'status' => 'admin',
            ]
        );

        $ownerRoleId = DB::table('roles')->where('tenant_id', $tenantId)->where('name', 'owner')->value('id');
        DB::table('user_roles')->updateOrInsert(
            ['username' => 'admin', 'role_id' => $ownerRoleId],
            ['tenant_id' => $tenantId, 'outlet_id' => $outletId, 'created_at' => now(), 'updated_at' => now()]
        );

        DB::table('pos_settings')->updateOrInsert(
            ['setting_key' => 'tax_pct'],
            ['setting_value' => '0', 'updated_at' => now(), 'created_at' => now()]
        );
        DB::table('pos_settings')->updateOrInsert(
            ['setting_key' => 'service_pct'],
            ['setting_value' => '0', 'updated_at' => now(), 'created_at' => now()]
        );
        DB::table('pos_settings')->updateOrInsert(
            ['setting_key' => 'cancel_high_threshold'],
            ['setting_value' => '500000', 'updated_at' => now(), 'created_at' => now()]
        );

        DB::table('produk')->updateOrInsert(
            ['id_menu' => 1],
            [
                'tenant_id' => $tenantId,
                'nama_menu' => 'Espresso',
                'jenis_menu' => 'coffee',
                'stok' => 100,
                'harga' => 18000,
                'is_active' => 1,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $qrToken = bin2hex(random_bytes(16));
        DB::table('pos_tables')->updateOrInsert(
            ['table_code' => 'A1'],
            [
                'tenant_id' => $tenantId,
                'outlet_id' => $outletId,
                'table_name' => 'Table A1',
                'qr_token' => $qrToken,
                'is_active' => 1,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
        $tableId = (int) DB::table('pos_tables')->where('table_code', 'A1')->value('id');
        DB::table('table_qr_tokens')->updateOrInsert(
            ['table_id' => $tableId, 'token' => $qrToken],
            [
                'is_active' => 1,
                'expired_at' => null,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('tenant_subscriptions')->updateOrInsert(
            ['tenant_id' => $tenantId, 'is_active' => 1],
            [
                'plan_code' => 'pro',
                'starts_at' => now(),
                'ends_at' => null,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }
}