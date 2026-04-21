<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->unsignedInteger('redeem_points')->default(0)->after('total_amount');
            $table->decimal('points_discount', 15, 2)->default(0)->after('redeem_points');
        });
    }

    public function down(): void
    {
        Schema::table('pos_orders', function (Blueprint $table) {
            $table->dropColumn(['redeem_points', 'points_discount']);
        });
    }
};
