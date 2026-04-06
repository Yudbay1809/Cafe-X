<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("CREATE VIEW IF NOT EXISTS products AS SELECT * FROM produk");
        DB::statement("CREATE VIEW IF NOT EXISTS users AS SELECT * FROM user");
    }

    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS products");
        DB::statement("DROP VIEW IF EXISTS users");
    }
};
