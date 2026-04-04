<?php

use App\Modules\Outlet\Controllers\OutletController;
use Illuminate\Support\Facades\Route;

Route::get('/outlets', [OutletController::class, 'index'])->middleware('perm:table.manage');
Route::put('/outlets/{id}/brand', [OutletController::class, 'updateBrand'])->middleware('perm:table.manage')->whereNumber('id');
