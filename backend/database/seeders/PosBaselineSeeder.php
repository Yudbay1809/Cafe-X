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
            'billing.manage' => 'Manage billing',
            'demo.reset' => 'Reset demo tenant',
        ];

        foreach ($permissions as $name => $display) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $name],
                ['display_name' => $display, 'updated_at' => now(), 'created_at' => now()]
            );
        }

        $roles = [
            'owner' => array_keys($permissions),
            'admin' => [
                'order.create', 'order.item.edit', 'order.item.cancel', 'order.pay', 'order.cancel', 'order.cancel.high',
                'order.reprint', 'order.merge', 'order.split', 'shift.open', 'shift.close', 'table.manage',
                'product.manage', 'report.view', 'report.shift', 'audit.view', 'sync.use', 'billing.manage', 'demo.reset',
            ],
            'kasir' => [
                'order.create', 'order.item.edit', 'order.item.cancel', 'order.pay', 'order.cancel',
                'order.reprint', 'shift.open', 'shift.close', 'report.shift', 'sync.use',
            ],
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

        $catalog = [
            ['Espresso', 'coffee', 28000], ['Americano', 'coffee', 28000], ['Cappuccino', 'coffee', 32000], ['Latte', 'coffee', 30000],
            ['Caramel Latte', 'coffee', 34000], ['Hazelnut Latte', 'coffee', 34000], ['Flat White', 'coffee', 32000], ['Mocha', 'coffee', 35000],
            ['Cold Brew', 'coffee', 30000], ['Affogato', 'coffee', 36000],
            ['Chocolate', 'non coffee', 30000], ['Matcha Latte', 'non coffee', 33000], ['Lemon Tea', 'non coffee', 25000], ['Milk Tea', 'non coffee', 27000],
            ['Red Velvet', 'non coffee', 32000], ['Thai Tea', 'non coffee', 29000], ['Taro Latte', 'non coffee', 32000], ['Mineral Water', 'non coffee', 12000],
            ['Sparkling Lime', 'non coffee', 26000], ['Lychee Tea', 'non coffee', 28000],
            ['Nasi Goreng', 'main course', 42000], ['Chicken Katsu', 'main course', 48000], ['Beef Teriyaki', 'main course', 52000], ['Spaghetti Bolognese', 'main course', 46000],
            ['Creamy Carbonara', 'main course', 47000], ['Fish and Chips', 'main course', 49000], ['Chicken Rice Bowl', 'main course', 43000], ['Beef Rice Bowl', 'main course', 47000],
            ['Sambal Matah Chicken', 'main course', 48000], ['Dori Sambal', 'main course', 46000],
            ['French Fries', 'appetizer', 26000], ['Onion Rings', 'appetizer', 28000], ['Chicken Wings', 'appetizer', 34000], ['Spring Roll', 'appetizer', 28000],
            ['Nachos', 'appetizer', 32000], ['Potato Wedges', 'appetizer', 29000], ['Garlic Bread', 'appetizer', 24000], ['Calamari', 'appetizer', 38000],
            ['Cheese Stick', 'appetizer', 30000], ['Dimsum', 'appetizer', 33000],
        ];

        foreach ($catalog as $idx => [$name, $cat, $price]) {
            DB::table('produk')->updateOrInsert(
                ['id_menu' => $idx + 1],
                [
                    'tenant_id' => $tenantId,
                    'nama_menu' => $name,
                    'jenis_menu' => $cat,
                    'stok' => 99,
                    'harga' => $price,
                    'is_active' => 1,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        for ($i = 1; $i <= 20; $i++) {
            $code = 'A' . $i;
            $token = bin2hex(random_bytes(16));
            DB::table('pos_tables')->updateOrInsert(
                ['table_code' => $code],
                [
                    'tenant_id' => $tenantId,
                    'outlet_id' => $outletId,
                    'table_name' => 'Table ' . $code,
                    'qr_token' => $token,
                    'is_active' => 1,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
            $tableId = (int) DB::table('pos_tables')->where('table_code', $code)->value('id');
            DB::table('table_qr_tokens')->updateOrInsert(
                ['table_id' => $tableId, 'token' => $token],
                [
                    'is_active' => 1,
                    'expired_at' => null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $planData = [
            ['code' => 'basic', 'name' => 'Basic', 'price_monthly' => 399000, 'feature_flags_json' => json_encode(['reports.basic' => true])],
            ['code' => 'pro', 'name' => 'Pro', 'price_monthly' => 799000, 'feature_flags_json' => json_encode(['reports.advanced' => true, 'sync.advanced' => true])],
            ['code' => 'premium', 'name' => 'Premium', 'price_monthly' => 1499000, 'feature_flags_json' => json_encode(['loyalty' => true, 'integrations' => true])],
        ];

        foreach ($planData as $plan) {
            DB::table('plans')->updateOrInsert(
                ['code' => $plan['code']],
                [
                    'name' => $plan['name'],
                    'price_monthly' => $plan['price_monthly'],
                    'feature_flags_json' => $plan['feature_flags_json'],
                    'is_active' => 1,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $proPlanId = (int) DB::table('plans')->where('code', 'pro')->value('id');
        $subscriptionId = DB::table('subscriptions')->insertGetId([
            'tenant_id' => $tenantId,
            'plan_id' => $proPlanId,
            'status' => 'active',
            'period_start' => now(),
            'period_end' => now()->addMonth(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('tenant_subscriptions')->where('tenant_id', $tenantId)->update(['is_active' => 0, 'updated_at' => now()]);
        DB::table('tenant_subscriptions')->updateOrInsert(
            ['tenant_id' => $tenantId, 'subscription_id' => $subscriptionId],
            [
                'plan_code' => 'pro',
                'is_active' => 1,
                'starts_at' => now(),
                'ends_at' => now()->addMonth(),
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $invoiceId = DB::table('invoices')->insertGetId([
            'tenant_id' => $tenantId,
            'invoice_no' => 'INV-' . now()->format('Ymd') . '-0001',
            'amount' => 799000,
            'due_date' => now()->addDays(7)->toDateString(),
            'status' => 'sent',
            'notes' => 'Invoice langganan awal Pro',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('invoice_items')->insert([
            'invoice_id' => $invoiceId,
            'description' => 'Subscription Pro 1 bulan',
            'qty' => 1,
            'price' => 799000,
            'line_total' => 799000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
