<?php

namespace App\Modules\Delivery\Providers;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;
use Illuminate\Support\Facades\Log;

class ShopeeFoodProvider extends AbstractDeliveryProvider
{
    public function getProviderName(): string
    {
        return 'shopeefood';
    }

    public function pushOrder(DeliveryOrderDTO $order): array
    {
        if (!$this->isConfigured()) {
            throw new \RuntimeException('ShopeeFood provider not configured');
        }

        $payload = [
            'shop_id' => $this->storeId,
            'order_id' => $order->orderNo,
            'buyer' => [
                'name' => $order->customerName ?? 'Customer',
                'phone' => $order->customerPhone ?? '',
                'address' => $order->deliveryAddress,
            ],
            'items' => $this->mapItems($order->items),
            'price' => [
                'item_subtotal' => $order->subtotal,
                'tax' => $order->taxAmount,
                'service_fee' => $order->serviceAmount,
                'total' => $order->totalAmount,
            ],
            'note' => $order->notes ?? '',
        ];

        $response = $this->request('POST', 'api/v1/order/create', $payload);

        Log::info('ShopeeFood order pushed', [
            'order_id' => $order->orderId,
            'shopee_order_id' => $response['order_id'] ?? null,
        ]);

        return [
            'success' => true,
            'external_order_id' => $response['order_id'] ?? null,
            'status' => $response['status'] ?? 'PENDING',
            'response' => $response,
        ];
    }

    public function getOrderStatus(string $externalOrderId): array
    {
        $response = $this->request('GET', "api/v1/order/{$externalOrderId}");

        return [
            'external_order_id' => $externalOrderId,
            'status' => $this->mapStatus($response['status'] ?? 'UNKNOWN'),
            'external_status' => $response['status'] ?? null,
            'estimated_pickup' => $response['eta_pickup'] ?? null,
            'rider' => $response['rider'] ?? null,
        ];
    }

    public function cancelOrder(string $externalOrderId, string $reason = ''): array
    {
        $response = $this->request('POST', "api/v1/order/{$externalOrderId}/cancel", [
            'reason' => $reason,
        ]);

        Log::info('ShopeeFood order cancelled', [
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

        Log::info('ShopeeFood webhook received', [
            'shopee_order_id' => $parsed['external_order_id'],
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
            'available' => ($localProduct['stok'] ?? 1) > 0,
            'photo_url' => $localProduct['gambar'] ?? $localProduct['photo_url'] ?? '',
        ];
    }

    public function getMenu(): array
    {
        $response = $this->request('GET', 'api/v1/shop/menu');

        return array_map([$this, 'mapProduct'], $response['product_list'] ?? []);
    }

    public function parseWebhookPayload(array $payload): array
    {
        return [
            'external_order_id' => $payload['shopee_order_id'] ?? $payload['orderId'] ?? null,
            'local_order_reference' => $payload['client_order_id'] ?? $payload['orderId'] ?? null,
            'status' => $this->mapStatus($payload['status'] ?? 'UNKNOWN'),
            'timestamp' => $payload['update_time'] ?? $payload['timestamp'] ?? now()->toIso8601String(),
            'rider' => $payload['rider_info'] ?? null,
            'reason' => $payload['cancel_reason'] ?? null,
        ];
    }

    public function mapStatus(string $externalStatus): string
    {
        $statusMap = [
            'PENDING' => 'new',
            'CONFIRMED' => 'confirmed',
            'PREPARING' => 'preparing',
            'READY_TO_PICK' => 'ready',
            'PICKED_UP' => 'delivering',
            'DELIVERED' => 'served',
            'CANCELLED' => 'canceled',
            'REJECTED' => 'canceled',
        ];

        return $statusMap[strtoupper($externalStatus)] ?? 'new';
    }
}