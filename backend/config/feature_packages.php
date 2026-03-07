<?php

return [
    'plans' => [
        'basic' => [
            'reports.basic',
            'table.qr',
            'sync.basic',
        ],
        'pro' => [
            'reports.basic',
            'reports.advanced',
            'table.qr',
            'sync.basic',
            'sync.advanced',
            'multi.outlet',
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
        ],
    ],
];
