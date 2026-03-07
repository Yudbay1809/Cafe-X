<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function ok(array $data = [], string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json([
            'ok' => true,
            'message' => $message,
            'data' => $data,
            'server_time' => now()->format('Y-m-d H:i:s'),
        ], $status);
    }

    protected function fail(string $message, int $status = 400, array $meta = []): JsonResponse
    {
        return response()->json([
            'ok' => false,
            'message' => $message,
            'meta' => $meta,
            'server_time' => now()->format('Y-m-d H:i:s'),
        ], $status);
    }
}

