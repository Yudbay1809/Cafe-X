<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    require base_path('app/Modules/Shared/routes.php');
    require base_path('app/Modules/Auth/routes.php');
    require base_path('app/Modules/Customer/routes.php');

    Route::middleware(['api.token'])->group(function (): void {
        require base_path('app/Modules/Auth/routes_private.php');
        require base_path('app/Modules/Outlet/routes.php');
        require base_path('app/Modules/POS/routes.php');
        require base_path('app/Modules/POS/routes_sync.php');
        require base_path('app/Modules/Product/routes.php');
        require base_path('app/Modules/Order/routes.php');
        require base_path('app/Modules/Report/routes.php');
    });
});


