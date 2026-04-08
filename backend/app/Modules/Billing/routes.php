<?php

use App\Http\Controllers\Api\BillingController;
use Illuminate\Support\Facades\Route;

Route::get('/billing/subscription', [BillingController::class, 'subscription'])->middleware(['perm:report.view', 'feature:billing.basic']);
Route::post('/billing/subscription', [BillingController::class, 'upsertSubscription'])->middleware(['perm:billing.manage', 'feature:billing.basic']);
Route::get('/billing/invoices', [BillingController::class, 'invoices'])->middleware(['perm:report.view', 'feature:billing.basic']);
Route::post('/billing/invoices', [BillingController::class, 'createInvoice'])->middleware(['perm:billing.manage', 'feature:billing.basic']);
Route::patch('/billing/invoices/{id}', [BillingController::class, 'updateInvoice'])->middleware(['perm:billing.manage', 'feature:billing.basic'])->whereNumber('id');
Route::post('/billing/invoices/{id}/mark-paid', [BillingController::class, 'markPaid'])->middleware(['perm:billing.manage', 'feature:billing.basic'])->whereNumber('id');
Route::post('/billing/demo/reset', [BillingController::class, 'demoReset'])->middleware(['perm:demo.reset', 'feature:demo.reset']);
