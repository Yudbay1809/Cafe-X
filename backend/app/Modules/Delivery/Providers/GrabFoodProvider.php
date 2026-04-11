<?php

namespace App\Modules\Delivery\Providers;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;
use Illuminate\Support\Facades\Log;

class GrabFoodProvider extends AbstractDeliveryProvider
{
    public function getProviderName(): string
    {
        return 'grabfood';
    }

    public function pushOrder(DeliveryOrderDTO $order): array
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('GrabFood provider not configured');
        }

        $payload = [
            'partner_id' => $this->storeId,
            'external_order_ref' => $order->orderNo,
            'consumer' => [
                'name' => $order->customerName ?? 'Customer',
                'phone' => $order->customerPhone ?? '',
                'address' => $order->deliveryAddress,
            ],
            'order_items' => $this->mapItems($order->items),
            'amount' => [
                'subtotal' => $order->subtotal,
                'tax' => $order->taxAmount,
                'fees' => $order->serviceAmount,
                'total' => $order->totalAmount,
            ],
            'remarks' => $order->notes ?? '',
        ];

        $response = $this->request('POST', 'v2/orders', $payload);

        Log::info('GrabFood order pushed', [
            'order_id' => $order->orderId,
            'grab_order_id' => $response['grab_order_id'] ?? null,
        ]);

        return [
            'success' => true,
            'external_order_id' => $response['grab_order_id'] ?? $response['order_id'] ?? null,
            'status' => $response['status'] ?? 'PENDING',
            'response' => $response,
        ];
    }

    public function getOrderStatus(string $externalOrderId): array
    {
        $response = $this->request('GET', "v2/orders/{$externalOrderId}");

        return [
            'external_order_id' => $externalOrderId,
            'status' => $this->mapStatus($response['status'] ?? 'UNKNOWN'),
            'external_status' => $response['status'] ?? null,
            'estimated_pickup_time' => $response['estimated_pickup_time'] ?? null,
            'driver' => $response['driver'] ?? null,
        ];
    }

    public function cancelOrder(string $externalOrderId, string $reason = ''): array
    {
        $response = $this->request('POST', "v2/orders/{$externalOrderId}/cancel", [
            'cancellation_reason' => $reason,
        ]);

        Log::info('GrabFood order cancelled', [
            'external_order_id' => $externalOrderId,
            'reason' => $reason,
        ]);

        return [
            'success' => true,
            'external_order_id' => $externalOrderId,
            'response' => $response,
        ];
    }

    public function handleWebhook(array $payload): array
    {
        $parsed = $this->parseWebhookPayload($payload);

        Log::info('GrabFood webhook received', [
            'grab_order_id' => $parsed['external_order_id'],
            'status' => $parsed['status'],
        ]);

        return [
            'order_id' => $parsed['local_order_id'] ?? null,
            'external_order_id' => $parsed['external_order_id'],
            'status' => $parsed['status'],
            'timestamp' => $parsed['timestamp'],
        ];
    }

    public function validateWebhookSignature(array $payload, string $signature): bool
    {
        $payloadString = json_encode($payload);
        $expectedSignature = hash_hmac('sha256', $payloadString, $this->secretKey);

        return hash_equals($expectedSignature, $signature);
    }

    public function mapProduct(array $localProduct): array
    {
        return [
            'id' => $localProduct['id_menu'] ?? $localProduct['id'] ?? null,
            'name' => $localProduct['nama_menu'] ?? $localProduct['name'] ?? '',
            'price' => $localProduct['harga'] ?? $localProduct['price'] ?? 0,
            'category' => $localProduct['kategori'] ?? $localProduct['category'] ?? '',
            'in_stock' => ($localProduct['stok'] ?? 1) > 0,
            'image_url' => $localProduct['gambar'] ?? $localProduct['image_url'] ?? '',
        ];
    }

    public function getMenu(): array
    {
        $response = $this->request('GET', 'v2/menu');

        return array_map([$this, 'mapProduct'], $response['items'] ?? []);
    }

    public function parseWebhookPayload(array $payload): array
    {
        return [
            'external_order_id' => $payload['grab_order_id'] ?? $payload['orderId'] ?? null,
            'local_order_reference' => $payload['external_order_ref'] ?? $payload['orderRef'] ?? null,
            'status' => $this->mapStatus($payload['status'] ?? 'UNKNOWN'),
            'timestamp' => $payload['event_time'] ?? $payload['timestamp'] ?? now()->toIso8601String(),
            'driver' => $payload['driver'] ?? null,
            'reason' => $payload['cancellation_reason'] ?? null,
        ];
    }

    public function mapStatus(string $externalStatus): string
    {
        $statusMap = [
            'PENDING' => 'new',
            'CONFIRMED' => 'confirmed',
            'PREPARING' => 'preparing',
            'READY' => 'ready',
            'PICKED_UP' => 'delivering',
            'DELIVERED' => 'served',
            'CANCELLED' => 'canceled',
            'REJECTED' => 'canceled',
        ];

        return $statusMap[strtoupper($externalStatus)] ?? 'new';
    }
}