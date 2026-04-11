<?php

namespace App\Modules\Payment\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class QrisPaymentService
{
    protected string $merchantId;
    protected string $apiKey;
    protected string $baseUrl;
    protected string $callbackUrl;

    public function __construct()
    {
        $this->merchantId = config('qris.merchant_id', '');
        $this->apiKey = config('qris.api_key', '');
        $this->baseUrl = config('qris.base_url', 'https://qris-payment.co.id');
        $this->callbackUrl = config('qris.callback_url', '');
    }

    /**
     * Check if QRIS is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->merchantId) && !empty($this->apiKey);
    }

    /**
     * Create QRIS payment transaction
     */
    public function createPayment(int $orderId, float $amount, string $orderNo): array
    {
        if (!$this->isConfigured()) {
            throw new RuntimeException('QRIS payment not configured');
        }

        $transactionId = $this->generateTransactionId($orderId);

        $payload = [
            'merchant_id' => $this->merchantId,
            'transaction_id' => $transactionId,
            'amount' => number_format($amount, 2, '.', ''),
            'currency' => 'IDR',
            'merchant_name' => config('app.name', 'Cafe-X'),
            'merchant_alias' => config('qris.merchant_alias', ''),
            'callback_url' => $this->callbackUrl,
            'merchant_defined_1' => (string) $orderId,
            'merchant_defined_2' => $orderNo,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout(30)
                ->post($this->baseUrl . '/api/v1/payment', $payload);

            if (!$response->successful()) {
                Log::error('QRIS payment creation failed', [
                    'order_id' => $orderId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new RuntimeException('Failed to create QRIS payment');
            }

            $result = $response->json();

            // Store transaction reference
            DB::table('pos_payments')->insert([
                'tenant_id' => null,
                'outlet_id' => null,
                'shift_id' => null,
                'order_id' => $orderId,
                'method' => 'qris',
                'amount' => $amount,
                'reference_no' => $transactionId,
                'paid_by' => 'system',
                'paid_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('QRIS payment created', [
                'order_id' => $orderId,
                'transaction_id' => $transactionId,
            ]);

            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'qr_string' => $result['qr_string'] ?? $result['qr_code'] ?? '',
                'qr_image' => $result['qr_image'] ?? '',
                'expires_at' => $result['expires_at'] ?? now()->addMinutes(5)->toIso8601String(),
            ];
        } catch (\Exception $e) {
            Log::error('QRIS payment error', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Check payment status
     */
    public function checkStatus(string $transactionId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout(10)
                ->get($this->baseUrl . '/api/v1/status/' . $transactionId);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Failed to check status',
                ];
            }

            $result = $response->json();

            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'status' => $this->mapStatus($result['status'] ?? 'unknown'),
                'amount' => $result['amount'] ?? 0,
                'paid_at' => $result['paid_at'] ?? null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Handle payment callback/webhook
     */
    public function handleCallback(array $payload): array
    {
        $transactionId = $payload['transaction_id'] ?? '';
        $status = $payload['status'] ?? '';

        Log::info('QRIS callback received', [
            'transaction_id' => $transactionId,
            'status' => $status,
        ]);

        // Find payment by transaction ID
        $payment = DB::table('pos_payments')
            ->where('reference_no', $transactionId)
            ->where('method', 'qris')
            ->first();

        if (!$payment) {
            return [
                'success' => false,
                'error' => 'Payment not found',
            ];
        }

        // If already paid, skip
        if ($payment->paid_at !== null) {
            return [
                'success' => true,
                'message' => 'Already processed',
            ];
        }

        if ($status === 'PAID' || $status === 'SUCCESS') {
            // Update payment to paid
            DB::table('pos_payments')
                ->where('id', $payment->id)
                ->update([
                    'paid_at' => now(),
                    'updated_at' => now(),
                ]);

            // Update order status
            DB::table('pos_orders')
                ->where('id', $payment->order_id)
                ->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'sync_version' => DB::raw('sync_version + 1'),
                    'updated_at' => now(),
                ]);

            Log::info('QRIS payment completed', [
                'order_id' => $payment->order_id,
                'transaction_id' => $transactionId,
            ]);

            return [
                'success' => true,
                'order_id' => $payment->order_id,
                'status' => 'paid',
            ];
        }

        return [
            'success' => false,
            'status' => $status,
        ];
    }

    /**
     * Cancel QRIS payment
     */
    public function cancelPayment(string $transactionId): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout(10)
                ->post($this->baseUrl . '/api/v1/cancel/' . $transactionId);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => 'Failed to cancel payment',
                ];
            }

            // Update payment record
            DB::table('pos_payments')
                ->where('reference_no', $transactionId)
                ->where('method', 'qris')
                ->update([
                    'paid_at' => null,
                    'updated_at' => now(),
                ]);

            return [
                'success' => true,
                'transaction_id' => $transactionId,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate unique transaction ID
     */
    protected function generateTransactionId(int $orderId): string
    {
        return 'QRIS-' . date('Ymd') . '-' . $orderId . '-' . bin2hex(random_bytes(4));
    }

    /**
     * Map external status to local status
     */
    protected function mapStatus(string $externalStatus): string
    {
        $statusMap = [
            'PENDING' => 'pending',
            'PAID' => 'paid',
            'SUCCESS' => 'paid',
            'EXPIRED' => 'expired',
            'FAILED' => 'failed',
            'CANCELED' => 'canceled',
            'CANCELLED' => 'canceled',
        ];

        return $statusMap[strtoupper($externalStatus)] ?? 'pending';
    }
}