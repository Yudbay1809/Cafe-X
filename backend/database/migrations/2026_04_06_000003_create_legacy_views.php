<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("DROP TABLE IF EXISTS products");
            DB::statement("DROP TABLE IF EXISTS users");
        } else {
            DB::statement("DROP TABLE IF EXISTS products CASCADE");
            DB::statement("DROP TABLE IF EXISTS users CASCADE");
        }
        DB::statement("CREATE VIEW products AS SELECT * FROM produk");
        DB::statement("CREATE VIEW users AS SELECT * FROM user");
    }

    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS products");
        DB::statement("DROP VIEW IF EXISTS users");
    }
};
