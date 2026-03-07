<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\OutletController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QrController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShiftController;
use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', [HealthController::class, 'index']);

    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/qr/create-order', [QrController::class, 'createOrder'])->middleware('throttle:20,1');
    Route::get('/qr/menu/{tableToken}', [QrController::class, 'menu']);
    Route::get('/public/menu', [QrController::class, 'publicMenu']);
    Route::get('/qr/table-token/{tableCode}', [QrController::class, 'tableTokenByCode']);
    Route::post('/qr/place-order', [QrController::class, 'placeOrder'])->middleware('throttle:20,1');
    Route::get('/qr/order-status/{tableToken}/{orderId}', [QrController::class, 'orderStatus'])->whereNumber('orderId');

    Route::middleware(['api.token'])->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/outlets', [OutletController::class, 'index'])->middleware('perm:table.manage');
        Route::put('/outlets/{id}/brand', [OutletController::class, 'updateBrand'])->middleware('perm:table.manage')->whereNumber('id');

        Route::get('/master/products', [MasterController::class, 'products'])->middleware('perm:order.create');
        Route::get('/products', [ProductController::class, 'index'])->middleware('perm:product.manage');
        Route::post('/products', [ProductController::class, 'store'])->middleware('perm:product.manage');
        Route::put('/products/{id}', [ProductController::class, 'update'])->middleware('perm:product.manage')->whereNumber('id');
        Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware('perm:product.manage')->whereNumber('id');
        Route::get('/master/tables', [MasterController::class, 'tables'])->middleware('perm:table.manage');
        Route::post('/tables/upsert', [MasterController::class, 'upsertTable'])->middleware('perm:table.manage');

        Route::post('/shift/open', [ShiftController::class, 'open'])->middleware('perm:shift.open');
        Route::post('/shift/close', [ShiftController::class, 'close'])->middleware('perm:shift.close');

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

        Route::post('/sync/pull', [SyncController::class, 'pull'])->middleware('perm:sync.use');
        Route::post('/sync/push', [SyncController::class, 'push'])->middleware(['perm:sync.use', 'throttle:40,1']);
        Route::get('/reports/summary', [ReportController::class, 'summary'])->middleware(['perm:report.view', 'feature:reports.basic']);
        Route::get('/reports/shift', [ReportController::class, 'shift'])->middleware(['perm:report.shift', 'feature:reports.basic']);
    });
});
