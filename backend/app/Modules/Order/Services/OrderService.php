<?php

namespace App\Modules\Order\Services;

use App\Services\PosService;

class OrderService
{
    public function __construct(private readonly PosService $posService)
    {
    }

    public function create(string $source, string $createdBy, ?int $tableId, string $notes = '', ?int $tenantId = null, ?int $outletId = null, ?int $shiftId = null): array
    {
        return $this->posService->createOrder($source, $createdBy, $tableId, $notes, $tenantId, $outletId, $shiftId);
    }

    public function addItem(string $username, int $orderId, int $productId, int $qty, string $notes = ''): array
    {
        return $this->posService->addItem($username, $orderId, $productId, $qty, $notes);
    }
}
