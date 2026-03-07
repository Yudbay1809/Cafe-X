<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdempotencyService
{
    public function getReplay(Request $request, string $endpoint, string $actor): ?array
    {
        $key = trim((string) $request->header('Idempotency-Key', ''));
        if ($key === '') {
            return null;
        }
        $hash = hash('sha256', $endpoint . '|' . $actor . '|' . $key);
        $row = DB::table('pos_idempotency_keys')->where('key_hash', $hash)->first();
        if (!$row) {
            return null;
        }
        $payload = json_decode((string) $row->response_json, true);
        return is_array($payload) ? $payload : null;
    }

    public function store(Request $request, string $endpoint, string $actor, array $response): void
    {
        $key = trim((string) $request->header('Idempotency-Key', ''));
        if ($key === '') {
            return;
        }
        $hash = hash('sha256', $endpoint . '|' . $actor . '|' . $key);
        DB::table('pos_idempotency_keys')->updateOrInsert(
            ['key_hash' => $hash],
            [
                'endpoint_name' => $endpoint,
                'username' => $actor,
                'response_json' => json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'created_at' => now(),
            ]
        );
    }
}

