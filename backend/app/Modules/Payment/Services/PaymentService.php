<?php

namespace App\Modules\Payment\Services;

use App\Services\PosService;

class PaymentService
{
    public function __construct(private readonly PosService $posService)
    {
    }

    public function pay(string $actor, int $orderId, string $method, float $amount, string $referenceNo = ''): array
    {
        return $this->posService->payOrder($actor, $orderId, $method, $amount, $referenceNo);
    }
}
