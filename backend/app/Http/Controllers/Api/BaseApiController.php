<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;

/**
 * BaseApiController
 * 
 * Dasar untuk semua API Controller guna memastikan format respons yang seragam (Enterprise Standard).
 */
abstract class BaseApiController extends Controller
{
    use ApiResponse;

    /**
     * Helper untuk menangkap exception standar dan mengembalikannya dalam format gagal.
     */
    protected function handleException(\Exception $e, string $customMessage = 'Terjadi kesalahan internal')
    {
        \Log::error($e->getMessage(), [
            'exception' => get_class($e),
            'trace' => $e->getTraceAsString()
        ]);

        return $this->fail(
            config('app.debug') ? $e->getMessage() : $customMessage,
            500
        );
    }
}
