<?php

namespace App\Modules\Payment\Services;

use App\Services\PosService;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private readonly PosService $posService,
        private readonly ?QrisPaymentService $qrisService = null
    ) {
    }

    public function pay(string $actor, int $orderId, string $method, float $amount, string $referenceNo = ''): array
    {
        // Handle QRIS specially
        if ($method === 'qris' && $this->qrisService !== null) {
            $order = DB::table('pos_orders')->where('id', $orderId)->first();
            if (!$order) {
                throw new \RuntimeException('Order tidak ditemukan');
            }

            $qrisResult = $this->qrisService->createPayment(
                orderId: $orderId,
                amount: (float) $order->total_amount,
                orderNo: (string) $order->order_no
            );

            if (!$qrisResult['success']) {
                throw new \RuntimeException($qrisResult['error'] ?? 'Failed to create QRIS payment');
            }

            return [
                'order_id' => $orderId,
                'method' => 'qris',
                'transaction_id' => $qrisResult['transaction_id'],
                'qr_string' => $qrisResult['qr_string'] ?? '',
                'qr_image' => $qrisResult['qr_image'] ?? '',
                'expires_at' => $qrisResult['expires_at'],
                'status' => 'pending',
            ];
        }

        return $this->posService->payOrder($actor, $orderId, $method, $amount, $referenceNo);
    }
}