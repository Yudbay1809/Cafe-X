<?php

namespace App\Modules\Delivery\Services;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;
use App\Modules\Delivery\Interfaces\DeliveryProviderInterface;
use App\Modules\Delivery\Providers\GoFoodProvider;
use App\Modules\Delivery\Providers\GrabFoodProvider;
use App\Modules\Delivery\Providers\ShopeeFoodProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use RuntimeException;

class DeliveryService
{
    /** @var array<string, DeliveryProviderInterface> */
    protected array $providers = [];

    public function __construct()
    {
        $this->registerProviders();
    }

    /**
     * Register all available delivery providers
     */
    protected function registerProviders(): void
    {
        $this->providers['gofood'] = new GoFoodProvider();
        $this->providers['grabfood'] = new GrabFoodProvider();
        $this->providers['shopeefood'] = new ShopeeFoodProvider();
    }

    /**
     * Get provider by name
     */
    public function getProvider(string $providerName): DeliveryProviderInterface
    {
        $providerName = strtolower($providerName);

        if (!isset($this->providers[$providerName])) {
            throw new InvalidArgumentException("Delivery provider '{$providerName}' not found");
        }

        return $this->providers[$providerName];
    }

    /**
     * Check if provider is configured
     */
    public function isProviderConfigured(string $providerName): bool
    {
        try {
            return $this->getProvider($providerName)->isConfigured();
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Push order to delivery platform
     */
    public function pushOrder(string $providerName, DeliveryOrderDTO $order): array
    {
        $provider = $this->getProvider($providerName);

        Log::info("Pushing order to {$providerName}", [
            'order_id' => $order->orderId,
            'order_no' => $order->orderNo,
        ]);

        try {
            return $provider->pushOrder($order);
        } catch (\Exception $e) {
            Log::error("Failed to push order to {$providerName}", [
                'order_id' => $order->orderId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get order status from delivery platform
     */
    public function getOrderStatus(string $providerName, string $externalOrderId): array
    {
        $provider = $this->getProvider($providerName);

        try {
            return $provider->getOrderStatus($externalOrderId);
        } catch (\Exception $e) {
            Log::error("Failed to get order status from {$providerName}", [
                'external_order_id' => $externalOrderId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel order on delivery platform
     */
    public function cancelOrder(string $providerName, string $externalOrderId, string $reason = ''): array
    {
        $provider = $this->getProvider($providerName);

        try {
            return $provider->cancelOrder($externalOrderId, $reason);
        } catch (\Exception $e) {
            Log::error("Failed to cancel order on {$providerName}", [
                'external_order_id' => $externalOrderId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Handle incoming webhook from delivery platform
     */
    public function handleWebhook(string $providerName, array $payload, string $signature = ''): array
    {
        $provider = $this->getProvider($providerName);

        // Validate webhook signature
        if (!empty($signature) && !$provider->validateWebhookSignature($payload, $signature)) {
            Log::warning("Invalid webhook signature for {$providerName}");
            throw new RuntimeException('Invalid webhook signature');
        }

        return $provider->handleWebhook($payload);
    }

    /**
     * Get menu from delivery platform
     */
    public function getDeliveryMenu(string $providerName): array
    {
        $provider = $this->getProvider($providerName);

        try {
            return $provider->getMenu();
        } catch (\Exception $e) {
            Log::error("Failed to get menu from {$providerName}", [
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get all available providers
     */
    public function getAvailableProviders(): array
    {
        $providers = [];
        foreach ($this->providers as $name => $provider) {
            $providers[$name] = [
                'name' => $name,
                'configured' => $provider->isConfigured(),
            ];
        }

        return $providers;
    }

    /**
     * Create DeliveryOrderDTO from local order
     */
    public function createDeliveryOrderFromLocal(int $orderId): DeliveryOrderDTO
    {
        $order = DB::table('pos_orders')->where('id', $orderId)->first();
        if (!$order) {
            throw new InvalidArgumentException("Order #{$orderId} not found");
        }

        $items = DB::table('pos_order_items')
            ->where('order_id', $orderId)
            ->where('status', 'active')
            ->get()
            ->toArray();

        return DeliveryOrderDTO::fromOrder((array) $order, (array) $items);
    }
}