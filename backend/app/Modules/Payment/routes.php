<?php

use App\Modules\Payment\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::post('/payments', [PaymentController::class, 'store'])->middleware('perm:order.pay');
