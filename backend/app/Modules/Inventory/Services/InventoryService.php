<?php

namespace App\Modules\Inventory\Services;

use App\Modules\Inventory\Models\Ingredient;
use App\Modules\Inventory\Models\Recipe;
use App\Services\StockService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;

class InventoryService
{
    public function __construct(private readonly StockService $stockService)
    {
    }

    /**
     * Increase ingredient stock
     */
    public function increaseIngredient(int $ingredientId, float $quantity, ?string $notes = null): array
    {
        $ingredient = Ingredient::find($ingredientId);
        if (!$ingredient) {
            throw new InvalidArgumentException('Ingredient not found');
        }

        DB::transaction(function () use ($ingredient, $quantity, $notes) {
            $ingredient->current_stock += $quantity;
            $ingredient->save();

            $this->recordMovement(
                $ingredient->id,
                'purchase',
                $quantity,
                $notes ?? 'Stock increase',
                $ingredient->outlet_id
            );
        });

        return [
            'success' => true,
            'ingredient_id' => $ingredientId,
            'new_stock' => $ingredient->current_stock,
        ];
    }

    /**
     * Decrease ingredient stock
     */
    public function decreaseIngredient(int $ingredientId, float $quantity, ?string $notes = null): array
    {
        $ingredient = Ingredient::find($ingredientId);
        if (!$ingredient) {
            throw new InvalidArgumentException('Ingredient not found');
        }

        if ($ingredient->current_stock < $quantity) {
            throw new InvalidArgumentException("Insufficient stock for {$ingredient->name}");
        }

        DB::transaction(function () use ($ingredient, $quantity, $notes) {
            $ingredient->current_stock -= $quantity;
            $ingredient->save();

            $this->recordMovement(
                $ingredient->id,
                'usage',
                -$quantity,
                $notes ?? 'Stock decrease',
                $ingredient->outlet_id
            );
        });

        return [
            'success' => true,
            'ingredient_id' => $ingredientId,
            'new_stock' => $ingredient->current_stock,
        ];
    }

    /**
     * Deduct ingredients when product is sold
     */
    public function deductForProduct(int $productId, int $quantity): array
    {
        $recipes = Recipe::where('product_id', $productId)
            ->where('is_active', true)
            ->with('ingredient')
            ->get();

        $deductions = [];

        foreach ($recipes as $recipe) {
            $ingredient = $recipe->ingredient;
            $deductQty = $recipe->quantity * $quantity;

            if ($ingredient->current_stock < $deductQty) {
                Log::warning('Insufficient ingredient stock', [
                    'product_id' => $productId,
                    'ingredient' => $ingredient->name,
                    'needed' => $deductQty,
                    'available' => $ingredient->current_stock,
                ]);

                $deductions[] = [
                    'ingredient' => $ingredient->name,
                    'needed' => $deductQty,
                    'available' => $ingredient->current_stock,
                    'status' => 'insufficient',
                ];
                continue;
            }

            $ingredient->current_stock -= $deductQty;
            $ingredient->save();

            $this->recordMovement(
                $ingredient->id,
                'sale',
                -$deductQty,
                "Product sold: {$productId} x{$quantity}",
                $ingredient->outlet_id
            );

            $deductions[] = [
                'ingredient' => $ingredient->name,
                'deducted' => $deductQty,
                'remaining' => $ingredient->current_stock,
                'status' => 'success',
            ];
        }

        return [
            'success' => true,
            'product_id' => $productId,
            'quantity' => $quantity,
            'deductions' => $deductions,
        ];
    }

    /**
     * Get ingredients for a product
     */
    public function getProductIngredients(int $productId): array
    {
        $recipes = Recipe::where('product_id', $productId)
            ->where('is_active', true)
            ->with('ingredient')
            ->get();

        return $recipes->map(fn($r) => [
            'ingredient_id' => $r->ingredient_id,
            'name' => $r->ingredient->name,
            'quantity' => $r->quantity,
            'unit' => $r->unit,
            'cost' => $r->getCostAttribute(),
            'current_stock' => $r->ingredient->current_stock,
            'sufficient' => $r->ingredient->current_stock >= $r->quantity,
        ])->toArray();
    }

    /**
     * Calculate product food cost
     */
    public function calculateProductCost(int $productId): array
    {
        $recipes = Recipe::where('product_id', $productId)
            ->where('is_active', true)
            ->with('ingredient')
            ->get();

        $totalCost = 0;
        $ingredients = [];

        foreach ($recipes as $recipe) {
            $cost = (float) ($recipe->quantity * $recipe->ingredient->cost_per_unit);
            $totalCost += $cost;

            $ingredients[] = [
                'name' => $recipe->ingredient->name,
                'quantity' => $recipe->quantity,
                'unit' => $recipe->unit,
                'cost_per_unit' => $recipe->ingredient->cost_per_unit,
                'total_cost' => $cost,
            ];
        }

        return [
            'product_id' => $productId,
            'total_cost' => round($totalCost, 2),
            'ingredients' => $ingredients,
        ];
    }

    /**
     * Get suggested price based on margin
     */
    public function getSuggestedPrice(int $productId, float $targetMargin = 0.70): array
    {
        $costData = $this->calculateProductCost($productId);
        $foodCost = $costData['total_cost'];

        // Suggested price = cost / (1 - target margin)
        $suggestedPrice = $foodCost > 0 ? $foodCost / (1 - $targetMargin) : 0;

        return [
            'product_id' => $productId,
            'food_cost' => $foodCost,
            'target_margin' => $targetMargin * 100 . '%',
            'suggested_price' => round($suggestedPrice, -3), // Round to nearest 1000
            'break_even' => round($foodCost * 1.1, -3), // 10% margin
        ];
    }

    /**
     * Get low stock alerts
     */
    public function getLowStockAlerts(?int $outletId = null): array
    {
        $query = Ingredient::where('current_stock', '<=', DB::raw('minimum_stock'))
            ->where('is_active', true);

        if ($outletId) {
            $query->where('outlet_id', $outletId);
        }

        $alerts = $query->get()->map(fn($i) => [
            'id' => $i->id,
            'name' => $i->name,
            'current_stock' => $i->current_stock,
            'minimum_stock' => $i->minimum_stock,
            'unit' => $i->unit,
            'outlet_id' => $i->outlet_id,
        ]);

        return [
            'success' => true,
            'alerts' => $alerts,
            'count' => $alerts->count(),
        ];
    }

    /**
     * Record ingredient movement
     */
    protected function recordMovement(int $ingredientId, string $type, float $quantity, string $notes, ?int $outletId): void
    {
        DB::table('inventory_movements')->insert([
            'ingredient_id' => $ingredientId,
            'outlet_id' => $outletId,
            'type' => $type,
            'quantity' => $quantity,
            'notes' => $notes,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    // Legacy methods - delegate to StockService
    public function increase(int $productId, int $qty): void
    {
        $this->stockService->increase($productId, $qty);
    }

    public function decrease(int $productId, int $qty): void
    {
        $this->stockService->decrease($productId, $qty);
    }
}