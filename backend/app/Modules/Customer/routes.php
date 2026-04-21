<?php

use App\Modules\Customer\Controllers\QrController;
use Illuminate\Support\Facades\Route;

Route::post('/qr/create-order', [QrController::class, 'createOrder'])->middleware('throttle:20,1');
Route::get('/qr/menu/{tableToken}', [QrController::class, 'menu']);
Route::get('/public/menu', [QrController::class, 'publicMenu']);
Route::get('/qr/table-token/{tableCode}', [QrController::class, 'tableTokenByCode']);
Route::post('/qr/place-order', [QrController::class, 'placeOrder'])->middleware('throttle:20,1');
Route::post('/qr/validate-voucher', [QrController::class, 'validateVoucher'])->middleware('throttle:20,1');
Route::post('/qr/apply-voucher', [QrController::class, 'applyVoucher'])->middleware('throttle:20,1');
Route::get('/qr/lookup-member', [QrController::class, 'lookupMember']);
Route::post('/qr/apply-member', [QrController::class, 'applyMember']);
Route::post('/qr/redeem-points', [QrController::class, 'redeemPoints']);
Route::get('/qr/order-status/{tableToken}/{orderId}', [QrController::class, 'orderStatus'])->whereNumber('orderId');

Route::get('/customers', [\App\Modules\Customer\Controllers\CustomerController::class, 'index'])->middleware('perm:report.view');
Route::post('/customers', [\App\Modules\Customer\Controllers\CustomerController::class, 'store'])->middleware('perm:order.create');