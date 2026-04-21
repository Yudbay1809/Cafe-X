<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('voucher_id')->nullable()->after('status');
            $table->string('voucher_code')->nullable()->after('voucher_id');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('voucher_code');
        });
    }

    public function down(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->dropColumn(['voucher_id', 'voucher_code', 'discount_amount']);
        });
    }
};
