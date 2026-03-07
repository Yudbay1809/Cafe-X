<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('outlets')) {
            Schema::table('outlets', function (Blueprint $table): void {
                if (!Schema::hasColumn('outlets', 'brand_color')) {
                    $table->string('brand_color', 12)->nullable()->after('timezone');
                }
                if (!Schema::hasColumn('outlets', 'brand_name')) {
                    $table->string('brand_name', 120)->nullable()->after('brand_color');
                }
                if (!Schema::hasColumn('outlets', 'contact_phone')) {
                    $table->string('contact_phone', 40)->nullable()->after('brand_name');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('outlets')) {
            Schema::table('outlets', function (Blueprint $table): void {
                if (Schema::hasColumn('outlets', 'contact_phone')) {
                    $table->dropColumn('contact_phone');
                }
                if (Schema::hasColumn('outlets', 'brand_name')) {
                    $table->dropColumn('brand_name');
                }
                if (Schema::hasColumn('outlets', 'brand_color')) {
                    $table->dropColumn('brand_color');
                }
            });
        }
    }
};
