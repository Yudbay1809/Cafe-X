<?php

return [
    'plans' => [
        'basic' => [
            'reports.basic',
            'table.qr',
            'sync.basic',
            'billing.basic',
            'onboarding.basic',
            'demo.reset',
        ],
        'pro' => [
            'reports.basic',
            'reports.advanced',
            'table.qr',
            'sync.basic',
            'sync.advanced',
            'multi.outlet',
            'billing.basic',
            'onboarding.basic',
            'demo.reset',
        ],
        'premium' => [
            'reports.basic',
            'reports.advanced',
            'table.qr',
            'sync.basic',
            'sync.advanced',
            'multi.outlet',
            'loyalty',
            'integrations',
            'billing.basic',
            'onboarding.basic',
            'demo.reset',
        ],
    ],
];
