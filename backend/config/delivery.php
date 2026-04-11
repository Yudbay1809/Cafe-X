<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Delivery Platform Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for GoFood, GrabFood, and ShopeeFood integration.
    | Set base_url to sandbox for testing, production for live.
    |
    */

    'gofood' => [
        'enabled' => env('DELIVERY_GOFOOD_ENABLED', false),
        'base_url' => env('DELIVERY_GOFOOD_URL', 'https://api.gofood.co.id'),
        'api_key' => env('DELIVERY_GOFOOD_API_KEY', ''),
        'secret_key' => env('DELIVERY_GOFOOD_SECRET', ''),
        'store_id' => env('DELIVERY_GOFOOD_STORE_ID', ''),
    ],

    'grabfood' => [
        'enabled' => env('DELIVERY_GRABFOOD_ENABLED', false),
        'base_url' => env('DELIVERY_GRABFOOD_URL', 'https://api.grab.com'),
        'api_key' => env('DELIVERY_GRABFOOD_API_KEY', ''),
        'secret_key' => env('DELIVERY_GRABFOOD_SECRET', ''),
        'store_id' => env('DELIVERY_GRABFOOD_STORE_ID', ''),
    ],

    'shopeefood' => [
        'enabled' => env('DELIVERY_SHOPEEFOOD_ENABLED', false),
        'base_url' => env('DELIVERY_SHOPEEFOOD_URL', 'https://partner.shopeefood.co.id'),
        'api_key' => env('DELIVERY_SHOPEEFOOD_API_KEY', ''),
        'secret_key' => env('DELIVERY_SHOPEEFOOD_SECRET', ''),
        'store_id' => env('DELIVERY_SHOPEEFOOD_STORE_ID', ''),
    ],
];