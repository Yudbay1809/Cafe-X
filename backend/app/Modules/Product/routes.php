<?php

use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/products', [ProductController::class, 'index'])->middleware('perm:product.manage');
Route::post('/products', [ProductController::class, 'store'])->middleware('perm:product.manage');
Route::put('/products/{id}', [ProductController::class, 'update'])->middleware('perm:product.manage')->whereNumber('id');
Route::delete('/products/{id}', [ProductController::class, 'destroy'])->middleware('perm:product.manage')->whereNumber('id');
