<?php

use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\ShiftController;
use Illuminate\Support\Facades\Route;

Route::get('/master/products', [MasterController::class, 'products'])->middleware('perm:order.create');
Route::get('/master/tables', [MasterController::class, 'tables'])->middleware('perm:table.manage');
Route::post('/tables/upsert', [MasterController::class, 'upsertTable'])->middleware('perm:table.manage');
Route::post('/shift/open', [ShiftController::class, 'open'])->middleware('perm:shift.open');
Route::post('/shift/close', [ShiftController::class, 'close'])->middleware('perm:shift.close');
