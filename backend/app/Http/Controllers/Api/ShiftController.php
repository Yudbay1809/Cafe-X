<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ShiftCloseRequest;
use App\Http\Requests\Api\ShiftOpenRequest;
use App\Services\AuditService;
use App\Services\ShiftService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Throwable;

class ShiftController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ShiftService $shiftService)
    {
    }

    public function open(ShiftOpenRequest $request): JsonResponse
    {
        $auth = $request->attributes->get('auth_user', []);
        $username = (string) ($auth['username'] ?? '');
        $data = $request->validated();

        try {
            $result = $this->shiftService->open(
                username: $username,
                openingCash: (float) $data['opening_cash'],
                tenantId: isset($auth['tenant_id']) ? (int) $auth['tenant_id'] : null,
                outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null,
                notes: (string) ($data['notes'] ?? '')
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: $username,
                eventType: 'shift.open',
                entityType: 'shift',
                entityId: (string) $result['shift_id'],
                payload: ['opening_cash' => (float) $data['opening_cash']]
            );
            return $this->ok($result, 'Shift dibuka');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }

    public function close(ShiftCloseRequest $request): JsonResponse
    {
        $auth = $request->attributes->get('auth_user', []);
        $username = (string) ($auth['username'] ?? '');
        $data = $request->validated();

        try {
            $result = $this->shiftService->close(
                username: $username,
                closingCash: (float) $data['closing_cash'],
                tenantId: isset($auth['tenant_id']) ? (int) $auth['tenant_id'] : null,
                outletId: isset($auth['outlet_id']) ? (int) $auth['outlet_id'] : null,
                notes: (string) ($data['notes'] ?? '')
            );
            app(AuditService::class)->log(
                tenantId: $auth['tenant_id'] ?? null,
                outletId: $auth['outlet_id'] ?? null,
                actor: $username,
                eventType: 'shift.close',
                entityType: 'shift',
                entityId: (string) $result['shift_id'],
                payload: $result
            );
            return $this->ok($result, 'Shift ditutup');
        } catch (Throwable $e) {
            return $this->fail($e->getMessage(), 409);
        }
    }
}
