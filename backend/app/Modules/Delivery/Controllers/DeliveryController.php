<?php

namespace App\Modules\Delivery\Controllers;

use App\Modules\Delivery\DTO\DeliveryOrderDTO;
use App\Modules\Delivery\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeliveryController
{
    public function __construct(
        protected DeliveryService $deliveryService
    ) {
    }

    /**
     * Get all available delivery providers and their status
     */
    public function providers(): JsonResponse
    {
        $providers = $this->deliveryService->getAvailableProviders();

        return response()->json([
            'success' => true,
            'data' => $providers,
        ]);
    }

    /**
     * Push order to delivery platform
     */
    public function pushOrder(Request $request, string $provider): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer',
        ]);

        try {
            $order = $this->deliveryService->createDeliveryOrderFromLocal($validated['order_id']);
            $result = $this->deliveryService->pushOrder($provider, $order);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'error' => $result['error'] ?? 'Failed to push order',
                ], 400);
            }

            // Update local order with external order ID if returned
            if (!empty($result['external_order_id'])) {
                DB::table('pos_orders')
                    ->where('id', $validated['order_id'])
                    ->update([
                        'delivery_provider' => $provider,
                        'external_order_id' => $result['external_order_id'],
                    ]);
            }

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to push order: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get order status from delivery platform
     */
    public function getOrderStatus(string $provider, string $externalOrderId): JsonResponse
    {
        $result = $this->deliveryService->getOrderStatus($provider, $externalOrderId);

        if (!$result['success'] ?? true) {
            return response()->json([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to get order status',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Cancel order on delivery platform
     */
    public function cancelOrder(Request $request, string $provider, string $externalOrderId): JsonResponse
    {
        $reason = $request->input('reason', '');

        $result = $this->deliveryService->cancelOrder($provider, $externalOrderId, $reason);

        if (!$result['success'] ?? true) {
            return response()->json([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to cancel order',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get menu from delivery platform
     */
    public function getMenu(string $provider): JsonResponse
    {
        $result = $this->deliveryService->getDeliveryMenu($provider);

        if (!$result['success'] ?? true) {
            return response()->json([
                'success' => false,
                'error' => $result['error'] ?? 'Failed to get menu',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Handle GoFood webhook
     */
    public function webhookGoFood(Request $request): JsonResponse
    {
        return $this->handleWebhook('gofood', $request);
    }

    /**
     * Handle GrabFood webhook
     */
    public function webhookGrabFood(Request $request): JsonResponse
    {
        return $this->handleWebhook('grabfood', $request);
    }

    /**
     * Handle ShopeeFood webhook
     */
    public function webhookShopeeFood(Request $request): JsonResponse
    {
        return $this->handleWebhook('shopeefood', $request);
    }

    /**
     * Generic webhook handler
     */
    protected function handleWebhook(string $provider, Request $request): JsonResponse
    {
        $payload = $request->all();
        $signature = $request->header('X-Signature', '');

        try {
            $result = $this->deliveryService->handleWebhook($provider, $payload, $signature);

            // Update local order status based on webhook
            if (!empty($result['order_id'])) {
                $this->updateLocalOrderStatus($result['order_id'], $result['status']);
            }

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Webhook processing failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update local order status from delivery platform status
     */
    protected function updateLocalOrderStatus(int $orderId, string $deliveryStatus): void
    {
        $statusMap = [
            'new' => 'new',
            'confirmed' => 'confirmed',
            'preparing' => 'preparing',
            'ready' => 'preparing',
            'delivering' => 'preparing',
            'served' => 'served',
            'canceled' => 'canceled',
        ];

        $localStatus = $statusMap[$deliveryStatus] ?? 'new';

        DB::table('pos_orders')
            ->where('id', $orderId)
            ->update([
                'status' => $localStatus,
                'sync_version' => DB::raw('sync_version + 1'),
                'updated_at' => now(),
            ]);
    }
}