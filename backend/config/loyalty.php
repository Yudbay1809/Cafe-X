<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Loyalty & CRM Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for customer loyalty points and rewards system.
    |
    */

    // Points earning configuration
    'points_rate' => env('LOYALTY_POINTS_RATE', 100), // 1 point per X IDR spent
    'min_order_amount' => env('LOYALTY_MIN_ORDER_AMOUNT', 10000), // Minimum order to earn points
    'points_expiry_days' => env('LOYALTY_POINTS_EXPIRY_DAYS', 365),

    // Tier thresholds (lifetime spent in IDR)
    'tiers' => [
        'bronze' => 0,
        'silver' => 5000000,
        'gold' => 20000000,
        'platinum' => 50000000,
    ],

    // Bonus points settings
    'bonus_points' => [
        'first_order' => env('LOYALTY_BONUS_FIRST_ORDER', 50),
        'birthday_month' => env('LOYALTY_BONUS_BIRTHDAY', 100),
        'referral' => env('LOYALTY_BONUS_REFERRAL', 50),
    ],

    // Maximum redemption per transaction
    'max_redemption_percent' => env('LOYALTY_MAX_REDEMPTION_PERCENT', 50), // Max 50% of order value

    // Enable features
    'enabled' => env('LOYALTY_ENABLED', true),
    'rewards_enabled' => env('LOYALTY_REWARDS_ENABLED', true),
    'tier_enabled' => env('LOYALTY_TIER_ENABLED', true),
];