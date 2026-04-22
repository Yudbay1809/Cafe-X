<?php

use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

Route::post('/sync/pull', [SyncController::class, 'pull'])->middleware('perm:sync.use');
Route::post('/sync/push', [SyncController::class, 'push'])->middleware(['perm:sync.use', 'throttle:40,1']);
Route::post('/pos/sync', [SyncController::class, 'posSync'])->middleware(['perm:sync.use', 'throttle:40,1']);

// Cafe-X V2.0 Mobile POS Sync Routes (Bypassing strict auth for local testing, add auth later)
use App\Modules\POS\Controllers\MobilePosSyncController;
use App\Modules\POS\Controllers\SultanController;

Route::group(['prefix' => 'sync'], function () {
    Route::get('/master', [MobilePosSyncController::class, 'syncMaster']);
    Route::post('/pos/bulk', [MobilePosSyncController::class, 'syncPos']);
    Route::get('/online-orders', [MobilePosSyncController::class, 'getOnlineOrders']);
    Route::post('/expenses', [MobilePosSyncController::class, 'syncExpenses']);
    
    // Sultan Expansion Routes
    Route::post('/sultan/booking', [SultanController::class, 'createBooking']);
    Route::post('/sultan/loyalty/stamps', [SultanController::class, 'addStamps']);
    Route::get('/sultan/payroll', [SultanController::class, 'getPayroll']);
});