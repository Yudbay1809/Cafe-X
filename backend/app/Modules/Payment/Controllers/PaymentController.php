<?php

namespace App\Modules\Payment\Controllers;

use App\Support\ApiResponse;
use App\Modules\Payment\Services\PaymentService;
use App\Modules\Payment\Services\QrisPaymentService;
use App\Services\IdempotencyService;
use Illuminate\Http\Request;

class PaymentController
{
    use ApiResponse;

    public function __construct(
        private readonly PaymentService $service,
        private readonly IdempotencyService $idempotency,
        private readonly ?QrisPaymentService $qrisService = null
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

    /**
     * Handle QRIS payment callback/webhook
     */
    public function qrisCallback(Request $request)
    {
        if ($this->qrisService === null) {
            return response()->json(['error' => 'QRIS not configured'], 503);
        }

        $result = $this->qrisService->handleCallback($request->all());

        return response()->json($result);
    }

    /**
     * Check QRIS payment status
     */
    public function qrisStatus(string $transactionId)
    {
        if ($this->qrisService === null) {
            return response()->json(['error' => 'QRIS not configured'], 503);
        }

        $result = $this->qrisService->checkStatus($transactionId);

        return response()->json($result);
    }
}

