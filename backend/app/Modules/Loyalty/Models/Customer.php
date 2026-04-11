<?php

namespace App\Modules\Loyalty\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    protected $table = 'loyalty_customers';

    protected $fillable = [
        'tenant_id',
        'phone',
        'email',
        'name',
        'birth_date',
        'gender',
        'total_points',
        'available_points',
        'lifetime_spent',
        'tier',
        'tier_upgraded_at',
        'tier_expires_at',
        'total_orders',
        'last_order_at',
        'referral_code',
        'referred_by',
        'is_active',
    ];

    protected $casts = [
        'total_points' => 'integer',
        'available_points' => 'integer',
        'lifetime_spent' => 'decimal:2',
        'tier' => 'string',
        'birth_date' => 'date',
        'tier_upgraded_at' => 'datetime',
        'tier_expires_at' => 'datetime',
        'total_orders' => 'integer',
        'last_order_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public const TIERS = ['bronze', 'silver', 'gold', 'platinum'];

    /**
     * Calculate tier based on lifetime spent
     */
    public static function calculateTier(float $lifetimeSpent): string
    {
        if ($lifetimeSpent >= 50000000) return 'platinum';
        if ($lifetimeSpent >= 20000000) return 'gold';
        if ($lifetimeSpent >= 5000000) return 'silver';
        return 'bronze';
    }

    /**
     * Get points needed for next tier
     */
    public function pointsToNextTier(): ?int
    {
        $tierThresholds = [
            'bronze' => 5000000,
            'silver' => 20000000,
            'gold' => 50000000,
        ];

        $currentThreshold = $tierThresholds[$this->tier] ?? 0;
        $nextThreshold = $tierThresholds[$this->tier] ?? null;

        if (!$nextThreshold) return null;

        return (int) ($nextThreshold - $this->lifetime_spent);
    }

    /**
     * Check if customer can redeem points
     */
    public function canRedeem(int $points): bool
    {
        return $this->available_points >= $points && $this->is_active;
    }
}