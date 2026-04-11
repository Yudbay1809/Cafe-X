<?php

namespace App\Modules\Loyalty\Services;

use App\Modules\Loyalty\Models\Customer;
use App\Modules\Loyalty\Models\Reward;
use App\Modules\Loyalty\Models\PointsTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use RuntimeException;

class LoyaltyService
{
    /**
     * Points earning rate (1 point per X currency spent)
     */
    protected float $pointsRate;

    /**
     * Minimum order amount to earn points
     */
    protected float $minOrderAmount;

    /**
     * Points expiry days
     */
    protected int $pointsExpiryDays;

    public function __construct()
    {
        $this->pointsRate = config('loyalty.points_rate', 100); // 1 point per 100 IDR
        $this->minOrderAmount = config('loyalty.min_order_amount', 10000);
        $this->pointsExpiryDays = config('loyalty.points_expiry_days', 365);
    }

    /**
     * Find or create customer by phone
     */
    public function findOrCreateCustomer(string $phone, ?string $name = null, ?int $tenantId = null): Customer
    {
        $customer = Customer::where('phone', $phone)
            ->where('tenant_id', $tenantId)
            ->first();

        if ($customer) {
            if ($name && $customer->name !== $name) {
                $customer->name = $name;
                $customer->save();
            }
            return $customer;
        }

        return Customer::create([
            'tenant_id' => $tenantId,
            'phone' => $phone,
            'name' => $name ?? 'Customer',
            'tier' => 'bronze',
            'total_points' => 0,
            'available_points' => 0,
            'lifetime_spent' => 0,
            'total_orders' => 0,
            'is_active' => true,
            'referral_code' => $this->generateReferralCode(),
        ]);
    }

    /**
     * Earn points from order payment
     */
    public function earnPoints(int $orderId, int $customerId, float $orderAmount): array
    {
        if ($orderAmount < $this->minOrderAmount) {
            return [
                'success' => false,
                'reason' => 'Order amount below minimum for points earning',
                'points_earned' => 0,
            ];
        }

        $points = $this->calculatePoints($orderAmount);

        return DB::transaction(function () use ($orderId, $customerId, $orderAmount, $points) {
            $customer = Customer::lockForUpdate()->find($customerId);
            if (!$customer) {
                throw new InvalidArgumentException('Customer not found');
            }

            // Update customer points
            $customer->total_points += $points;
            $customer->available_points += $points;
            $customer->lifetime_spent += $orderAmount;
            $customer->total_orders += 1;
            $customer->last_order_at = now();

            // Check tier upgrade
            $newTier = Customer::calculateTier($customer->lifetime_spent);
            if ($newTier !== $customer->tier) {
                $customer->tier = $newTier;
                $customer->tier_upgraded_at = now();
            }

            $customer->save();

            // Record transaction
            $transaction = PointsTransaction::create([
                'customer_id' => $customerId,
                'order_id' => $orderId,
                'points' => $points,
                'type' => 'earn',
                'description' => 'Points earned from order',
                'expires_at' => now()->addDays($this->pointsExpiryDays),
            ]);

            Log::info('Points earned', [
                'customer_id' => $customerId,
                'order_id' => $orderId,
                'points' => $points,
                'tier' => $customer->tier,
            ]);

            return [
                'success' => true,
                'points_earned' => $points,
                'total_points' => $customer->total_points,
                'available_points' => $customer->available_points,
                'tier' => $customer->tier,
                'transaction_id' => $transaction->id,
            ];
        });
    }

    /**
     * Redeem points for reward
     */
    public function redeemPoints(int $customerId, int $rewardId, int $quantity = 1): array
    {
        return DB::transaction(function () use ($customerId, $rewardId, $quantity) {
            $customer = Customer::lockForUpdate()->find($customerId);
            if (!$customer) {
                throw new InvalidArgumentException('Customer not found');
            }

            $reward = Reward::lockForUpdate()->find($rewardId);
            if (!$reward) {
                throw new InvalidArgumentException('Reward not found');
            }

            if (!$reward->isAvailable()) {
                throw new RuntimeException('Reward is not available');
            }

            if (!$reward->customerQualifies($customer->tier)) {
                throw new RuntimeException('Customer tier does not qualify for this reward');
            }

            $totalPoints = $reward->points_required * $quantity;

            if ($customer->available_points < $totalPoints) {
                throw new RuntimeException('Insufficient points');
            }

            // Deduct points
            $customer->available_points -= $totalPoints;
            $customer->save();

            // Update reward redemption count
            $reward->redemptions_count += $quantity;
            $reward->save();

            // Record transaction
            $redemptionCode = $this->generateRedemptionCode();
            PointsTransaction::create([
                'customer_id' => $customerId,
                'points' => -$totalPoints,
                'type' => 'redeem',
                'description' => "Redeemed: {$reward->name}",
                'reference_id' => $redemptionCode,
            ]);

            Log::info('Points redeemed', [
                'customer_id' => $customerId,
                'reward_id' => $rewardId,
                'points_deducted' => $totalPoints,
                'redemption_code' => $redemptionCode,
            ]);

            return [
                'success' => true,
                'points_deducted' => $totalPoints,
                'available_points' => $customer->available_points,
                'redemption_code' => $redemptionCode,
                'reward' => [
                    'name' => $reward->name,
                    'type' => $reward->reward_type,
                    'discount_percent' => $reward->discount_percent,
                    'discount_amount' => $reward->discount_amount,
                    'fixed_price' => $reward->fixed_price,
                ],
            ];
        });
    }

    /**
     * Get customer points balance and history
     */
    public function getCustomerPoints(int $customerId): array
    {
        $customer = Customer::find($customerId);
        if (!$customer) {
            throw new InvalidArgumentException('Customer not found');
        }

        $transactions = PointsTransaction::where('customer_id', $customerId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'tier' => $customer->tier,
                'total_points' => $customer->total_points,
                'available_points' => $customer->available_points,
                'lifetime_spent' => $customer->lifetime_spent,
                'points_to_next_tier' => $customer->pointsToNextTier(),
            ],
            'transactions' => $transactions->map(fn($t) => [
                'id' => $t->id,
                'points' => $t->points,
                'type' => $t->type,
                'description' => $t->description,
                'created_at' => $t->created_at->toIso8601String(),
                'expires_at' => $t->expires_at?->toIso8601String(),
            ]),
        ];
    }

    /**
     * Get available rewards for customer
     */
    public function getAvailableRewards(int $customerId): array
    {
        $customer = Customer::find($customerId);
        if (!$customer) {
            throw new InvalidArgumentException('Customer not found');
        }

        $rewards = Reward::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            })
            ->where(function ($query) {
                $query->whereNull('max_redemptions')
                    ->orWhereRaw('redemptions_count < max_redemptions');
            })
            ->get()
            ->filter(fn($r) => $r->customerQualifies($customer->tier))
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'description' => $r->description,
                'points_required' => $r->points_required,
                'reward_type' => $r->reward_type,
                'discount_percent' => $r->discount_percent,
                'discount_amount' => $r->discount_amount,
                'fixed_price' => $r->fixed_price,
                'can_redeem' => $customer->available_points >= $r->points_required,
            ]);

        return [
            'success' => true,
            'rewards' => $rewards->values(),
        ];
    }

    /**
     * Process expired points (call via scheduler)
     */
    public function processExpiredPoints(): int
    {
        $expiredTransactions = PointsTransaction::where('expires_at', '<', now())
            ->where('points', '>', 0)
            ->where('type', 'earn')
            ->get();

        $totalExpired = 0;

        foreach ($expiredTransactions as $transaction) {
            $customer = Customer::find($transaction->customer_id);
            if (!$customer) continue;

            // Deduct from available points (but not below 0)
            $deductAmount = min($transaction->points, $customer->available_points);
            $customer->available_points -= $deductAmount;
            $customer->save();

            // Record expiration transaction
            PointsTransaction::create([
                'customer_id' => $customer->id,
                'points' => -$deductAmount,
                'type' => 'expire',
                'description' => 'Points expired',
                'reference_id' => "EXP-{$transaction->id}",
            ]);

            $totalExpired += $deductAmount;
        }

        Log::info('Expired points processed', ['total_expired' => $totalExpired]);

        return $totalExpired;
    }

    /**
     * Calculate points from order amount
     */
    protected function calculatePoints(float $amount): int
    {
        return (int) floor($amount / $this->pointsRate);
    }

    /**
     * Generate unique referral code
     */
    protected function generateReferralCode(): string
    {
        return strtoupper(substr(md5(uniqid()), 0, 8));
    }

    /**
     * Generate redemption code for rewards
     */
    protected function generateRedemptionCode(): string
    {
        return 'RDM-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
    }
}