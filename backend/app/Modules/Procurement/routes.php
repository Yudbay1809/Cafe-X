<?php

use App\Http\Controllers\Api\ProcurementController;
use Illuminate\Support\Facades\Route;

// Suppliers
Route::get('/suppliers', [ProcurementController::class, 'supplierIndex'])->middleware('perm:product.manage');
Route::post('/suppliers', [ProcurementController::class, 'supplierStore'])->middleware('perm:product.manage');
Route::put('/suppliers/{id}', [ProcurementController::class, 'supplierUpdate'])->middleware('perm:product.manage');
Route::delete('/suppliers/{id}', [ProcurementController::class, 'supplierDestroy'])->middleware('perm:product.manage');

// Purchase Orders
Route::get('/procurement/purchase-orders', [ProcurementController::class, 'poIndex'])->middleware('perm:product.manage');
Route::post('/procurement/purchase-orders', [ProcurementController::class, 'poStore'])->middleware('perm:product.manage');
Route::get('/procurement/purchase-orders/{id}', [ProcurementController::class, 'poShow'])->middleware('perm:product.manage');
Route::patch('/procurement/purchase-orders/{id}/status', [ProcurementController::class, 'poUpdateStatus'])->middleware('perm:product.manage');

// Goods Receipts
Route::get('/procurement/goods-receipts', [ProcurementController::class, 'grIndex'])->middleware('perm:product.manage');
Route::post('/procurement/goods-receipts', [ProcurementController::class, 'grStore'])->middleware('perm:product.manage');
Route::get('/procurement/goods-receipts/{id}', [ProcurementController::class, 'grShow'])->middleware('perm:product.manage');
