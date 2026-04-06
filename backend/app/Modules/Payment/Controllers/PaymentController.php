<?php

namespace App\Modules\Payment\Controllers;

use App\Support\ApiResponse;
use App\Modules\Payment\Services\PaymentService;
use App\Services\IdempotencyService;
use Illuminate\Http\Request;

class PaymentController
{
    use ApiResponse;

    public function __construct(
        private readonly PaymentService $service,
        private readonly IdempotencyService $idempotency
    ) {
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|integer|min:1',
            'method' => 'required|in:cash,qris,transfer,card,other',
            'amount' => 'required|numeric|min:0.01',
            'reference_no' => 'nullable|string|max:120',
        ]);

        $auth = (array) $request->attributes->get('auth_user', []);
        $actor = (string) ($auth['username'] ?? 'system');
        $replay = $this->idempotency->getReplay($request, 'payments', $actor);
        if ($replay !== null) {
            return response()->json($replay);
        }

        $result = $this->service->pay(
            actor: $actor,
            orderId: (int) $data['order_id'],
            method: (string) $data['method'],
            amount: (float) $data['amount'],
            referenceNo: (string) ($data['reference_no'] ?? '')
        );

        $response = [
            'success' => true,
            'message' => 'Pembayaran berhasil',
            'data' => $result,
            'server_time' => now()->format('Y-m-d H:i:s'),
        ];
        $this->idempotency->store($request, 'payments', $actor, $response);
        return response()->json($response);
    }
}

