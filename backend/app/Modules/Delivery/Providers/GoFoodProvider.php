<?php

namespace App\Modules\Delivery\Providers;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;
use Illuminate\Support\Facades\Log;

class GoFoodProvider extends AbstractDeliveryProvider
{
    public function getProviderName(): string
    {
        return 'gofood';
    }

    public function pushOrder(DeliveryOrderDTO $order): array
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('GoFood provider not configured');
        }

        $payload = [
            'external_store_id' => $this->storeId,
            'order_reference' => $order->orderNo,
            'customer' => [
                'name' => $order->customerName ?? 'Customer',
                'phone' => $order->customerPhone ?? '',
                'delivery_address' => $order->deliveryAddress,
            ],
            'items' => $this->mapItems($order->items),
            'subtotal' => $order->subtotal,
            'tax' => $order->taxAmount,
            'service' => $order->serviceAmount,
            'total' => $order->totalAmount,
            'notes' => $order->notes ?? '',
        ];

        $response = $this->request('POST', 'orders', $payload);

        Log::info('GoFood order pushed', [
            'order_id' => $order->orderId,
            'external_order_id' => $response['order_id'] ?? null,
        ]);

        return [
            'success' => true,
            'external_order_id' => $response['order_id'] ?? null,
            'status' => $response['status'] ?? 'pending',
            'response' => $response,
        ];
    }

    public function getOrderStatus(string $externalOrderId): array
    {
        $response = $this->request('GET', "orders/{$externalOrderId}");

        return [
            'external_order_id' => $externalOrderId,
            'status' => $this->mapStatus($response['status'] ?? 'unknown'),
            'external_status' => $response['status'] ?? null,
            'estimated_delivery' => $response['estimated_delivery_time'] ?? null,
            'driver' => $response['driver'] ?? null,
        ];
    }

    public function cancelOrder(string $externalOrderId, string $reason = ''): array
    {
        $response = $this->request('POST', "orders/{$externalOrderId}/cancel", [
            'reason' => $reason,
        ]);

        Log::info('GoFood order cancelled', [
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

        Log::info('GoFood webhook received', [
            'external_order_id' => $parsed['external_order_id'],
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
            'availability' => ($localProduct['stok'] ?? 1) > 0,
            'image_url' => $localProduct['gambar'] ?? $localProduct['image_url'] ?? '',
        ];
    }

    public function getMenu(): array
    {
        $response = $this->request('GET', 'menu');

        return array_map([$this, 'mapProduct'], $response['products'] ?? []);
    }

    public function parseWebhookPayload(array $payload): array
    {
        return [
            'external_order_id' => $payload['order_id'] ?? $payload['orderId'] ?? null,
            'local_order_reference' => $payload['order_reference'] ?? $payload['orderReference'] ?? null,
            'status' => $this->mapStatus($payload['status'] ?? 'unknown'),
            'timestamp' => $payload['timestamp'] ?? now()->toIso8601String(),
            'driver' => $payload['driver'] ?? null,
            'reason' => $payload['reason'] ?? null,
        ];
    }

    public function mapStatus(string $externalStatus): string
    {
        $statusMap = [
            'pending' => 'new',
            'accepted' => 'confirmed',
            'cooking' => 'preparing',
            'ready_for_pickup' => 'ready',
            'picked_up' => 'delivering',
            'delivered' => 'served',
            'cancelled' => 'canceled',
        ];

        return $statusMap[strtolower($externalStatus)] ?? 'new';
    }
}