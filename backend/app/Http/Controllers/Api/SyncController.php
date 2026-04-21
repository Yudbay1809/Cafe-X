<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SyncPullRequest;
use App\Http\Requests\Api\SyncPushRequest;
use App\Services\IdempotencyService;
use App\Services\SyncService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class SyncController extends BaseApiController
{

    public function __construct(
        private readonly SyncService $syncService,
        private readonly IdempotencyService $idempotency
    ) {
    }

    public function pull(SyncPullRequest $request)
    {
        $data = $request->validated();

        $auth = (array) $request->attributes->get('auth_user', []);
        $payload = $this->syncService->pull(
            tenantId: $auth['tenant_id'] ?? null,
            cursor: (string) ($data['cursor'] ?? '')
        );

        return $this->ok($payload);
    }

    public function push(SyncPushRequest $request)
    {
        $data = $request->validated();

        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');

        $replay = $this->idempotency->getReplay($request, 'sync/push', $actor);
        if ($replay !== null) {
            return response()->json($replay);
        }

        $result = $this->syncService->push(
            actor: $actor,
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            events: $data['events']
        );

        $response = [
            'success' => true,
            'message' => 'OK',
            'data' => $result,
            'server_time' => now()->format('Y-m-d H:i:s'),
        ];
        $this->idempotency->store($request, 'sync/push', $actor, $response);

        return response()->json($response);
    }

    public function posSync(Request $request)
    {
        $data = $request->validate([
            'events' => 'array',
            'cursor' => 'nullable|string',
        ]);
        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');

        $replay = $this->idempotency->getReplay($request, 'pos/sync', $actor);
        if ($replay !== null) {
            return response()->json($replay);
        }

        $pushResult = $this->syncService->push(
            actor: $actor,
            tenantId: $auth['tenant_id'] ?? null,
            outletId: $auth['outlet_id'] ?? null,
            events: $data['events'] ?? []
        );
        $pullResult = $this->syncService->pull(
            tenantId: $auth['tenant_id'] ?? null,
            cursor: (string) ($data['cursor'] ?? '')
        );

        $response = [
            'success' => true,
            'message' => 'OK',
            'data' => [
                'push' => $pushResult,
                'pull' => $pullResult,
            ],
            'server_time' => now()->format('Y-m-d H:i:s'),
        ];
        $this->idempotency->store($request, 'pos/sync', $actor, $response);

        return response()->json($response);
    }
}
