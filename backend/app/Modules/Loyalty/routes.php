<?php

use App\Modules\Loyalty\Controllers\LoyaltyController;
use Illuminate\Support\Facades\Route;

// Loyalty routes (public - no auth required for customer lookup)
Route::post('/loyalty/find', [LoyaltyController::class, 'findOrCreate']);
Route::get('/loyalty/customer/{customerId}/points', [LoyaltyController::class, 'points']);
Route::get('/loyalty/customer/{customerId}/rewards', [LoyaltyController::class, 'rewards']);

// Protected routes
Route::middleware(['api.token'])->group(function (): void {
    Route::post('/loyalty/redeem', [LoyaltyController::class, 'redeem']);
    Route::post('/loyalty/earn', [LoyaltyController::class, 'earnPoints']);
    
    // Admin only - scheduler endpoint
    Route::post('/loyalty/process-expired', [LoyaltyController::class, 'processExpired']);
});