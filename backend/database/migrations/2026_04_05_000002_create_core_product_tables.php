<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('products')) {
            Schema::create('products', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('name', 120);
                $table->decimal('price', 14, 2)->default(0);
                $table->decimal('cost', 14, 2)->default(0);
                $table->string('image', 255)->nullable();
                $table->timestamps();
                $table->index(['tenant_id', 'category_id']);
                $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete()->cascadeOnUpdate();
                $table->foreign('category_id')->references('id')->on('product_categories')->nullOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('orders')) {
            Schema::create('orders', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('tenant_id')->nullable();
                $table->unsignedBigInteger('outlet_id')->nullable();
                $table->string('order_no', 60)->unique();
                $table->string('status', 20)->default('new');
                $table->decimal('subtotal', 14, 2)->default(0);
                $table->decimal('tax', 14, 2)->default(0);
                $table->decimal('total', 14, 2)->default(0);
                $table->timestamps();
                $table->index(['tenant_id', 'outlet_id', 'status']);
                $table->foreign('tenant_id')->references('id')->on('tenants')->nullOnDelete()->cascadeOnUpdate();
                $table->foreign('outlet_id')->references('id')->on('outlets')->nullOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('order_items')) {
            Schema::create('order_items', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->unsignedBigInteger('product_id');
                $table->decimal('price', 14, 2)->default(0);
                $table->integer('qty')->default(0);
                $table->timestamps();
                $table->index(['order_id', 'product_id']);
                $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete()->cascadeOnUpdate();
                $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table): void {
                $table->id();
                $table->unsignedBigInteger('order_id');
                $table->string('method', 20);
                $table->decimal('amount', 14, 2)->default(0);
                $table->timestamps();
                $table->index(['order_id']);
                $table->foreign('order_id')->references('id')->on('orders')->cascadeOnDelete()->cascadeOnUpdate();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('products');
    }
};
