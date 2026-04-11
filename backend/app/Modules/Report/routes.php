<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\ReportController;
use App\Modules\Report\Services\AnalyticsService;
use Illuminate\Support\Facades\Route;

Route::get('/reports/summary', [ReportController::class, 'summary'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/shift', [ReportController::class, 'shift'])->middleware(['perm:report.shift', 'feature:reports.basic']);
Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('perm:audit.view');
Route::get('/reports/sales', [ReportController::class, 'sales'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/products', [ReportController::class, 'products'])->middleware(['perm:report.view', 'feature:reports.basic']);
Route::get('/reports/daily', [ReportController::class, 'daily'])->middleware(['perm:report.view', 'feature:reports.basic']);

// Analytics API endpoints
Route::get('/analytics/multi-outlet-summary', function (AnalyticsService $analytics) {
    $tenantId = request()->query('tenant_id');
    $startDate = request()->query('start_date');
    $endDate = request()->query('end_date');
    
    return response()->json($analytics->getMultiOutletSummary($tenantId, $startDate, $endDate));
})->middleware(['perm:report.view', 'feature:reports.analytics']);

Route::get('/analytics/outlet-performance', function (AnalyticsService $analytics) {
    $tenantId = request()->query('tenant_id');
    $period = request()->query('period', 'month');
    
    return response()->json($analytics->getOutletPerformance($tenantId, $period));
})->middleware(['perm:report.view', 'feature:reports.analytics']);

Route::get('/analytics/inventory-overview', function (AnalyticsService $analytics) {
    $outletId = request()->query('outlet_id');
    
    return response()->json($analytics->getInventoryOverview($outletId));
})->middleware(['perm:report.view', 'feature:reports.analytics']);

Route::get('/analytics/staff-performance', function (AnalyticsService $analytics) {
    $outletId = request()->query('outlet_id');
    $startDate = request()->query('start_date');
    $endDate = request()->query('end_date');
    
    return response()->json($analytics->getStaffPerformance($outletId, $startDate, $endDate));
})->middleware(['perm:report.view', 'feature:reports.analytics']);

Route::get('/analytics/hourly-sales', function (AnalyticsService $analytics) {
    $outletId = request()->query('outlet_id');
    $date = request()->query('date', now()->toDateString());
    
    return response()->json($analytics->getHourlySales($outletId, $date));
})->middleware(['perm:report.view', 'feature:reports.analytics']);

Route::get('/analytics/sales-by-category', function (AnalyticsService $analytics) {
    $outletId = request()->query('outlet_id');
    $startDate = request()->query('start_date');
    $endDate = request()->query('end_date');
    
    return response()->json($analytics->getSalesByCategory($outletId, $startDate, $endDate));
})->middleware(['perm:report.view', 'feature:reports.analytics']);