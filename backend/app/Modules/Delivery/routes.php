<?php

use App\Modules\Delivery\Controllers\DeliveryController;
use Illuminate\Support\Facades\Route;

Route::prefix('delivery')->group(function (): void {
    // Get available delivery providers
    Route::get('/providers', [DeliveryController::class, 'providers']);

    // Push order to delivery platform
    Route::post('/push/{provider}', [DeliveryController::class, 'pushOrder']);

    // Get order status from delivery platform
    Route::get('/status/{provider}/{externalOrderId}', [DeliveryController::class, 'getOrderStatus']);

    // Cancel order on delivery platform
    Route::post('/cancel/{provider}/{externalOrderId}', [DeliveryController::class, 'cancelOrder']);

    // Get menu from delivery platform
    Route::get('/menu/{provider}', [DeliveryController::class, 'getMenu']);
});

// Webhooks for delivery platforms (no auth required)
Route::prefix('webhooks/delivery')->group(function (): void {
    Route::post('/gofood', [DeliveryController::class, 'webhookGoFood']);
    Route::post('/grabfood', [DeliveryController::class, 'webhookGrabFood']);
    Route::post('/shopeefood', [DeliveryController::class, 'webhookShopeeFood']);
});