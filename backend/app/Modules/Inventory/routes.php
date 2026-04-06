<?php

use App\Modules\Inventory\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

Route::get('/inventory', [InventoryController::class, 'index'])->middleware('perm:product.manage');
Route::post('/inventory-adjustment', [InventoryController::class, 'adjust'])->middleware('perm:product.manage');
