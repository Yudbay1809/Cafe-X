<?php

use App\Modules\Payment\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::post('/payments', [PaymentController::class, 'store'])->middleware('perm:order.pay');

// QRIS payment callback (no auth required)
Route::post('/payments/qris/callback', [PaymentController::class, 'qrisCallback']);

// Check QRIS payment status
Route::get('/payments/qris/status/{transactionId}', [PaymentController::class, 'qrisStatus']);
