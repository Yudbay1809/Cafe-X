<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tenants')) {
            Schema::create('tenants', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 120);
                $table->string('code', 60)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('outlets')) {
            Schema::create('outlets', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->string('name', 120);
                $table->string('code', 60);
                $table->string('timezone', 50)->default('Asia/Jakarta');
                $table->string('brand_color', 12)->nullable();
                $table->string('brand_name', 120)->nullable();
                $table->string('contact_phone', 40)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->unique(['tenant_id', 'code']);
                $table->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->string('name', 40);
                $table->string('display_name', 80);
                $table->timestamps();
                $table->unique(['tenant_id', 'name']);
                $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnUpdate()->nullOnDelete();
            });
        }

        if (!Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table): void {
                $table->id();
                $table->string('name', 80)->unique();
                $table->string('display_name', 120);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('role_permissions')) {
            Schema::create('role_permissions', function (Blueprint $table): void {
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('permission_id');
                $table->primary(['role_id', 'permission_id']);
                $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete()->cascadeOnUpdate();
                $table->foreign('permission_id')->references('id')->on('permissions')->cascadeOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table): void {
                $table->string('username', 100);
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->unsignedBigInteger('outlet_id')->nullable();
                $table->timestamps();
                $table->primary(['username', 'role_id']);
                $table->index(['tenant_id', 'outlet_id']);
                $table->foreign('role_id')->references('id')->on('roles')->cascadeOnDelete()->cascadeOnUpdate();
                $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnUpdate()->nullOnDelete();
                $table->foreign('outlet_id')->references('id')->on('outlets')->cascadeOnUpdate()->nullOnDelete();
            });
        }

        if (!Schema::hasTable('product_categories')) {
            Schema::create('product_categories', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->string('name', 100);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->unique(['tenant_id', 'name']);
                $table->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('user')) {
            Schema::create('user', function (Blueprint $table): void {
                $table->string('username', 100)->primary();
                $table->string('password', 255);
                $table->string('nama_lengkap', 120)->nullable();
                $table->string('jenis_kelamin', 40)->nullable();
                $table->date('tanggal_lahir')->nullable();
                $table->text('alamat')->nullable();
                $table->string('hp', 40)->nullable();
                $table->string('status', 40)->default('kasir');
            });
        }

        if (!Schema::hasTable('produk')) {
            Schema::create('produk', function (Blueprint $table): void {
                $table->increments('id_menu');
                $table->string('nama_menu', 120);
                $table->string('jenis_menu', 80)->nullable();
                $table->integer('stok')->default(0);
                $table->decimal('harga', 14, 2)->default(0);
                $table->string('gambar', 255)->nullable();
            });
        }

        if (!Schema::hasTable('pos_settings')) {
            Schema::create('pos_settings', function (Blueprint $table): void {
                $table->id();
                $table->string('setting_key', 80)->unique();
                $table->string('setting_value', 255)->nullable();
                $table->timestamp('updated_at')->nullable();
            });
        }

        if (!Schema::hasTable('pos_tables')) {
            Schema::create('pos_tables', function (Blueprint $table): void {
                $table->increments('id');
                $table->string('table_code', 50)->unique();
                $table->string('table_name', 100);
                $table->string('qr_token', 80)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('pos_shifts')) {
            Schema::create('pos_shifts', function (Blueprint $table): void {
                $table->id();
                $table->date('shift_date')->index();
                $table->string('opened_by', 100);
                $table->timestamp('opened_at');
                $table->decimal('opening_cash', 14, 2)->default(0);
                $table->string('closed_by', 100)->nullable();
                $table->timestamp('closed_at')->nullable();
                $table->decimal('closing_cash', 14, 2)->nullable();
                $table->decimal('expected_cash', 14, 2)->nullable();
                $table->string('status', 20)->default('open');
                $table->string('notes', 255)->nullable();
                $table->unsignedBigInteger('sync_version')->default(1);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('pos_orders')) {
            Schema::create('pos_orders', function (Blueprint $table): void {
                $table->id();
                $table->string('order_no', 60)->unique();
                $table->date('business_date')->index();
                $table->unsignedInteger('table_id')->nullable();
                $table->string('source', 20)->default('POS');
                $table->enum('status', ['new', 'preparing', 'ready', 'served', 'paid', 'canceled'])->default('new');
                $table->decimal('subtotal', 14, 2)->default(0);
                $table->decimal('tax_amount', 14, 2)->default(0);
                $table->decimal('service_amount', 14, 2)->default(0);
                $table->decimal('total_amount', 14, 2)->default(0);
                $table->text('notes')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamp('canceled_at')->nullable();
                $table->string('canceled_reason', 255)->nullable();
                $table->string('created_by', 100)->nullable();
                $table->unsignedBigInteger('sync_version')->default(1);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('pos_order_items')) {
            Schema::create('pos_order_items', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->unsignedInteger('product_id');
                $table->string('product_name_snapshot', 120);
                $table->decimal('unit_price', 14, 2);
                $table->integer('qty');
                $table->decimal('line_subtotal', 14, 2);
                $table->string('notes', 255)->nullable();
                $table->string('status', 20)->default('active');
                $table->timestamps();
                $table->index(['order_id', 'status']);
            });
        }

        if (!Schema::hasTable('pos_payments')) {
            Schema::create('pos_payments', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->enum('method', ['cash', 'qris', 'transfer', 'card', 'other']);
                $table->decimal('amount', 14, 2);
                $table->string('reference_no', 120)->nullable();
                $table->string('paid_by', 100)->nullable();
                $table->timestamp('paid_at');
                $table->timestamps();
                $table->index(['order_id', 'paid_at']);
            });
        }

        if (!Schema::hasTable('pos_stock_movements')) {
            Schema::create('pos_stock_movements', function (Blueprint $table): void {
                $table->id();
                $table->unsignedInteger('product_id');
                $table->string('movement_type', 40);
                $table->integer('qty_delta');
                $table->unsignedBigInteger('ref_order_id')->nullable();
                $table->string('notes', 255)->nullable();
                $table->string('created_by', 100)->nullable();
                $table->timestamp('created_at');
                $table->index(['product_id', 'created_at']);
            });
        }

        if (!Schema::hasTable('api_tokens')) {
            Schema::create('api_tokens', function (Blueprint $table): void {
                $table->id();
                $table->string('username', 100)->index();
                $table->string('role_name', 40);
                $table->string('token_name', 80)->default('device');
                $table->string('token_hash', 64)->unique();
                $table->timestamp('expires_at')->nullable();
                $table->timestamp('last_used_at')->nullable();
                $table->timestamp('revoked_at')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('pos_sync_logs')) {
            Schema::create('pos_sync_logs', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('device_id')->nullable();
                $table->string('username', 100)->nullable();
                $table->string('event_type', 80);
                $table->json('payload_json')->nullable();
                $table->enum('status', ['ok', 'failed'])->default('ok');
                $table->string('message', 255)->nullable();
                $table->timestamp('created_at');
            });
        }

        if (!Schema::hasTable('pos_idempotency_keys')) {
            Schema::create('pos_idempotency_keys', function (Blueprint $table): void {
                $table->id();
                $table->string('key_hash', 64)->unique();
                $table->string('endpoint_name', 120);
                $table->string('username', 100)->nullable();
                $table->json('response_json');
                $table->timestamp('created_at');
            });
        }

        if (Schema::hasTable('produk') && !Schema::hasColumn('produk', 'tenant_id')) {
            Schema::table('produk', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->after('id_menu');
                $table->unsignedBigInteger('category_id')->nullable()->after('tenant_id');
                $table->boolean('is_active')->default(true)->after('gambar');
                $table->timestamps();
                $table->index(['tenant_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('table_qr_tokens')) {
            Schema::create('table_qr_tokens', function (Blueprint $table): void {
                $table->id();
                $table->unsignedInteger('table_id');
                $table->string('token', 80)->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamp('expired_at')->nullable();
                $table->timestamps();
                $table->index(['table_id', 'is_active']);
                $table->foreign('table_id')->references('id')->on('pos_tables')->cascadeOnDelete()->cascadeOnUpdate();
            });
        } else {
            if (DB::getDriverName() === 'mysql' && Schema::hasColumn('table_qr_tokens', 'table_id')) {
                DB::statement("ALTER TABLE table_qr_tokens MODIFY COLUMN table_id INT UNSIGNED NOT NULL");
            }
            if (DB::getDriverName() === 'mysql') {
                $fkExists = DB::selectOne("
                    SELECT CONSTRAINT_NAME AS c
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'table_qr_tokens'
                      AND COLUMN_NAME = 'table_id'
                      AND REFERENCED_TABLE_NAME = 'pos_tables'
                    LIMIT 1
                ");
                if (!$fkExists) {
                    DB::statement('ALTER TABLE table_qr_tokens ADD CONSTRAINT fk_table_qr_tokens_table_id FOREIGN KEY (table_id) REFERENCES pos_tables(id) ON DELETE CASCADE ON UPDATE CASCADE');
                }
            }
        }

        if (Schema::hasTable('pos_tables') && !Schema::hasColumn('pos_tables', 'tenant_id')) {
            Schema::table('pos_tables', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
                $table->index(['tenant_id', 'outlet_id', 'table_code']);
            });
        }

        if (Schema::hasTable('pos_orders') && !Schema::hasColumn('pos_orders', 'tenant_id')) {
            Schema::table('pos_orders', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
                $table->unsignedBigInteger('shift_id')->nullable()->after('table_id');
                $table->index(['tenant_id', 'outlet_id', 'business_date', 'status'], 'idx_orders_hot');
            });
        }

        if (Schema::hasTable('pos_order_items') && !Schema::hasColumn('pos_order_items', 'tenant_id')) {
            Schema::table('pos_order_items', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->index(['tenant_id', 'order_id'], 'idx_order_items_tenant_order');
            });
        }

        if (Schema::hasTable('pos_payments') && !Schema::hasColumn('pos_payments', 'tenant_id')) {
            Schema::table('pos_payments', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
                $table->unsignedBigInteger('shift_id')->nullable()->after('order_id');
                $table->index(['tenant_id', 'outlet_id', 'paid_at'], 'idx_payments_hot');
            });
        }

        if (Schema::hasTable('pos_stock_movements') && !Schema::hasColumn('pos_stock_movements', 'tenant_id')) {
            Schema::table('pos_stock_movements', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
                $table->index(['tenant_id', 'product_id', 'created_at'], 'idx_stock_hot');
            });
        }

        if (Schema::hasTable('pos_shifts') && !Schema::hasColumn('pos_shifts', 'tenant_id')) {
            Schema::table('pos_shifts', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
                $table->index(['tenant_id', 'outlet_id', 'shift_date', 'status'], 'idx_shifts_hot');
            });
        }
        if (Schema::hasTable('pos_shifts') && !Schema::hasColumn('pos_shifts', 'variance_cash')) {
            Schema::table('pos_shifts', function (Blueprint $table): void {
                $table->decimal('variance_cash', 14, 2)->nullable()->after('expected_cash');
            });
        }

        if (!Schema::hasTable('devices')) {
            Schema::create('devices', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id');
                $table->unsignedBigInteger('outlet_id')->nullable();
                $table->string('device_uid', 120);
                $table->string('device_name', 120);
                $table->enum('platform', ['android', 'windows', 'web', 'other'])->default('other');
                $table->timestamp('last_seen_at')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->unique(['tenant_id', 'device_uid']);
                $table->foreign('tenant_id')->references('id')->on('tenants')->restrictOnDelete()->cascadeOnUpdate();
                $table->foreign('outlet_id')->references('id')->on('outlets')->nullOnDelete()->cascadeOnUpdate();
            });
        }

        if (Schema::hasTable('pos_sync_logs') && !Schema::hasColumn('pos_sync_logs', 'tenant_id')) {
            Schema::table('pos_sync_logs', function (Blueprint $table): void {
                $table->unsignedBigInteger('tenant_id')->nullable()->first();
                $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
                $table->index(['tenant_id', 'device_id', 'created_at'], 'idx_sync_hot');
            });
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->unsignedBigInteger('outlet_id')->nullable();
                $table->string('actor', 120)->nullable();
                $table->string('event_type', 100);
                $table->string('entity_type', 80)->nullable();
                $table->string('entity_id', 80)->nullable();
                $table->json('payload_json')->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'outlet_id', 'event_type'], 'idx_audit_hot');
            });
        }

        if (DB::getDriverName() === 'mysql' && Schema::hasTable('pos_orders')) {
            DB::statement("ALTER TABLE pos_orders MODIFY COLUMN status ENUM('new','preparing','ready','served','paid','canceled') NOT NULL DEFAULT 'new'");
        }
        if (DB::getDriverName() === 'mysql' && Schema::hasTable('pos_payments')) {
            DB::statement("ALTER TABLE pos_payments MODIFY COLUMN method ENUM('cash','qris','transfer','card','other') NOT NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('devices');
        Schema::dropIfExists('table_qr_tokens');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('outlets');
        Schema::dropIfExists('tenants');
    }
};
