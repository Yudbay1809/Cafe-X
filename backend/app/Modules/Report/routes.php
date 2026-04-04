<?php

use App\Modules\Report\Controllers\ReportController;
use App\Modules\Report\Controllers\AuditLogController;
use Illuminate\Support\Facades\Route;

Route::get('/reports/summary', [ReportController::class, 'summary'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/shift', [ReportController::class, 'shift'])->middleware(['perm:report.shift', 'feature:reports.basic']);
Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('perm:audit.view');
