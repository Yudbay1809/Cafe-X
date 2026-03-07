<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $queueLag = (int) DB::table('jobs')->count();
        $syncFailedLastHour = (int) DB::table('pos_sync_logs')
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        return $this->ok([
            'service' => 'cafe-x-laravel-api',
            'version' => 'v1',
            'queue_lag' => $queueLag,
            'sync_failed_last_hour' => $syncFailedLastHour,
        ]);
    }
}
