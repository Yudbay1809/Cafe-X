<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RecipeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenantId = 1; // Default tenant

        // 1. Create Ingredients
        $beansId = DB::table('ingredients')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Coffee Beans (Arabica)',
            'unit' => 'gram',
            'stock' => 10000, // 10kg
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $milkId = DB::table('ingredients')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Fresh Milk',
            'unit' => 'ml',
            'stock' => 20000, // 20L
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sugarId = DB::table('ingredients')->insertGetId([
            'tenant_id' => $tenantId,
            'name' => 'Palm Sugar',
            'unit' => 'ml',
            'stock' => 5000, // 5L
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Create Recipes for Products (matching id_menu from previous check)
        // Product 1: Espresso (20g Beans)
        DB::table('recipes')->insert([
            'product_id' => 1,
            'ingredient_id' => $beansId,
            'qty' => 20,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Product 4: Latte (20g Beans, 150ml Milk)
        DB::table('recipes')->insert([
            [
                'product_id' => 4,
                'ingredient_id' => $beansId,
                'qty' => 20,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => 4,
                'ingredient_id' => $milkId,
                'qty' => 150,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
