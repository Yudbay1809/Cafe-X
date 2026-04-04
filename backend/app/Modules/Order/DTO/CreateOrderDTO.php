<?php

namespace App\Modules\Order\DTO;

class CreateOrderDTO
{
    public function __construct(
        public readonly string $source,
        public readonly string $createdBy,
        public readonly ?int $tableId,
        public readonly string $notes,
        public readonly ?int $tenantId,
        public readonly ?int $outletId,
        public readonly ?int $shiftId,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string) ($data['source'] ?? 'POS'),
            (string) ($data['created_by'] ?? ''),
            isset($data['table_id']) ? (int) $data['table_id'] : null,
            (string) ($data['notes'] ?? ''),
            isset($data['tenant_id']) ? (int) $data['tenant_id'] : null,
            isset($data['outlet_id']) ? (int) $data['outlet_id'] : null,
            isset($data['shift_id']) ? (int) $data['shift_id'] : null,
        );
    }
}
