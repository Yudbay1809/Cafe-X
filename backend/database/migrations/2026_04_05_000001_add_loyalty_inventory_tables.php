<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('customers')) {
            Schema::create('customers', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->string('name', 120);
                $table->string('phone', 40)->nullable();
                $table->string('email', 120)->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'phone']);
            });
        }

        if (!Schema::hasTable('customer_points')) {
            Schema::create('customer_points', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('customer_id');
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->integer('points')->default(0);
                $table->timestamp('updated_at')->nullable();
                $table->index(['tenant_id', 'customer_id']);
            });
        }

        if (!Schema::hasTable('customer_transactions')) {
            Schema::create('customer_transactions', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('customer_id');
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->string('type', 40);
                $table->integer('points_delta');
                $table->string('ref_type', 40)->nullable();
                $table->string('ref_id', 80)->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'customer_id', 'created_at']);
            });
        }

        if (!Schema::hasTable('product_variants')) {
            Schema::create('product_variants', function (Blueprint $table): void {
                $table->id();
                $table->unsignedInteger('product_id');
                $table->string('name', 120);
                $table->decimal('price_delta', 14, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->index(['product_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('product_variant_options')) {
            Schema::create('product_variant_options', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('variant_id');
                $table->string('name', 120);
                $table->decimal('price_delta', 14, 2)->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->index(['variant_id', 'is_active']);
            });
        }

        if (!Schema::hasTable('ingredients')) {
            Schema::create('ingredients', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->string('name', 120);
                $table->string('unit', 20)->nullable();
                $table->decimal('stock', 14, 3)->default(0);
                $table->timestamps();
                $table->index(['tenant_id', 'name']);
            });
        }

        if (!Schema::hasTable('recipes')) {
            Schema::create('recipes', function (Blueprint $table): void {
                $table->id();
                $table->unsignedInteger('product_id');
                $table->unsignedBigInteger('ingredient_id');
                $table->decimal('qty', 14, 3)->default(0);
                $table->timestamps();
                $table->index(['product_id', 'ingredient_id']);
            });
        }

        if (!Schema::hasTable('inventory_movements')) {
            Schema::create('inventory_movements', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->unsignedInteger('product_id')->nullable();
                $table->unsignedBigInteger('ingredient_id')->nullable();
                $table->string('movement_type', 40);
                $table->decimal('qty_delta', 14, 3);
                $table->string('ref_type', 40)->nullable();
                $table->string('ref_id', 80)->nullable();
                $table->timestamp('created_at');
                $table->index(['tenant_id', 'product_id', 'created_at']);
            });
        }

        if (!Schema::hasTable('suppliers')) {
            Schema::create('suppliers', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->string('name', 120);
                $table->string('phone', 40)->nullable();
                $table->string('email', 120)->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'name']);
            });
        }

        if (!Schema::hasTable('purchase_orders')) {
            Schema::create('purchase_orders', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->unsignedBigInteger('supplier_id')->nullable();
                $table->string('status', 40)->default('draft');
                $table->decimal('total_amount', 14, 2)->default(0);
                $table->timestamps();
                $table->index(['tenant_id', 'status', 'created_at']);
            });
        }

        if (Schema::hasTable('pos_orders')) {
            $this->ensureIndex('pos_orders', 'idx_orders_tenant', ['tenant_id']);
            $this->ensureIndex('pos_orders', 'idx_orders_outlet', ['outlet_id']);
            $this->ensureIndex('pos_orders', 'idx_orders_created', ['created_at']);
            $this->ensureIndex('pos_orders', 'idx_orders_status', ['status']);
        }

        if (Schema::hasTable('pos_payments')) {
            $this->ensureIndex('pos_payments', 'idx_payments_paid_at', ['paid_at']);
            $this->ensureIndex('pos_payments', 'idx_payments_tenant', ['tenant_id']);
        }

        if (Schema::hasTable('produk')) {
            if (!Schema::hasColumn('produk', 'tenant_id')) {
                Schema::table('produk', function (Blueprint $table): void {
                    $table->unsignedBigInteger('tenant_id')->nullable()->after('id_menu');
                });
            }
            if (!Schema::hasColumn('produk', 'category_id')) {
                Schema::table('produk', function (Blueprint $table): void {
                    $table->unsignedBigInteger('category_id')->nullable()->after('tenant_id');
                });
            }
            $this->ensureIndex('produk', 'idx_produk_tenant', ['tenant_id']);
            $this->ensureIndex('produk', 'idx_produk_category', ['category_id']);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('ingredients');
        Schema::dropIfExists('product_variant_options');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('customer_transactions');
        Schema::dropIfExists('customer_points');
        Schema::dropIfExists('customers');
    }

    private function ensureIndex(string $table, string $indexName, array $columns): void
    {
        if (DB::getDriverName() !== 'mysql') {
            try {
                Schema::table($table, function (Blueprint $table) use ($columns, $indexName): void {
                    $table->index($columns, $indexName);
                });
            } catch (Throwable $e) {
            }
            return;
        }

        $exists = DB::selectOne(
            "SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1",
            [$table, $indexName]
        );
        if (!$exists) {
            Schema::table($table, function (Blueprint $table) use ($columns, $indexName): void {
                $table->index($columns, $indexName);
            });
        }
    }
};

