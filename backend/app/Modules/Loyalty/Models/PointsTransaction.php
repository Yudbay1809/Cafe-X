<?php

namespace App\Modules\Loyalty\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointsTransaction extends Model
{
    protected $table = 'loyalty_points_transactions';

    protected $fillable = [
        'customer_id',
        'order_id',
        'points',
        'type',
        'description',
        'reference_id',
        'expires_at',
    ];

    protected $casts = [
        'points' => 'integer',
        'type' => 'string',
        'expires_at' => 'datetime',
    ];

    public const TYPES = ['earn', 'redeem', 'expire', 'adjust', 'bonus'];

    /**
     * Check if points are expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && now()->gt($this->expires_at);
    }
}