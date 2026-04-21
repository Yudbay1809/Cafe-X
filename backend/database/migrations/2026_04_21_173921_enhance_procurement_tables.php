<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Extend suppliers table
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('address')->nullable()->after('email');
            $table->string('contact_person')->nullable()->after('address');
            $table->string('payment_term')->default('cash')->after('contact_person'); // cash, net7, net14, net30
            $table->boolean('is_active')->default(true)->after('payment_term');
        });

        // Extend purchase_orders table
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->string('po_no')->nullable()->after('id'); // e.g. PO-20260421-0001
            $table->unsignedBigInteger('outlet_id')->nullable()->after('tenant_id');
            $table->string('notes')->nullable()->after('status');
            $table->date('expected_date')->nullable()->after('notes');
            $table->string('created_by')->nullable()->after('expected_date');
        });

        // Create purchase_order_items
        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('purchase_order_id');
            $table->unsignedBigInteger('ingredient_id');
            $table->string('ingredient_name_snapshot');
            $table->decimal('qty', 10, 3);
            $table->string('unit')->default('pcs');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('line_total', 15, 2)->default(0);
            $table->timestamps();
        });

        // Create goods_receipts table
        Schema::create('goods_receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id');
            $table->unsignedBigInteger('outlet_id')->nullable();
            $table->unsignedBigInteger('purchase_order_id')->nullable();
            $table->string('gr_no');
            $table->string('received_by');
            $table->date('received_date');
            $table->string('notes')->nullable();
            $table->string('status')->default('received'); // received, partial
            $table->timestamps();
        });

        // Create goods_receipt_items
        Schema::create('goods_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('goods_receipt_id');
            $table->unsignedBigInteger('ingredient_id');
            $table->string('ingredient_name_snapshot');
            $table->decimal('qty_ordered', 10, 3)->default(0);
            $table->decimal('qty_received', 10, 3);
            $table->string('unit')->default('pcs');
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_items');
        Schema::dropIfExists('goods_receipts');
        Schema::dropIfExists('purchase_order_items');

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropColumn(['po_no', 'outlet_id', 'notes', 'expected_date', 'created_by']);
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['address', 'contact_person', 'payment_term', 'is_active']);
        });
    }
};
