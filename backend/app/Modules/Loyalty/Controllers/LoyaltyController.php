<?php

namespace App\Modules\Loyalty\Controllers;

use App\Modules\Loyalty\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController
{
    public function __construct(
        protected LoyaltyService $loyaltyService
    ) {
    }

    /**
     * Find or create customer
     */
    public function findOrCreate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'name' => 'nullable|string|max:100',
        ]);

        try {
            $customer = $this->loyaltyService->findOrCreateCustomer(
                $validated['phone'],
                $validated['name'] ?? null,
                null
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $customer->id,
                    'phone' => $customer->phone,
                    'name' => $customer->name,
                    'tier' => $customer->tier,
                    'total_points' => $customer->total_points,
                    'available_points' => $customer->available_points,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get customer points balance and history
     */
    public function points(Request $request, int $customerId): JsonResponse
    {
        try {
            $result = $this->loyaltyService->getCustomerPoints($customerId);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available rewards for customer
     */
    public function rewards(Request $request, int $customerId): JsonResponse
    {
        try {
            $result = $this->loyaltyService->getAvailableRewards($customerId);

            return response()->json($result);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Redeem points for reward
     */
    public function redeem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id' => 'required|integer',
            'reward_id' => 'required|integer',
            'quantity' => 'nullable|integer|min:1|max:10',
        ]);

        try {
            $result = $this->loyaltyService->redeemPoints(
                $validated['customer_id'],
                $validated['reward_id'],
                $validated['quantity'] ?? 1
            );

            return response()->json($result);
        } catch (\InvalidArgumentException|\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Earn points from order (called after payment)
     */
    public function earnPoints(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer',
            'customer_id' => 'required|integer',
            'order_amount' => 'required|numeric|min:0',
        ]);

        try {
            $result = $this->loyaltyService->earnPoints(
                $validated['order_id'],
                $validated['customer_id'],
                (float) $validated['order_amount']
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Process expired points (scheduler endpoint)
     */
    public function processExpired(): JsonResponse
    {
        $totalExpired = $this->loyaltyService->processExpiredPoints();

        return response()->json([
            'success' => true,
            'total_expired' => $totalExpired,
        ]);
    }
}