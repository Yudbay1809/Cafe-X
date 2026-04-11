<?php

return [
    /*
    |--------------------------------------------------------------------------
    | QRIS Payment Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for QRIS (Quick Response Indonesian Standard) payment.
    | QRIS is the national standard for QR code payments in Indonesia.
    |
    | Supported providers:
    | - Gopay (gojek)
    | - OVO (lippo)
    | - ShopeePay
    | - Dana
    | - Other QRIS aggregators
    |
    */

    'enabled' => env('QRIS_ENABLED', false),

    // QRIS aggregator/gateway configuration
    'merchant_id' => env('QRIS_MERCHANT_ID', ''),
    'merchant_alias' => env('QRIS_MERCHANT_ALIAS', ''),
    'api_key' => env('QRIS_API_KEY', ''),

    // API endpoint (sandbox for testing)
    'base_url' => env('QRIS_BASE_URL', 'https://qris-payment.co.id'),

    // Callback URL for payment notifications
    'callback_url' => env('QRIS_CALLBACK_URL', ''),

    // Payment expiry time in minutes
    'expiry_minutes' => env('QRIS_EXPIRY_MINUTES', 5),

    // Enable debug logging
    'debug' => env('QRIS_DEBUG', false),
];