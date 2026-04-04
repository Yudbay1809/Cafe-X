<?php

use App\Http\Controllers\Api\SyncController;
use Illuminate\Support\Facades\Route;

Route::post('/sync/pull', [SyncController::class, 'pull'])->middleware('perm:sync.use');
Route::post('/sync/push', [SyncController::class, 'push'])->middleware(['perm:sync.use', 'throttle:40,1']);
