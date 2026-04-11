<?php

namespace App\Modules\Loyalty\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reward extends Model
{
    protected $table = 'loyalty_rewards';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'points_required',
        'discount_percent',
        'discount_amount',
        'fixed_price',
        'reward_type',
        'min_tier',
        'max_redemptions',
        'redemptions_count',
        'valid_from',
        'valid_until',
        'is_active',
        'image_url',
    ];

    protected $casts = [
        'points_required' => 'integer',
        'discount_percent' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'fixed_price' => 'decimal:2',
        'min_tier' => 'string',
        'max_redemptions' => 'integer',
        'redemptions_count' => 'integer',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'is_active' => 'boolean',
    ];

    public const TYPES = ['discount_percent', 'discount_amount', 'free_product', 'voucher'];

    /**
     * Check if reward is available for redemption
     */
    public function isAvailable(): bool
    {
        if (!$this->is_active) return false;
        if ($this->max_redemptions && $this->redemptions_count >= $this->max_redemptions) return false;
        
        $now = now();
        if ($this->valid_from && $now->lt($this->valid_from)) return false;
        if ($this->valid_until && $now->gt($this->valid_until)) return false;

        return true;
    }

    /**
     * Check if customer tier qualifies
     */
    public function customerQualifies(string $customerTier): bool
    {
        $tierLevels = ['bronze' => 0, 'silver' => 1, 'gold' => 2, 'platinum' => 3];
        
        $minTierLevel = $tierLevels[$this->min_tier] ?? 0;
        $customerTierLevel = $tierLevels[$customerTier] ?? 0;

        return $customerTierLevel >= $minTierLevel;
    }
}