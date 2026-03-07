<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('api_tokens') && !Schema::hasColumn('api_tokens', 'revoked_at')) {
            Schema::table('api_tokens', function (Blueprint $table): void {
                $table->timestamp('revoked_at')->nullable()->after('last_used_at');
            });
        }
        if (Schema::hasTable('api_tokens') && !Schema::hasColumn('api_tokens', 'updated_at')) {
            Schema::table('api_tokens', function (Blueprint $table): void {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            });
        }

        if (Schema::hasTable('pos_payments') && !Schema::hasColumn('pos_payments', 'updated_at')) {
            Schema::table('pos_payments', function (Blueprint $table): void {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            });
        }

        if (Schema::hasTable('pos_shifts') && !Schema::hasColumn('pos_shifts', 'variance_cash')) {
            Schema::table('pos_shifts', function (Blueprint $table): void {
                $table->decimal('variance_cash', 14, 2)->nullable()->after('expected_cash');
            });
        }
    }

    public function down(): void
    {
        // no-op for safety on existing legacy DB
    }
};
