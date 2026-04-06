<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/reports/summary', [ReportController::class, 'summary'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/shift', [ReportController::class, 'shift'])->middleware(['perm:report.shift', 'feature:reports.basic']);
Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('perm:audit.view');
Route::get('/reports/sales', [ReportController::class, 'sales'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/products', [ReportController::class, 'products'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/daily', [ReportController::class, 'daily'])->middleware(['perm:report.view', 'feature:reports.basic']);