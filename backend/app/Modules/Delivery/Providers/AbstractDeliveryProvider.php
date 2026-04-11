<?php

namespace App\Modules\Delivery\Providers;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;
use App\Modules\Delivery\Interfaces\DeliveryProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

abstract class AbstractDeliveryProvider implements DeliveryProviderInterface
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $secretKey;
    protected string $storeId;

    public function __construct()
    {
        $this->baseUrl = config("delivery.{$this->getProviderName()}.base_url", '');
        $this->apiKey = config("delivery.{$this->getProviderName()}.api_key", '');
        $this->secretKey = config("delivery.{$this->getProviderName()}.secret_key", '');
        $this->storeId = config("delivery.{$this->getProviderName()}.store_id", '');
    }

    /**
     * Make HTTP request to delivery platform
     */
    protected function request(string $method, string $endpoint, array $data = []): array
    {
        $url = rtrim($this->baseUrl, '/') . '/' . ltrim($endpoint, '/');

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'X-Store-ID' => $this->storeId,
            ])
                ->timeout(30)
                ->$method($url, $data);

            if (!$response->successful()) {
                Log::error("Delivery API error", [
                    'provider' => $this->getProviderName(),
                    'method' => $method,
                    'endpoint' => $endpoint,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                throw new RuntimeException("Delivery API error: " . $response->status());
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Delivery request failed", [
                'provider' => $this->getProviderName(),
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Map local order items to delivery platform format
     */
    protected function mapItems(array $items): array
    {
        return array_map(function ($item) {
            return [
                'id' => $item['product_id'] ?? $item['id'],
                'name' => $item['product_name_snapshot'] ?? $item['name'] ?? 'Unknown',
                'qty' => $item['qty'] ?? 1,
                'unit_price' => $item['unit_price'] ?? $item['price'] ?? 0,
                'subtotal' => $item['line_subtotal'] ?? $item['subtotal'] ?? 0,
                'notes' => $item['notes'] ?? '',
            ];
        }, $items);
    }

    /**
     * Parse webhook payload to standard format
     */
    abstract public function parseWebhookPayload(array $payload): array;

    /**
     * Map external status to local status
     */
    abstract public function mapStatus(string $externalStatus): string;

    /**
     * Validate required config for this provider
     */
    public function isConfigured(): bool
    {
        return !empty($this->baseUrl)
            && !empty($this->apiKey)
            && !empty($this->storeId);
    }
}