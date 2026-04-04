<?php

namespace App\Modules\Product\DTO;

class UpsertProductDTO
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $category,
        public readonly float $price,
        public readonly int $stock,
        public readonly ?string $imageUrl,
        public readonly bool $isActive,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            (string) ($data['nama_menu'] ?? ''),
            isset($data['jenis_menu']) ? (string) $data['jenis_menu'] : null,
            (float) ($data['harga'] ?? 0),
            (int) ($data['stok'] ?? 0),
            isset($data['gambar']) ? (string) $data['gambar'] : null,
            (bool) ($data['is_active'] ?? true),
        );
    }
}
