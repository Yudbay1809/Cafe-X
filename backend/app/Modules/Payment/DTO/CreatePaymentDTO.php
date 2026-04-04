<?php

namespace App\Modules\Payment\DTO;

class CreatePaymentDTO
{
    public function __construct(
        public readonly string $method,
        public readonly float $amount,
        public readonly string $referenceNo,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string) ($data['method'] ?? 'cash'),
            (float) ($data['amount'] ?? 0),
            (string) ($data['reference_no'] ?? ''),
        );
    }
}
