<?php

use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::post('/orders/create', [OrderController::class, 'create'])->middleware('perm:order.create');
Route::get('/orders', [OrderController::class, 'index'])->middleware('perm:order.create');
Route::post('/orders/add-item', [OrderController::class, 'addItem'])->middleware('perm:order.create');
Route::post('/orders/update-item', [OrderController::class, 'updateItem'])->middleware('perm:order.item.edit');
Route::post('/orders/cancel-item', [OrderController::class, 'cancelItem'])->middleware('perm:order.item.cancel');
Route::post('/orders/move-table', [OrderController::class, 'moveTable'])->middleware('perm:table.manage');
Route::post('/orders/merge', [OrderController::class, 'merge'])->middleware('perm:order.merge');
Route::post('/orders/split', [OrderController::class, 'split'])->middleware('perm:order.split');
Route::get('/orders/{orderId}', [OrderController::class, 'detail'])->middleware('perm:order.create')->whereNumber('orderId');
Route::post('/orders/status', [OrderController::class, 'status'])->middleware('perm:order.create');
Route::post('/orders/pay', [OrderController::class, 'pay'])->middleware(['perm:order.pay', 'throttle:30,1']);
Route::post('/orders/cancel', [OrderController::class, 'cancel'])->middleware('perm:order.cancel');
Route::post('/orders/receipt', [OrderController::class, 'receipt'])->middleware('perm:order.reprint');
Route::post('/orders/reprint', [OrderController::class, 'reprint'])->middleware('perm:order.reprint');
