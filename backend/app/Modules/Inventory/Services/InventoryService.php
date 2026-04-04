<?php

namespace App\Modules\Inventory\Services;

use App\Services\StockService;

class InventoryService
{
    public function __construct(private readonly StockService $stockService)
    {
    }

    public function increase(int $productId, int $qty): void
    {
        $this->stockService->increase($productId, $qty);
    }

    public function decrease(int $productId, int $qty): void
    {
        $this->stockService->decrease($productId, $qty);
    }
}
