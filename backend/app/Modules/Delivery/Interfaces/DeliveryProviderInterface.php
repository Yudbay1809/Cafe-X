<?php

namespace App\Modules\Delivery\Interfaces;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;

interface DeliveryProviderInterface
{
    /**
     * Get the provider name (e.g., 'gofood', 'grabfood', 'shopeefood')
     */
    public function getProviderName(): string;

    /**
     * Push order to delivery platform
     */
    public function pushOrder(DeliveryOrderDTO $order): array;

    /**
     * Get order status from delivery platform
     */
    public function getOrderStatus(string $externalOrderId): array;

    /**
     * Cancel order on delivery platform
     */
    public function cancelOrder(string $externalOrderId, string $reason = ''): array;

    /**
     * Handle incoming webhook from delivery platform
     */
    public function handleWebhook(array $payload): array;

    /**
     * Validate webhook signature/token
     */
    public function validateWebhookSignature(array $payload, string $signature): bool;

    /**
     * Map local product to delivery platform product
     */
    public function mapProduct(array $localProduct): array;

    /**
     * Get menu from delivery platform
     */
    public function getMenu(): array;

    /**
     * Check if provider is configured with valid credentials
     */
    public function isConfigured(): bool;
}