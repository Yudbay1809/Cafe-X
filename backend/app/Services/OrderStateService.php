<?php

namespace App\Services;

class OrderStateService
{
    /**
     * Allowed order transitions.
     *
     * new -> preparing -> ready -> served -> paid
     * any non-paid state -> canceled
     */
    private const MAP = [
        'new' => ['preparing', 'canceled', 'paid'],
        'preparing' => ['ready', 'canceled', 'paid'],
        'ready' => ['served', 'canceled', 'paid'],
        'served' => ['paid'],
        'paid' => [],
        'canceled' => [],
    ];

    public function canTransition(string $from, string $to): bool
    {
        if (!isset(self::MAP[$from])) {
            return false;
        }
        return in_array($to, self::MAP[$from], true);
    }

    public function allowedTargets(string $from): array
    {
        return self::MAP[$from] ?? [];
    }
}
