<?php

use App\Http\Controllers\Api\QrController;
use Illuminate\Support\Facades\Route;

Route::post('/qr/create-order', [QrController::class, 'createOrder'])->middleware('throttle:20,1');
Route::get('/qr/menu/{tableToken}', [QrController::class, 'menu']);
Route::get('/public/menu', [QrController::class, 'publicMenu']);
Route::get('/qr/table-token/{tableCode}', [QrController::class, 'tableTokenByCode']);
Route::post('/qr/place-order', [QrController::class, 'placeOrder'])->middleware('throttle:20,1');
Route::get('/qr/order-status/{tableToken}/{orderId}', [QrController::class, 'orderStatus'])->whereNumber('orderId');
