<?php

use App\Modules\Inventory\Controllers\InventoryController;
use App\Modules\Inventory\Services\InventoryService;
use Illuminate\Support\Facades\Route;

Route::get('/inventory', [InventoryController::class, 'index'])->middleware('perm:product.manage');
Route::post('/inventory-adjustment', [InventoryController::class, 'adjust'])->middleware('perm:product.manage');

// Ingredient management
Route::get('/inventory/ingredients', function (InventoryService $svc) {
    $outletId = request()->query('outlet_id');
    $ingredients = \App\Modules\Inventory\Models\Ingredient::when($outletId, fn($q) => $q->where('outlet_id', $outletId))
        ->where('is_active', true)
        ->get();
    return response()->json(['success' => true, 'data' => $ingredients]);
})->middleware('perm:product.manage');

Route::post('/inventory/ingredients', function (InventoryService $svc) {
    $data = request()->validate([
        'name' => 'required|string',
        'unit' => 'required|string',
        'category' => 'nullable|string',
        'current_stock' => 'required|numeric|min:0',
        'minimum_stock' => 'required|numeric|min:0',
        'cost_per_unit' => 'required|numeric|min:0',
        'outlet_id' => 'nullable|integer',
    ]);
    
    $ingredient = \App\Modules\Inventory\Models\Ingredient::create($data);
    return response()->json(['success' => true, 'data' => $ingredient], 201);
})->middleware('perm:product.manage');

Route::get('/inventory/ingredients/{id}', function (InventoryService $svc, int $id) {
    $ingredient = \App\Modules\Inventory\Models\Ingredient::find($id);
    if (!$ingredient) return response()->json(['error' => 'Not found'], 404);
    return response()->json(['success' => true, 'data' => $ingredient]);
})->middleware('perm:product.manage');

Route::put('/inventory/ingredients/{id}', function (InventoryService $svc, int $id) {
    $ingredient = \App\Modules\Inventory\Models\Ingredient::find($id);
    if (!$ingredient) return response()->json(['error' => 'Not found'], 404);
    
    $data = request()->validate([
        'name' => 'sometimes|string',
        'unit' => 'sometimes|string',
        'minimum_stock' => 'sometimes|numeric|min:0',
        'maximum_stock' => 'sometimes|numeric|min:0',
        'cost_per_unit' => 'sometimes|numeric|min:0',
    ]);
    
    $ingredient->update($data);
    return response()->json(['success' => true, 'data' => $ingredient]);
})->middleware('perm:product.manage');

// Recipe management (product ingredients)
Route::get('/inventory/product/{productId}/recipe', function (InventoryService $svc, int $productId) {
    return response()->json(['success' => true, 'data' => $svc->getProductIngredients($productId)]);
})->middleware('perm:product.manage');

Route::post('/inventory/product/{productId}/recipe', function (InventoryService $svc, int $productId) {
    $data = request()->validate([
        'ingredient_id' => 'required|integer',
        'quantity' => 'required|numeric|min:0.001',
        'unit' => 'required|string',
    ]);
    
    $recipe = \App\Modules\Inventory\Models\Recipe::updateOrCreate(
        ['product_id' => $productId, 'ingredient_id' => $data['ingredient_id']],
        ['quantity' => $data['quantity'], 'unit' => $data['unit'], 'is_active' => true]
    );
    
    return response()->json(['success' => true, 'data' => $recipe], 201);
})->middleware('perm:product.manage');

Route::get('/inventory/product/{productId}/cost', function (InventoryService $svc, int $productId) {
    return response()->json(['success' => true, 'data' => $svc->calculateProductCost($productId)]);
})->middleware('perm:product.manage');

Route::get('/inventory/product/{productId}/suggested-price', function (InventoryService $svc, int $productId) {
    $margin = request()->query('margin', 0.70);
    return response()->json(['success' => true, 'data' => $svc->getSuggestedPrice($productId, (float) $margin)]);
})->middleware('perm:product.manage');

// Low stock alerts
Route::get('/inventory/alerts/low-stock', function (InventoryService $svc) {
    $outletId = request()->query('outlet_id');
    return response()->json($svc->getLowStockAlerts($outletId));
})->middleware('perm:product.manage');
