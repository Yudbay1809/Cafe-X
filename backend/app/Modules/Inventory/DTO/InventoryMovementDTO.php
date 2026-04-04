<?php

namespace App\Modules\Inventory\DTO;

class InventoryMovementDTO
{
    public function __construct(
        public readonly int $productId,
        public readonly int $qtyDelta,
        public readonly string $type,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (int) ($data['product_id'] ?? 0),
            (int) ($data['qty_delta'] ?? 0),
            (string) ($data['movement_type'] ?? ''),
        );
    }
}
